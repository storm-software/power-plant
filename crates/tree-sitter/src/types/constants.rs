/// Minimum discovered files before choosing the parallel extraction path.
pub const MIN_FILES_FOR_PARALLEL: usize = 50;

/// Sequential extraction passes (definitions → k8s → lsp_cross → calls → usages → semantic).
pub const SEQUENTIAL_PASS_COUNT: usize = 6;
