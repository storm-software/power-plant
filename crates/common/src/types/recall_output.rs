use power_plant_models::Execution;
use serde::{Deserialize, Serialize};

/// Output of a recall operation.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RecallOutput {
  /// The recalled execution.
  pub execution: Execution,
}
