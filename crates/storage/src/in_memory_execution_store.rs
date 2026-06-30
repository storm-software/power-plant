use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use power_plant_models::Execution;

use crate::{ExecutionStore, StorageError};

/// In-memory execution store for tests.
#[derive(Clone, Default)]
pub struct InMemoryExecutionStore {
  executions: Arc<Mutex<HashMap<String, Execution>>>,
}

impl ExecutionStore for InMemoryExecutionStore {
  fn store(&self, execution: &Execution) -> Result<(), StorageError> {
    self
      .executions
      .lock()
      .map_err(|_| StorageError::Io("in-memory store lock poisoned".into()))?
      .insert(execution.meta.id.clone(), execution.clone());
    Ok(())
  }

  fn recall(&self, execution_id: &str) -> Result<Execution, StorageError> {
    self
      .executions
      .lock()
      .map_err(|_| StorageError::Io("in-memory store lock poisoned".into()))?
      .get(execution_id)
      .cloned()
      .ok_or_else(|| StorageError::NotFound(execution_id.to_string()))
  }
}
