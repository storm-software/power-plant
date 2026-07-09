use crate::config::SemanticConfig;
use crate::constants::{
    AST_PROFILE_DIMS, DENOM_EPS, MINHASH_JACCARD_THRESHOLD, PROX_MAX_BOOST, UNIT_POS,
};
use crate::function::SemanticFunc;
use crate::minhash::minhash_jaccard;
use crate::vector::cosine;

/// Module proximity multiplier from shared path prefix. Returns `[1.0, 1.10]`.
#[must_use]
pub fn proximity(path_a: &str, path_b: &str) -> f32 {
    let mut shared = 0_i32;
    let mut total_a = 0_i32;
    let mut total_b = 0_i32;

    let common_len = path_a
        .bytes()
        .zip(path_b.bytes())
        .take_while(|(a, b)| a == b)
        .count();
    let common = &path_a[..common_len.min(path_a.len()).min(path_b.len())];
    for &b in common.as_bytes() {
        if b == b'/' {
            shared += 1;
        }
    }
    for &b in path_a.as_bytes() {
        if b == b'/' {
            total_a += 1;
        }
    }
    for &b in path_b.as_bytes() {
        if b == b'/' {
            total_b += 1;
        }
    }

    let max_total = total_a.max(total_b);
    if max_total == 0 {
        return UNIT_POS;
    }
    let ratio = shared as f32 / max_total as f32;
    UNIT_POS + ratio * PROX_MAX_BOOST
}

fn small_cosine(a: &[f32], b: &[f32], dims: usize) -> f32 {
    let mut dot = 0.0_f32;
    let mut ma = 0.0_f32;
    let mut mb = 0.0_f32;
    for i in 0..dims {
        dot += a[i] * b[i];
        ma += a[i] * a[i];
        mb += b[i] * b[i];
    }
    let denom = ma.sqrt() * mb.sqrt();
    if denom < DENOM_EPS {
        return 0.0;
    }
    dot / denom
}

fn sparse_tfidf_cosine(a: &SemanticFunc<'_>, b: &SemanticFunc<'_>) -> f32 {
    if a.tfidf_indices.is_empty() || b.tfidf_indices.is_empty() {
        return 0.0;
    }

    let mut dot = 0.0_f32;
    let mut ia = 0_usize;
    let mut ib = 0_usize;
    while ia < a.tfidf_indices.len() && ib < b.tfidf_indices.len() {
        let ai = a.tfidf_indices[ia];
        let bi = b.tfidf_indices[ib];
        if ai == bi {
            dot += a.tfidf_weights[ia] * b.tfidf_weights[ib];
            ia += 1;
            ib += 1;
        } else if ai < bi {
            ia += 1;
        } else {
            ib += 1;
        }
    }

    let ma: f32 = a.tfidf_weights.iter().map(|w| w * w).sum();
    let mb: f32 = b.tfidf_weights.iter().map(|w| w * w).sum();
    let denom = ma.sqrt() * mb.sqrt();
    if denom > DENOM_EPS {
        dot / denom
    } else {
        0.0
    }
}

/// Combined similarity score across all semantic signals.
#[must_use]
pub fn combined_score(a: &SemanticFunc<'_>, b: &SemanticFunc<'_>, cfg: &SemanticConfig) -> f32 {
    if a.has_minhash && b.has_minhash {
        let early_j = minhash_jaccard(&a.minhash, &b.minhash);
        if early_j >= MINHASH_JACCARD_THRESHOLD {
            return 0.0;
        }
    }

    let mut score = cfg.w_tfidf * sparse_tfidf_cosine(a, b);
    score += cfg.w_ri * cosine(&a.ri_vec, &b.ri_vec);

    if a.has_minhash && b.has_minhash {
        let j = minhash_jaccard(&a.minhash, &b.minhash);
        score += cfg.w_minhash * j as f32;
    }

    score += cfg.w_api * cosine(&a.api_vec, &b.api_vec);
    score += cfg.w_type * cosine(&a.type_vec, &b.type_vec);
    score += cfg.w_decorator * cosine(&a.deco_vec, &b.deco_vec);

    let sp_score = small_cosine(
        &a.struct_profile,
        &b.struct_profile,
        AST_PROFILE_DIMS,
    );
    score += cfg.w_struct_profile * sp_score;

    score *= proximity(a.file_path, b.file_path);
    score.clamp(0.0, UNIT_POS)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::vector::SemVector;

    #[test]
    fn same_path_proximity_is_max_boost() {
        let p = proximity("src/a/b.rs", "src/a/b.rs");
        assert!((p - 1.10).abs() < 1e-5);
    }

    #[test]
    fn sparse_tfidf_overlap() {
        let a = SemanticFunc {
            file_path: "a.rs",
            tfidf_indices: vec![1, 3, 5],
            tfidf_weights: vec![0.5, 0.5, 0.5],
            ..SemanticFunc::default()
        };
        let b = SemanticFunc {
            file_path: "b.rs",
            tfidf_indices: vec![3, 7],
            tfidf_weights: vec![1.0, 1.0],
            ..SemanticFunc::default()
        };
        let cfg = SemanticConfig::default();
        let score = combined_score(&a, &b, &cfg);
        assert!(score > 0.0);
        let _ = SemVector::default();
    }
}
