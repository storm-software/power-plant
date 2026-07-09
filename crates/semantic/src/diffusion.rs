use crate::constants::{DIM, UNIT_POS};
use crate::vector::{SemVector, normalize};

/// One graph-diffusion iteration: blend with mean of neighbor embeddings.
pub fn diffuse(combined: &mut SemVector, neighbors: &[SemVector], alpha: f32) {
    if neighbors.is_empty() {
        return;
    }

    let mut mean = SemVector::default();
    for neighbor in neighbors {
        for i in 0..DIM {
            mean.v[i] += neighbor.v[i];
        }
    }

    let inv_n = UNIT_POS / neighbors.len() as f32;
    let one_minus_alpha = UNIT_POS - alpha;
    for i in 0..DIM {
        combined.v[i] = one_minus_alpha * combined.v[i] + alpha * mean.v[i] * inv_n;
    }
    normalize(combined);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn diffuse_blends_toward_neighbors() {
        let mut base = SemVector::default();
        base.v[0] = 1.0;
        let mut neighbor = SemVector::default();
        neighbor.v[1] = 1.0;
        diffuse(&mut base, &[neighbor], 0.5);
        assert!(base.v[0] > 0.0);
        assert!(base.v[1] > 0.0);
    }
}
