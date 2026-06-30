use std::fs;
use std::path::PathBuf;

use camino::Utf8PathBuf;
use power_plant_models::Execution;

use crate::{ExecutionStore, StorageError};

/// Filesystem-backed execution store.
///
/// Executions are serialized as JSON at `{base_path}/{execution_id}.json`.
pub struct FsExecutionStore {
  base_path: Utf8PathBuf,
}

impl FsExecutionStore {
  /// Create a store rooted at `base_path`.
  #[must_use]
  pub fn new(base_path: impl Into<Utf8PathBuf>) -> Self {
    Self { base_path: base_path.into() }
  }

  fn execution_path(&self, execution_id: &str) -> Utf8PathBuf {
    self.base_path.join(format!("{execution_id}.json"))
  }

  fn ensure_base_path(&self) -> Result<(), StorageError> {
    fs::create_dir_all(&self.base_path)
      .map_err(|err| StorageError::Io(format!("failed to create '{}': {err}", self.base_path)))
  }
}

impl ExecutionStore for FsExecutionStore {
  fn store(&self, execution: &Execution) -> Result<(), StorageError> {
    self.ensure_base_path()?;

    let path = self.execution_path(&execution.meta.id);
    let json = serde_json::to_vec_pretty(execution).map_err(|err| {
      StorageError::InvalidData(format!("failed to serialize execution: {err}"))
    })?;

    if let Some(parent) = path.parent() {
      fs::create_dir_all(parent).map_err(|err| {
        StorageError::Io(format!("failed to create '{}': {err}", parent))
      })?;
    }

    fs::write(&path, json)
      .map_err(|err| StorageError::Io(format!("failed to write '{}': {err}", path)))
  }

  fn recall(&self, execution_id: &str) -> Result<Execution, StorageError> {
    let path = self.execution_path(execution_id);
    let bytes = fs::read(&path).map_err(|err| {
      if err.kind() == std::io::ErrorKind::NotFound {
        StorageError::NotFound(execution_id.to_string())
      } else {
        StorageError::Io(format!("failed to read '{}': {err}", path))
      }
    })?;

    serde_json::from_slice(&bytes).map_err(|err| {
      StorageError::InvalidData(format!("failed to deserialize '{}': {err}", path))
    })
  }
}

impl From<FsExecutionStore> for PathBuf {
  fn from(value: FsExecutionStore) -> Self {
    value.base_path.into()
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
  use power_plant_models::{ExecutionDocument, ExecutionMeta, ExecutionSource, ExecutionSourceMeta, GeneratorMeta, InputMeta, Meta, OutputMeta, SchemaMeta};

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
        extension: "ts".into(),
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
      meta: ExecutionMeta {
        id: id.into(),
        executed_at: Utc::now(),
        executed_by: "tester".into(),
      },
    }
  }

  #[test]
  fn store_and_recall_round_trip() {
    let temp_dir = std::env::temp_dir().join(format!("power-plant-storage-{}", std::process::id()));
    let store = FsExecutionStore::new(Utf8PathBuf::from_path_buf(temp_dir.clone()).unwrap());
    let execution = sample_execution("exec-1");

    store.store(&execution).unwrap();
    let recalled = store.recall("exec-1").unwrap();

    assert_eq!(recalled, execution);

    let _ = fs::remove_dir_all(temp_dir);
  }

  #[test]
  fn recall_missing_execution_returns_not_found() {
    let temp_dir = std::env::temp_dir().join(format!("power-plant-storage-{}", std::process::id()));
    let store = FsExecutionStore::new(Utf8PathBuf::from_path_buf(temp_dir.clone()).unwrap());

    let err = store.recall("missing").unwrap_err();
    assert_eq!(err, StorageError::NotFound("missing".into()));

    let _ = fs::remove_dir_all(temp_dir);
  }
}
