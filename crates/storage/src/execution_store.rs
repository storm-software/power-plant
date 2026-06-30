use power_plant_models::Execution;

use crate::StorageError;

/// Persistence layer for generator [`Execution`] records.
pub trait ExecutionStore: Send + Sync {
  /// Persist an execution, keyed by [`Execution::meta`] id.
  fn store(&self, execution: &Execution) -> Result<(), StorageError>;

  /// Load a previously stored execution by id.
  fn recall(&self, execution_id: &str) -> Result<Execution, StorageError>;
}
