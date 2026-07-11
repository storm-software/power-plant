//! Algorithmic code embeddings for semantic similarity.
//!
//! Code co-occurrence enrichment, MinHash, API/Type/Decorator signatures, structural
//! profiles, combined scoring, and graph diffusion.

mod config;
mod constants;
mod corpus;
mod diffusion;
mod function;
mod minhash;
mod pretrained;
mod score;
mod tokenize;
mod vector;

#[cfg(feature = "ast-minhash")]
mod ast_minhash;

#[cfg(feature = "nomic-pretrained")]
mod nomic_pretrained;

pub use config::SemanticConfig;
pub use constants::{
  AST_PROFILE_DIMS, DEFAULT_EDGE_THRESHOLD, DIM, MAX_EDGES, MAX_OCCUR, MAX_TOKENS,
  MINHASH_JACCARD_THRESHOLD, MINHASH_K, SPARSE_NNZE, WINDOW,
};
pub use corpus::Corpus;
pub use diffusion::diffuse;
pub use function::SemanticFunc;
pub use minhash::{MinHash, minhash_jaccard};
pub use pretrained::{EmptyPretrained, PretrainedEmbeddings};
pub use score::{combined_score, proximity};
pub use tokenize::tokenize;
pub use vector::{SemVector, cosine, normalize, random_index, vec_add_scaled};

#[cfg(feature = "ast-minhash")]
pub use ast_minhash::{
  AstMinHash, MIN_AST_TOKENS, ast_minhash_jaccard, ast_minhash_to_cbm, compute_ast_minhash,
};
#[cfg(feature = "ast-minhash")]
pub use normalize_code_similarity::{
  LSH_BANDS, LSH_ROWS, SHINGLE_K, compute_function_hash, find_function_node, lsh_band_hash,
};

#[cfg(feature = "nomic-pretrained")]
pub use nomic_pretrained::{
  DefaultPretrained, NomicPretrained, NomicPretrainedError, default_pretrained,
};

/// Whether semantic embeddings are enabled (`POWER_PLANT_SEMANTIC_ENABLED=1`).
#[must_use]
pub fn is_enabled() -> bool {
  std::env::var("POWER_PLANT_SEMANTIC_ENABLED").is_ok_and(|v| v == "1")
}

/// Eagerly initialize pretrained token lookup (no-op when using [`EmptyPretrained`]).
pub fn ensure_ready(pretrained: &dyn PretrainedEmbeddings) {
  pretrained.ensure_ready();
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn tokenize_splits_camel_case() {
    let tokens = tokenize("getUserContext", 16);
    assert!(tokens.iter().any(|t| t == "get"));
    assert!(tokens.iter().any(|t| t == "user"));
    assert!(tokens.iter().any(|t| t == "context"));
  }

  #[test]
  fn cosine_identical_unit_vectors() {
    let mut v = SemVector::default();
    v.v[0] = 1.0;
    assert!((cosine(&v, &v) - 1.0).abs() < 1e-6);
  }

  #[test]
  fn combined_score_same_function_high() {
    let cfg = SemanticConfig::default();
    let func = SemanticFunc {
      file_path: "src/a.rs",
      tfidf_indices: vec![0, 2],
      tfidf_weights: vec![0.5, 0.5],
      ri_vec: {
        let mut v = SemVector::default();
        v.v[0] = 1.0;
        v
      },
      api_vec: SemVector::default(),
      type_vec: SemVector::default(),
      deco_vec: SemVector::default(),
      struct_profile: [0.0; AST_PROFILE_DIMS],
      has_minhash: false,
      minhash: MinHash::default(),
      ..SemanticFunc::default()
    };
    let score = combined_score(&func, &func, &cfg);
    assert!(score > 0.4);
  }
}
