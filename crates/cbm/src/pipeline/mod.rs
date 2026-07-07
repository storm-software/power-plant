//! Indexing pipeline orchestrator — Rust port of `vendored/pipeline/pipeline.c`.
//!
//! Coordinates multi-pass repository indexing:
//!   1. Discover files
//!   2. Build structure (Project/Folder/Package/File nodes)
//!   3. Extract definitions + resolve imports/calls/usages/semantic edges
//!   4. Post-passes (tests, communities, config links, git history)
//!   5. Dump graph buffer to SQLite
//!
//! Individual pass implementations plug in through [`GraphIndexer`] and
//! [`FileDiscoverer`] traits so the C extraction/LSP backends can be wired
//! via FFI without rewriting the orchestration layer.

mod context;
mod error;
mod extract;
#[cfg(cbm_native)]
mod cbm_native;
mod fqn;
mod graph;
mod incremental;
mod lock;
mod registry;
mod runner;
mod sequential;
mod state;
mod types;
mod worker_pool;

pub use context::{
    DiscoverResult, FileDiscoverer, GraphIndexer, IncrementalIndexer, PipelineContext,
    PipelinePass, PredumpPass, ReindexRouter, SequentialPass,
};
pub use error::{PipelineError, PipelineResult};
pub use fqn::{
    compute_fqn, folder_fqn, module_dir_fqn, module_fqn, project_name_from_path,
    project_name_from_path_buf, resolve_relative_import, validate_project_name,
};
pub use incremental::{
    classify_files, edge_type_is_recomputed, find_deleted_and_mode_skipped, file_mtime_ns,
    incremental_use_parallel, is_incremental_noop, should_capture_inbound_edge, FileHash,
    IncrementalClassification, IncrementalRun, SavedEdge,
};
pub use extract::{
    infer_language, label_is_registry_symbol, label_is_type_like, module_is_dir, default_extractor,
    Extractor, FileResult, StubExtractor, EXTRACT_BUDGET,
};
#[cfg(cbm_native)]
pub use cbm_native::CbmExtractor;
pub use graph::{GraphBuffer, GraphEdge, GraphNode};
pub use registry::{confidence_band, Registry, Resolution};
pub use sequential::{
    pass_calls, pass_definitions, pass_k8s, pass_lsp_cross, pass_semantic, pass_usages,
    SequentialPipelineState,
};
pub use runner::{
    default_sequential_passes, run_predump_passes, run_sequential_passes, FullReindexRouter,
    NullDiscoverer, PipelineRunner, StubGraphIndexer,
};
pub use state::Pipeline;
pub use types::{
    CancellationToken, CommittedCounts, FileError, FileErrorPhase, FileInfo, IndexMode, Language,
    MIN_FILES_FOR_PARALLEL, SEQUENTIAL_PASS_COUNT,
};
pub use lock::{lock, try_lock, unlock};
pub use worker_pool::{
    default_worker_count, effective_worker_count, parallel_for, ParallelForOpts,
};

/// CBM semantic version mirrored from `bindings.h`.
pub const VERSION: &str = "0.1.0";

/// Convenience entry point matching `cbm_pipeline_run`.
pub fn pipeline_run(pipeline: &mut Pipeline) -> PipelineResult<()> {
    let runner = PipelineRunner::new(NullDiscoverer, StubGraphIndexer, FullReindexRouter);
    runner.run(pipeline)
}
