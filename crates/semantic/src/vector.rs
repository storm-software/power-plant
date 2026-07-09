use xxhash_rust::xxh3::{xxh3_64, xxh3_64_with_seed};

use crate::constants::{DENOM_EPS, DIM, INT8_MAX, RI_SEED_BASE, SPARSE_NNZE, UNIT_POS};
use crate::pretrained::PretrainedEmbeddings;

/// Fixed-size dense vector for cosine similarity.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SemVector {
    pub v: [f32; DIM],
}

impl Default for SemVector {
    fn default() -> Self {
        Self { v: [0.0; DIM] }
    }
}

impl SemVector {
    pub fn clear(&mut self) {
        self.v = [0.0; DIM];
    }
}

/// Cosine similarity between two dense vectors.
#[must_use]
pub fn cosine(a: &SemVector, b: &SemVector) -> f32 {
    let mut dot = 0.0_f32;
    let mut mag_a = 0.0_f32;
    let mut mag_b = 0.0_f32;
    for i in 0..DIM {
        dot += a.v[i] * b.v[i];
        mag_a += a.v[i] * a.v[i];
        mag_b += b.v[i] * b.v[i];
    }
    let denom = mag_a.sqrt() * mag_b.sqrt();
    if denom < DENOM_EPS {
        return 0.0;
    }
    dot / denom
}

/// Deterministic sparse random vector for a token (xxHash seed).
pub fn random_index(token: &str, pretrained: &dyn PretrainedEmbeddings, out: &mut SemVector) {
    out.clear();
    if token.is_empty() {
        return;
    }

    if let Some(pvec) = pretrained.lookup(token) {
        let len = pvec.len().min(DIM);
        for d in 0..len {
            out.v[d] = pvec[d] as f32 / INT8_MAX;
        }
        return;
    }

    let seed = xxh3_64(token.as_bytes());
    for i in 0..SPARSE_NNZE {
        let i_bytes = (i as u64).to_le_bytes();
        let h = xxh3_64_with_seed(&i_bytes, seed.wrapping_add(RI_SEED_BASE));
        let pos = (h % DIM as u64) as usize;
        let sign = if h & 1 == 1 { UNIT_POS } else { -UNIT_POS };
        out.v[pos] += sign;
    }
}

/// Normalize a vector to unit length in-place.
pub fn normalize(v: &mut SemVector) {
    let mut mag = 0.0_f32;
    for x in &v.v {
        mag += x * x;
    }
    mag = mag.sqrt();
    if mag < DENOM_EPS {
        return;
    }
    let inv = UNIT_POS / mag;
    for x in &mut v.v {
        *x *= inv;
    }
}

/// `dst[i] += scale * src[i]`.
pub fn vec_add_scaled(dst: &mut SemVector, src: &SemVector, scale: f32) {
    for i in 0..DIM {
        dst.v[i] += scale * src.v[i];
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::pretrained::EmptyPretrained;

    #[test]
    fn random_index_is_deterministic() {
        let pretrained = EmptyPretrained;
        let mut a = SemVector::default();
        let mut b = SemVector::default();
        random_index("handler", &pretrained, &mut a);
        random_index("handler", &pretrained, &mut b);
        assert_eq!(a, b);
    }
}
