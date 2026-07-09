use crate::constants::MINHASH_K;

/// MinHash signature (`K` minimum hash values).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MinHash {
    pub values: [u32; MINHASH_K],
}

impl Default for MinHash {
    fn default() -> Self {
        Self {
            values: [0; MINHASH_K],
        }
    }
}

/// Exact Jaccard estimate from two MinHash signatures, in `[0.0, 1.0]`.
#[must_use]
pub fn minhash_jaccard(a: &MinHash, b: &MinHash) -> f64 {
    let matching = a
        .values
        .iter()
        .zip(b.values.iter())
        .filter(|(x, y)| x == y)
        .count();
    matching as f64 / MINHASH_K as f64
}
