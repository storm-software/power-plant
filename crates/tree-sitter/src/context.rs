use std::path::PathBuf;

use crate::error::{PipelineError, PipelineResult};
use crate::sequential::SequentialPipelineState;
use crate::state::Pipeline;
use crate::{CancellationToken, FileInfo, IndexMode};

/// Shared context passed to each pipeline pass. Mirrors `cbm_pipeline_ctx_t`.
pub struct PipelineContext<'a> {
  pub project_name: String,
  pub repo_path: PathBuf,
  pub cancelled: &'a CancellationToken,
  pub pipeline: &'a mut Pipeline,
  pub mode: IndexMode,
  pub excluded_dirs: Vec<String>,
  pub sequential: &'a mut SequentialPipelineState,
}

impl<'a> PipelineContext<'a> {
  pub fn check_cancel(&self) -> PipelineResult<()> {
    if self.cancelled.is_cancelled() { Err(PipelineError::Cancelled) } else { Ok(()) }
  }

  pub fn rel_path_is_excluded(&self, rel_path: &str) -> bool {
    if rel_path.is_empty() {
      return false;
    }
    self.excluded_dirs.iter().any(|excluded| {
      if excluded.is_empty() {
        return false;
      }
      rel_path == excluded.as_str()
        || rel_path
          .strip_prefix(excluded)
          .is_some_and(|rest| rest.is_empty() || rest.starts_with('/'))
    })
  }
}

/// Outcome of file discovery.
#[derive(Debug, Default)]
pub struct DiscoverResult {
  pub files: Vec<FileInfo>,
  pub excluded_dirs: Vec<String>,
}

/// Trait implemented by pass backends (C FFI or native Rust passes).
pub trait PipelinePass {
  fn name(&self) -> &'static str;

  /// When true a non-zero return code does not fail the pipeline.
  fn ignore_error(&self) -> bool {
    false
  }

  fn run(&self, ctx: &mut PipelineContext<'_>, files: &[FileInfo]) -> PipelineResult<()>;
}

/// Sequential extraction pass descriptor for the small-repo path.
pub struct SequentialPass {
  pub name: &'static str,
  pub ignore_error: bool,
  pub run: fn(&mut PipelineContext<'_>, &[FileInfo]) -> PipelineResult<()>,
}

impl PipelinePass for SequentialPass {
  fn name(&self) -> &'static str {
    self.name
  }

  fn ignore_error(&self) -> bool {
    self.ignore_error
  }

  fn run(&self, ctx: &mut PipelineContext<'_>, files: &[FileInfo]) -> PipelineResult<()> {
    (self.run)(ctx, files)
  }
}

/// Pre-dump pass that operates on the shared graph buffer.
pub trait PredumpPass {
  fn name(&self) -> &'static str;
  fn moderate_only(&self) -> bool {
    false
  }
  fn run(&self, ctx: &mut PipelineContext<'_>) -> PipelineResult<()>;
}

/// File discovery backend.
pub trait FileDiscoverer {
  fn discover(&self, pipeline: &Pipeline) -> PipelineResult<DiscoverResult>;
}

/// Graph indexing backend: structure, extraction, dump.
pub trait GraphIndexer {
  fn pass_structure(&self, ctx: &mut PipelineContext<'_>, files: &[FileInfo])
  -> PipelineResult<()>;

  fn run_parallel_extraction(
    &self,
    ctx: &mut PipelineContext<'_>,
    files: &[FileInfo],
    worker_count: usize,
  ) -> PipelineResult<()>;

  fn run_sequential_extraction(
    &self,
    ctx: &mut PipelineContext<'_>,
    files: &[FileInfo],
    passes: &[SequentialPass],
  ) -> PipelineResult<()>;

  fn run_post_extraction(
    &self,
    ctx: &mut PipelineContext<'_>,
    files: &[FileInfo],
    predump_passes: &[&dyn PredumpPass],
  ) -> PipelineResult<()>;

  fn dump_and_persist(&self, pipeline: &mut Pipeline, files: &[FileInfo]) -> PipelineResult<()>;
}

/// Incremental re-index backend operating on an existing on-disk DB.
pub trait IncrementalIndexer {
  fn try_run(&self, pipeline: &mut Pipeline, files: &[FileInfo]) -> PipelineResult<Option<()>>;
}

/// Route between incremental and full reindex when a DB already exists.
pub trait ReindexRouter {
  fn try_incremental_or_delete_db(
    &self,
    pipeline: &mut Pipeline,
    files: &[FileInfo],
  ) -> PipelineResult<Option<()>>;
}
