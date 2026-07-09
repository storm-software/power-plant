use crate::constants::AST_PROFILE_DIMS;
use crate::minhash::MinHash;
use crate::vector::SemVector;

/// Per-function semantic signals for combined scoring.
#[derive(Debug, Clone, Default)]
pub struct SemanticFunc<'a> {
    pub node_id: i64,
    pub file_path: &'a str,
    pub file_ext: Option<&'a str>,
    pub tfidf_indices: Vec<i32>,
    pub tfidf_weights: Vec<f32>,
    pub ri_vec: SemVector,
    pub api_vec: SemVector,
    pub type_vec: SemVector,
    pub deco_vec: SemVector,
    pub struct_profile: [f32; AST_PROFILE_DIMS],
    pub has_minhash: bool,
    pub minhash: MinHash,
}
