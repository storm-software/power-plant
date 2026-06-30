use serde::{Deserialize, Serialize};

/// A single execution metadata search hit.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExecutionSearchHit {
  /// The id of the matching execution.
  #[serde(rename = "executionId")]
  pub execution_id: String,
  /// Relevance score when provided by the search backend.
  pub score: Option<f64>,
  /// Short excerpt from the matched metadata, when available.
  pub snippet: Option<String>,
}

/// Output of an execution metadata search.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SearchOutput {
  /// Matching executions ordered by relevance.
  pub hits: Vec<ExecutionSearchHit>,
}
