use crate::constants::{
  DEFAULT_EDGE_THRESHOLD, MAX_EDGES, THRESHOLD_MAX, THRESHOLD_MIN, W_API, W_DATAFLOW, W_DECORATOR,
  W_MINHASH, W_RI, W_STRUCT_PROFILE, W_TFIDF, W_TYPE,
};

/// Signal weights for [`crate::combined_score`]. Must sum to ~1.0; proximity is a multiplier.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SemanticConfig {
  pub w_tfidf: f32,
  pub w_ri: f32,
  pub w_minhash: f32,
  pub w_api: f32,
  pub w_type: f32,
  pub w_decorator: f32,
  pub w_struct_profile: f32,
  pub w_dataflow: f32,
  pub threshold: f32,
  pub max_edges: usize,
}

impl Default for SemanticConfig {
  fn default() -> Self {
    Self {
      w_tfidf: W_TFIDF,
      w_ri: W_RI,
      w_minhash: W_MINHASH,
      w_api: W_API,
      w_type: W_TYPE,
      w_decorator: W_DECORATOR,
      w_struct_profile: W_STRUCT_PROFILE,
      w_dataflow: W_DATAFLOW,
      threshold: DEFAULT_EDGE_THRESHOLD,
      max_edges: MAX_EDGES,
    }
  }
}

impl SemanticConfig {
  /// Default config with optional `POWER_PLANT_SEMANTIC_THRESHOLD` override.
  #[must_use]
  pub fn from_env() -> Self {
    let mut cfg = Self::default();
    if let Ok(thresh) = std::env::var("POWER_PLANT_SEMANTIC_THRESHOLD") {
      if let Ok(parsed) = thresh.parse::<f64>() {
        let parsed = parsed as f32;
        if parsed > THRESHOLD_MIN && parsed <= THRESHOLD_MAX {
          cfg.threshold = parsed;
        }
      }
    }
    cfg
  }
}
