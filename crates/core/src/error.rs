//! Error types for Power Plant engine.

pub trait PowerPlantError {
  fn kind(&self) -> String;
  fn message(&self) -> String;
}

pub type PowerPlantResult<T> = Result<T, Box<dyn PowerPlantError + Send + Sync>>;
