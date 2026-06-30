use thiserror::Error;

/// Errors returned by execution storage backends.
#[derive(Debug, Clone, Error, PartialEq, Eq)]
pub enum StorageError {
  /// No execution exists for the requested id.
  #[error("execution not found: {0}")]
  NotFound(String),

  /// Failed to read or write execution data.
  #[error("io error: {0}")]
  Io(String),

  /// Stored data could not be deserialized.
  #[error("invalid execution data: {0}")]
  InvalidData(String),

  /// A graph or vector query failed.
  #[error("query error: {0}")]
  Query(String),

  /// Indexing execution metadata failed.
  #[error("index error: {0}")]
  Index(String),
}
