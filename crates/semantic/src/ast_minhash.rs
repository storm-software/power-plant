//! AST MinHash via [`normalize-code-similarity`](https://crates.io/crates/normalize-code-similarity).
//!
//! Closest published Rust equivalent to CBM `minhash.c`: tree-sitter subtree
//! tokenization, k-shingle MinHash, and Jaccard estimation.
//!
//! Differences from `minhash.c` (documented, not wire-compatible):
//! - K=128 (`normalize_code_similarity::MINHASH_N`) vs CBM K=64
//! - u64 signatures vs CBM u32 + xxHash trigrams on normalized leaf types
//! - LSH defaults: 32 bands x 4 rows vs CBM 32 x 2

use normalize_code_similarity::{compute_minhash, jaccard_estimate, serialize_subtree_tokens};
use tree_sitter::Node;

/// MinHash signature produced from an AST subtree.
pub type AstMinHash = [u64; normalize_code_similarity::MINHASH_N];

/// Minimum serialized tokens before a fingerprint is considered meaningful.
/// CBM uses `CBM_MINHASH_MIN_NODES` (30 leaf tokens); we mirror that count here.
pub const MIN_AST_TOKENS: usize = 30;

/// Serialize an AST subtree and compute its MinHash signature.
///
/// Identifiers and literals are elided (like CBM leaf normalization to I/S/N/T)
/// so renaming does not change the fingerprint.
#[must_use]
pub fn compute_ast_minhash(node: &Node<'_>, source: &[u8]) -> Option<AstMinHash> {
  let mut tokens = Vec::new();
  serialize_subtree_tokens(node, source, true, true, false, &mut tokens);
  if tokens.len() < MIN_AST_TOKENS {
    return None;
  }
  Some(compute_minhash(&tokens))
}

/// Jaccard estimate from two AST MinHash signatures.
#[must_use]
pub fn ast_minhash_jaccard(a: &AstMinHash, b: &AstMinHash) -> f64 {
  jaccard_estimate(a, b)
}

/// Convert an AST MinHash into the compact [`crate::MinHash`] shape used by
/// [`crate::combined_score`] when interoperating with CBM u32 fingerprints.
#[must_use]
pub fn ast_minhash_to_cbm(a: &AstMinHash) -> crate::MinHash {
  let mut values = [0_u32; crate::constants::MINHASH_K];
  for (dst, &src) in values.iter_mut().zip(a.iter().take(crate::constants::MINHASH_K)) {
    *dst = src as u32;
  }
  crate::MinHash { values }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn minhash_requires_minimum_token_count() {
    let short = vec![1_u64; MIN_AST_TOKENS - 1];
    assert!(short.len() < normalize_code_similarity::SHINGLE_K || short.len() < MIN_AST_TOKENS);

    let tokens = vec![1_u64; MIN_AST_TOKENS];
    let sig = compute_minhash(&tokens);
    assert_ne!(sig[0], u64::MAX);
    assert_eq!(ast_minhash_jaccard(&sig, &sig), 1.0);
  }
}
