//! Shared constants from `semantic.h`.

/// Random Indexing / embedding dimension (nomic-embed-code).
pub const DIM: usize = 768;

/// Non-zero entries per sparse random vector.
pub const SPARSE_NNZE: usize = 8;

/// Co-occurrence window half-width.
pub const WINDOW: i32 = 5;

/// Frequent-token subsampling cap for co-occurrence enrichment.
pub const MAX_OCCUR: usize = 512;

/// Default score threshold for `SEMANTICALLY_RELATED` edge emission.
pub const DEFAULT_EDGE_THRESHOLD: f32 = 0.75;

/// Maximum semantic edges per node.
pub const MAX_EDGES: usize = 10;

/// AST structural profile dimensions.
pub const AST_PROFILE_DIMS: usize = 25;

/// MinHash fingerprint length.
pub const MINHASH_K: usize = 64;

/// MinHash Jaccard threshold for `SIMILAR_TO` short-circuit in combined scoring.
pub const MINHASH_JACCARD_THRESHOLD: f64 = 0.95;

/// Maximum tokens per function from metadata.
pub const MAX_TOKENS: usize = 512;

pub(crate) const DENOM_EPS: f32 = 1e-10;
pub(crate) const INT8_MAX: f32 = 127.0;
pub(crate) const UNIT_POS: f32 = 1.0;
pub(crate) const PROX_MAX_BOOST: f32 = 0.10;
pub(crate) const RRI_ALPHA: f32 = 0.3;
pub(crate) const RRI_BETA: f32 = 0.7;
pub(crate) const RI_SEED_BASE: u64 = 0x5249_4E44; // "RIND"

pub(crate) const W_TFIDF: f32 = 0.20;
pub(crate) const W_RI: f32 = 0.25;
pub(crate) const W_MINHASH: f32 = 0.10;
pub(crate) const W_API: f32 = 0.15;
pub(crate) const W_TYPE: f32 = 0.10;
pub(crate) const W_DECORATOR: f32 = 0.05;
pub(crate) const W_STRUCT_PROFILE: f32 = 0.10;
pub(crate) const W_DATAFLOW: f32 = 0.05;

pub(crate) const THRESHOLD_MIN: f32 = 0.0;
pub(crate) const THRESHOLD_MAX: f32 = 1.0;

pub(crate) const CORPUS_INIT_CAP: usize = 4096;
pub(crate) const DOC_TOKENS_INIT: usize = 64;
pub(crate) const TOKEN_BUF_LEN: usize = 128;

pub(crate) const WORKER_STACK_CAP: usize = 256;
pub(crate) const TILE_SIZE: usize = 40;
pub(crate) const SEEN_INIT_CAP: usize = 256;
pub(crate) const RESOLVE_CHUNK: usize = 64;
pub(crate) const COOCCUR_CHUNK: usize = 32;
pub(crate) const RRI_TILE: usize = 128;
