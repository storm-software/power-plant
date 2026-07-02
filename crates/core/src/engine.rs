use derive_more::Debug;
use power_plant_common::{
  NormalizedOptions, Options, RecallInput, RecallOutput, SearchInput, SearchOutput, StoreInput,
  StoreOutput,
};
use power_plant_error::PowerPlantResult;
#[cfg(feature = "ladybug")]
use power_plant_storage::IndexedExecutionStore;
use power_plant_storage::{ExecutionStore, FsExecutionStore, StorageError};
use power_plant_tracing::{Session, actions::StoreEnd, actions::StoreStart, trace_action};
use std::future::{Future, ready};
use std::sync::Arc;

#[derive(Debug)]
pub struct Engine {
  pub(super) session: Session,
  pub(super) options: NormalizedOptions,
  #[debug(skip)]
  pub(super) execution_store: Arc<dyn ExecutionStore>,
  pub(super) is_closed: bool,
}

impl Engine {
  pub fn new(options: Options) -> PowerPlantResult<Self> {
    let normalized_options = NormalizedOptions::from(options);
    let executions_path = normalized_options.paths.data_path.join("executions");
    let execution_store = create_execution_store(executions_path)?;

    Ok(Self {
      options: normalized_options,
      is_closed: false,
      session: Session::dummy(),
      execution_store,
    })
  }

  pub fn is_closed(&self) -> bool {
    self.is_closed
  }

  pub fn store(&mut self, input: StoreInput) -> PowerPlantResult<StoreOutput> {
    self.create_error_if_closed()?;

    let execution_id = input.execution.meta.id.clone();
    trace_action!(StoreStart { action: "StoreStart", execution_id: execution_id.clone() });

    self.execution_store.store(&input.execution).map_err(storage_error)?;

    trace_action!(StoreEnd { action: "StoreEnd", execution_id });

    Ok(StoreOutput { success: true, warnings: vec![] })
  }

  pub fn recall(&mut self, input: RecallInput) -> PowerPlantResult<RecallOutput> {
    self.create_error_if_closed()?;

    let execution = self.execution_store.recall(&input.execution_id).map_err(storage_error)?;

    Ok(RecallOutput { execution })
  }

  pub fn search(&mut self, input: SearchInput) -> PowerPlantResult<SearchOutput> {
    self.create_error_if_closed()?;

    let output = self.execution_store.search(&input).map_err(storage_error)?;

    Ok(output)
  }

  #[must_use = "Future must be awaited to do the actual cleanup work"]
  pub fn close(&mut self) -> impl Future<Output = anyhow::Result<()>> + Send + 'static {
    self.is_closed = true;
    ready(Ok(()))
  }

  pub(super) fn create_error_if_closed(&self) -> PowerPlantResult<()> {
    if self.is_closed {
      Err(anyhow::anyhow!("Engine is closed"))?;
    }

    Ok(())
  }
}

fn storage_error(error: StorageError) -> power_plant_error::BatchedPowerPlantDiagnostic {
  anyhow::anyhow!(error.to_string()).into()
}

fn create_execution_store(
  executions_path: camino::Utf8PathBuf,
) -> PowerPlantResult<Arc<dyn ExecutionStore>> {
  let fs_store = FsExecutionStore::new(executions_path.clone());

  #[cfg(feature = "ladybug")]
  {
    let index_path = executions_path
      .parent()
      .map(|path| path.join("execution-index"))
      .unwrap_or_else(|| executions_path.join("index"));

    let store = IndexedExecutionStore::new(fs_store, index_path.as_str()).map_err(storage_error)?;
    return Ok(Arc::new(store));
  }

  #[cfg(not(feature = "ladybug"))]
  {
    Ok(Arc::new(fs_store))
  }
}

#[cfg(test)]
#[allow(
  clippy::unwrap_used,
  clippy::expect_used,
  reason = "test code — panics are acceptable failures"
)]
mod tests {
  use super::*;
  use chrono::Utc;
  use power_plant_common::SearchInput;
  use power_plant_models::{
    Execution, ExecutionDocument, ExecutionMeta, ExecutionSource, ExecutionSourceMeta,
    GeneratorMeta, InputMeta, Meta, OutputMeta, SchemaMeta,
  };
  use power_plant_storage::InMemoryExecutionStore;

  fn sample_execution(id: &str) -> Execution {
    let meta = Meta {
      id: "schema".into(),
      name: "schema".into(),
      version: serde_json::json!("1.0.0"),
      description: "desc".into(),
      title: "title".into(),
      usage: None,
      deprecated: None,
      tags: None,
      links: vec![],
    };

    Execution {
      documents: vec![ExecutionDocument {
        name: "doc".into(),
        path: "src/doc.ts".into(),
        extension: Some("ts".into()),
        source: vec![ExecutionSource {
          language: "typescript".into(),
          content: "export {}".into(),
          meta: ExecutionSourceMeta {
            options: serde_json::json!({}),
            spec: serde_json::json!({}),
            generator: GeneratorMeta { description: None },
            schema: SchemaMeta { meta: meta.clone(), examples: vec![] },
            input: InputMeta { meta: meta.clone(), input: None },
            output: OutputMeta { meta, produces: None },
          },
        }],
      }],
      meta: ExecutionMeta { id: id.into(), executed_at: Utc::now(), executed_by: "tester".into() },
    }
  }

  fn engine_with_store(store: Arc<dyn ExecutionStore>) -> Engine {
    Engine {
      session: Session::dummy(),
      options: NormalizedOptions::default(),
      execution_store: store,
      is_closed: false,
    }
  }

  #[test]
  fn store_recall_and_search_execution() {
    let store = Arc::new(InMemoryExecutionStore::default());
    let mut engine = engine_with_store(store);
    let execution = sample_execution("exec-1");

    let store_output = engine.store(StoreInput { execution: execution.clone() }).unwrap();
    assert!(store_output.success);

    let recall_output = engine.recall(RecallInput { execution_id: "exec-1".into() }).unwrap();
    assert_eq!(recall_output.execution, execution);

    let search_output = engine
      .search(SearchInput {
        query: Some("doc".into()),
        executed_by: Some("tester".into()),
        schema: None,
        generator: None,
        tags: None,
        embedding: None,
        limit: Some(10),
      })
      .unwrap();
    assert_eq!(search_output.hits.len(), 1);
    assert_eq!(search_output.hits[0].execution_id, "exec-1");
  }
}
