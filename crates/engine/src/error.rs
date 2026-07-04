//! Error types for Power Plant engine.

use power_plant_core::PowerPlantError;
use thiserror::Error;

/// Errors that can occur during Power Plant engine operations.
#[derive(Error, Debug)]
pub enum PowerPlantEngineError {
  /// Engine is closed.
  #[error("Engine is closed")]
  EngineClosed,
  /// Engine is not initialized.
  #[error("Engine is not initialized")]
  EngineNotInitialized,
  /// Storage error.
  #[error("Storage error: {0}")]
  StorageError(String),
}

impl PowerPlantError for PowerPlantEngineError {
  fn kind(&self) -> String {
    "Engine".to_string()
  }

  fn message(&self) -> String {
    self.to_string()
  }
}

/// Result type for Power Plant engine operations.
pub type PowerPlantEngineResult<T> = Result<T, PowerPlantEngineError>;
