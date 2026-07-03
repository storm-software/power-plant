use serde::{Deserialize, Serialize};

/// Input for recalling a stored execution.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RecallInput {
  /// The id of the execution to recall.
  pub execution_id: String,
}
