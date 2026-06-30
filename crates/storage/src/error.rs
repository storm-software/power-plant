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
}
