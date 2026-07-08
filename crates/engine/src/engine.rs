use derive_more::Debug;
use power_plant_core::{
  Options,
  context::Context,
  inputs::{RecallInput, SearchInput, StoreInput},
  outputs::{GetSessionOutput, GetSettingsOutput, RecallOutput, SearchOutput, StoreOutput},
};
#[cfg(feature = "ladybug")]
use power_plant_storage::IndexedExecutionStore;
use power_plant_storage::{ExecutionStore, FsExecutionStore, StorageError};
use std::future::{Future, ready};
use std::sync::Arc;

use crate::{PowerPlantEngineError, PowerPlantEngineResult};

#[derive(Debug, Clone)]
pub struct Engine {
  pub(super) context: Context,
  #[debug(skip)]
  pub(super) execution_store: Arc<dyn ExecutionStore>,
  pub(super) is_closed: bool,
}

impl Engine {
  #[tracing::instrument(skip(options), level = "trace")]
  pub fn new(options: Options) -> PowerPlantEngineResult<Self> {
    let context = Context::new(options);

    let executions_path = context.settings.paths.data.join("executions").into();
    let execution_store = create_execution_store(executions_path)?;

    Ok(Self { context, execution_store, is_closed: false })
  }

  pub fn is_closed(&self) -> bool {
    self.is_closed
  }

  #[tracing::instrument(skip_all, level = "trace")]
  pub fn get_settings(&self) -> PowerPlantEngineResult<GetSettingsOutput> {
    Ok(GetSettingsOutput::from(self.context.settings.clone()))
  }

  #[tracing::instrument(skip_all, level = "trace")]
  pub fn get_session(&self) -> PowerPlantEngineResult<GetSessionOutput> {
    Ok(GetSessionOutput::from(self.context.session.clone()))
  }

  #[tracing::instrument(skip(self, input), fields(execution_id = %input.execution.meta.id), level = "trace")]
  pub fn store(&mut self, input: StoreInput) -> PowerPlantEngineResult<StoreOutput> {
    self.create_error_if_closed()?;

    let execution_id = input.execution.meta.id.clone();
    tracing::trace!(action = "StoreStart", execution_id = %execution_id);

    self.execution_store.store(&input.execution).map_err(storage_error)?;

    tracing::trace!(action = "StoreEnd", execution_id = %execution_id);

    Ok(StoreOutput { success: true, errors: vec![] })
  }

  #[tracing::instrument(skip(self, input), fields(execution_id = %input.execution_id), level = "trace")]
  pub fn recall(&mut self, input: RecallInput) -> PowerPlantEngineResult<RecallOutput> {
    self.create_error_if_closed()?;

    let execution = self.execution_store.recall(&input.execution_id).map_err(storage_error)?;

    Ok(RecallOutput { execution })
  }

  #[tracing::instrument(skip(self, input), fields(query = ?input.query, executed_by = ?input.executed_by, limit = ?input.limit), level = "trace")]
  pub fn search(&mut self, input: SearchInput) -> PowerPlantEngineResult<SearchOutput> {
    self.create_error_if_closed()?;

    let output = self.execution_store.search(&input).map_err(storage_error)?;

    Ok(output)
  }

  #[must_use = "Future must be awaited to do the actual cleanup work"]
  #[tracing::instrument(skip(self), level = "trace")]
  pub fn close(&mut self) -> impl Future<Output = PowerPlantEngineResult<()>> + Send + 'static {
    self.is_closed = true;
    ready(Ok(()))
  }

  pub(super) fn create_error_if_closed(&self) -> PowerPlantEngineResult<()> {
    if self.is_closed {
      Err(PowerPlantEngineError::EngineClosed)?;
    }

    Ok(())
  }
}

fn storage_error(error: StorageError) -> PowerPlantEngineError {
  PowerPlantEngineError::StorageError(error.to_string())
}

fn create_execution_store(
  executions_path: camino::Utf8PathBuf,
) -> PowerPlantEngineResult<Arc<dyn ExecutionStore>> {
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
  use power_plant_core::inputs::SearchInput;
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
        path: "src/doc.ts".into(),
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
    Engine { context: Context::new(Options::default()), execution_store: store, is_closed: false }
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
