use serde::{Deserialize, Serialize};

/// Input for searching stored execution metadata.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
pub struct SearchInput {
  /// Free-text query matched against indexed execution metadata.
  pub query: Option<String>,
  /// Filter by the user who performed the execution.
  #[serde(rename = "executedBy")]
  pub executed_by: Option<String>,
  /// Filter by schema name or id.
  pub schema: Option<String>,
  /// Filter by generator name or id.
  pub generator: Option<String>,
  /// Filter by tags; an execution matches when any tag is present.
  pub tags: Option<Vec<String>>,
  /// Optional embedding vector for semantic similarity search.
  ///
  /// Requires the `ladybug` storage feature and a populated vector index.
  pub embedding: Option<Vec<f32>>,
  /// Maximum number of results to return.
  pub limit: Option<u32>,
}
