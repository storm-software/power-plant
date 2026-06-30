#[cfg(feature = "ladybug")]
use std::sync::Arc;

use power_plant_common::{SearchInput, SearchOutput};
use power_plant_models::Execution;

use crate::{ExecutionStore, StorageError};

#[cfg(feature = "ladybug")]
use crate::ladybug::LadybugExecutionIndex;

/// Execution store that persists to a primary backend and indexes metadata for search.
pub struct IndexedExecutionStore<S> {
  inner: S,
  #[cfg(feature = "ladybug")]
  index: Arc<LadybugExecutionIndex>,
}

impl<S> IndexedExecutionStore<S> {
  /// Wrap `inner` with a Ladybug metadata index at `index_path`.
  #[cfg(feature = "ladybug")]
  pub fn new(inner: S, index_path: &str) -> Result<Self, StorageError> {
    let index = Arc::new(LadybugExecutionIndex::new(index_path)?);
    index.initialize()?;
    Ok(Self { inner, index })
  }
}

impl<S> ExecutionStore for IndexedExecutionStore<S>
where
  S: ExecutionStore,
{
  fn store(&self, execution: &Execution) -> Result<(), StorageError> {
    self.inner.store(execution)?;
    #[cfg(feature = "ladybug")]
    self.index.index_execution(execution)?;
    Ok(())
  }

  fn recall(&self, execution_id: &str) -> Result<Execution, StorageError> {
    self.inner.recall(execution_id)
  }

  fn search(&self, input: &SearchInput) -> Result<SearchOutput, StorageError> {
    #[cfg(feature = "ladybug")]
    {
      let hits = self.index.search(input)?;
      if !hits.is_empty() || input.embedding.is_some() {
        return Ok(SearchOutput { hits });
      }
    }

    self.inner.search(input)
  }
}
