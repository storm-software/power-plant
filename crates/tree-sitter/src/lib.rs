//! Indexing pipeline orchestrator
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
mod fqn;
mod graph;
mod incremental;
mod lock;
mod registry;
mod runner;
mod sequential;
mod state;
mod worker_pool;

pub use context::{
  DiscoverResult, FileDiscoverer, GraphIndexer, IncrementalIndexer, PipelineContext, PipelinePass,
  PredumpPass, ReindexRouter, SequentialPass,
};
pub use error::{PipelineError, PipelineResult};
pub use extract::{
  EXTRACT_BUDGET, Extractor, FileResult, StubExtractor, default_extractor,
  label_is_registry_symbol, label_is_type_like, module_is_dir,
};
pub use fqn::{
  compute_fqn, folder_fqn, module_dir_fqn, module_fqn, project_name_from_path,
  project_name_from_path_buf, resolve_relative_import, validate_project_name,
};
pub use graph::{GraphBuffer, GraphEdge, GraphNode};
pub use incremental::{
  FileHash, IncrementalClassification, IncrementalRun, SavedEdge, classify_files,
  edge_type_is_recomputed, file_mtime_ns, find_deleted_and_mode_skipped, incremental_use_parallel,
  is_incremental_noop, should_capture_inbound_edge,
};
pub use lock::{lock, try_lock, unlock};
pub use registry::{Registry, Resolution, confidence_band};
pub use runner::{
  FullReindexRouter, NullDiscoverer, PipelineRunner, StubGraphIndexer, default_sequential_passes,
  run_predump_passes, run_sequential_passes,
};
pub use sequential::{
  SequentialPipelineState, pass_calls, pass_definitions, pass_k8s, pass_lsp_cross, pass_semantic,
  pass_usages,
};
pub use state::Pipeline;
pub use worker_pool::{
  ParallelForOpts, default_worker_count, effective_worker_count, parallel_for,
};

/// CBM semantic version mirrored from `bindings.h`.
pub const VERSION: &str = "0.1.0";

/// Convenience entry point matching `cbm_pipeline_run`.
pub fn pipeline_run(pipeline: &mut Pipeline) -> PipelineResult<()> {
  let runner = PipelineRunner::new(NullDiscoverer, StubGraphIndexer, FullReindexRouter);
  runner.run(pipeline)
}

pub mod languages;
pub mod types;

pub use types::*;

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn version_matches_bindings_header() {
    assert_eq!(VERSION, "0.1.0");
  }
}
