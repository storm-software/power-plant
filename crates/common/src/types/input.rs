use power_plant_models::Execution;
use serde::{Deserialize, Serialize};

/// The input to an execution.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StoreInput {
  /// The execution that produced the input.
  pub execution: Execution,
}
