//! Power Plant Codebase Memory crate.
//!
//! Provides a Rust port of the codebase-memory indexing pipeline orchestrator
//! (`pipeline`) plus utilities for FQN computation, worker-pool
//! dispatch, and incremental re-index classification.

pub mod pipeline;

pub use pipeline::{
    classify_files, compute_fqn, default_sequential_passes, effective_worker_count,
    find_deleted_and_mode_skipped, folder_fqn, lock, module_dir_fqn, module_fqn, parallel_for,
    pipeline_run, project_name_from_path, project_name_from_path_buf, resolve_relative_import,
    try_lock, unlock, validate_project_name, CancellationToken, CommittedCounts, DiscoverResult,
    FileDiscoverer, FileError, FileErrorPhase, FileHash, FileInfo, FullReindexRouter,
    GraphIndexer, IndexMode, IncrementalClassification, IncrementalIndexer, IncrementalRun,
    NullDiscoverer, ParallelForOpts, Pipeline, PipelineContext, PipelineError, PipelinePass,
    PipelineResult, PipelineRunner, PredumpPass, ReindexRouter, SavedEdge, SequentialPass,
    StubGraphIndexer, VERSION,
};
#[cfg(cbm_native)]
pub use pipeline::CbmExtractor;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_matches_bindings_header() {
        assert_eq!(VERSION, "0.1.0");
    }
}
