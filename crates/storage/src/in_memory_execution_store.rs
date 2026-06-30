use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use power_plant_common::{ExecutionSearchHit, SearchInput, SearchOutput};
use power_plant_models::Execution;

use crate::{
  execution_metadata::{extract_execution_metadata, score_execution_metadata},
  ExecutionStore, StorageError,
};

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

  fn search(&self, input: &SearchInput) -> Result<SearchOutput, StorageError> {
    let limit = input.limit.unwrap_or(50) as usize;
    let executions = self
      .executions
      .lock()
      .map_err(|_| StorageError::Io("in-memory store lock poisoned".into()))?;

    let mut hits = executions
      .values()
      .filter_map(|execution| {
        let metadata = extract_execution_metadata(execution);
        score_execution_metadata(&metadata, input).map(|score| ExecutionSearchHit {
          execution_id: metadata.execution_id,
          score: Some(score),
          snippet: input.query.clone().or_else(|| Some(metadata.search_text.chars().take(160).collect())),
        })
      })
      .collect::<Vec<_>>();

    hits.sort_by(|left, right| {
      right
        .score
        .partial_cmp(&left.score)
        .unwrap_or(std::cmp::Ordering::Equal)
    });
    hits.truncate(limit);

    Ok(SearchOutput { hits })
  }
}
