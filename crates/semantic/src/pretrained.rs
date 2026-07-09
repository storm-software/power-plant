//! Optional nomic-embed-code pretrained token vectors.

use crate::constants::DIM;

/// Lookup table for pretrained int8 code embeddings.
pub trait PretrainedEmbeddings: Send + Sync {
    /// Warm the lookup map before parallel work.
    fn ensure_ready(&self) {}

    /// Return a dense int8 vector for `token`, if present in the vocab.
    fn lookup(&self, token: &str) -> Option<[i8; DIM]>;
}

/// Default: no pretrained vocab; all tokens use sparse random indexing.
#[derive(Debug, Clone, Copy, Default)]
pub struct EmptyPretrained;

impl PretrainedEmbeddings for EmptyPretrained {
    fn lookup(&self, _token: &str) -> Option<[i8; DIM]> {
        None
    }
}
