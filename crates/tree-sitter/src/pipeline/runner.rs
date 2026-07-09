use std::sync::Arc;
use std::time::Instant;

use super::context::{
  DiscoverResult, FileDiscoverer, GraphIndexer, PipelineContext, PipelinePass, PredumpPass,
  ReindexRouter, SequentialPass,
};
use super::error::PipelineResult;
use super::sequential::{self, SequentialPipelineState};
use super::state::Pipeline;
use super::types::{FileInfo, MIN_FILES_FOR_PARALLEL, SEQUENTIAL_PASS_COUNT};
use super::worker_pool::effective_worker_count;

/// Default sequential passes mirroring `run_sequential_pipeline` in pipeline.c.
pub fn default_sequential_passes() -> [SequentialPass; SEQUENTIAL_PASS_COUNT] {
  [
    SequentialPass { name: "definitions", ignore_error: false, run: sequential::pass_definitions },
    SequentialPass { name: "k8s", ignore_error: true, run: sequential::pass_k8s },
    SequentialPass { name: "lsp_cross", ignore_error: true, run: sequential::pass_lsp_cross },
    SequentialPass { name: "calls", ignore_error: false, run: sequential::pass_calls },
    SequentialPass { name: "usages", ignore_error: false, run: sequential::pass_usages },
    SequentialPass { name: "semantic", ignore_error: false, run: sequential::pass_semantic },
  ]
}

/// Orchestrates multi-pass indexing. Mirrors `cbm_pipeline_run`.
pub struct PipelineRunner<D, G, R> {
  pub discoverer: D,
  pub indexer: G,
  pub reindex_router: R,
  pub sequential_passes: [SequentialPass; SEQUENTIAL_PASS_COUNT],
  pub predump_passes: Vec<Box<dyn PredumpPass + Send + Sync>>,
}

impl<D, G, R> PipelineRunner<D, G, R>
where
  D: FileDiscoverer,
  G: GraphIndexer,
  R: ReindexRouter,
{
  pub fn new(discoverer: D, indexer: G, reindex_router: R) -> Self {
    Self {
      discoverer,
      indexer,
      reindex_router,
      sequential_passes: default_sequential_passes(),
      predump_passes: Vec::new(),
    }
  }

  pub fn run(&self, pipeline: &mut Pipeline) -> PipelineResult<()> {
    let started = Instant::now();
    let _ = started;

    let discover = self.discoverer.discover(pipeline)?;
    pipeline.excluded_dirs = discover.excluded_dirs;
    let files = discover.files;

    if let Some(()) = self.reindex_router.try_incremental_or_delete_db(pipeline, &files)? {
      return Ok(());
    }

    self.run_extraction_phase(pipeline, &files)?;
    self.run_post_extraction(pipeline, &files)?;

    let _elapsed = started.elapsed();
    Ok(())
  }

  fn run_extraction_phase(
    &self,
    pipeline: &mut Pipeline,
    files: &[FileInfo],
  ) -> PipelineResult<()> {
    let mut sequential = SequentialPipelineState::new(pipeline.project_name());
    sequential.ensure_cache(files.len());

    let cancelled = Arc::clone(&pipeline.cancelled);
    let mode = pipeline.mode();
    let excluded_dirs = pipeline.excluded_dirs().to_vec();
    let mut ctx = PipelineContext {
      project_name: pipeline.project_name().to_string(),
      repo_path: pipeline.repo_path().to_path_buf(),
      cancelled: cancelled.as_ref(),
      pipeline,
      mode,
      excluded_dirs,
      sequential: &mut sequential,
    };

    self.indexer.pass_structure(&mut ctx, files)?;
    ctx.check_cancel()?;

    let worker_count = effective_worker_count(true);
    if worker_count > 1 && files.len() > MIN_FILES_FOR_PARALLEL {
      self.indexer.run_parallel_extraction(&mut ctx, files, worker_count)?;
    } else {
      self.indexer.run_sequential_extraction(&mut ctx, files, &self.sequential_passes)?;
    }

    ctx.check_cancel()?;
    ctx
      .pipeline
      .set_committed_counts(ctx.sequential.graph.node_count(), ctx.sequential.graph.edge_count());
    Ok(())
  }

  fn run_post_extraction(&self, pipeline: &mut Pipeline, files: &[FileInfo]) -> PipelineResult<()> {
    let mut sequential = SequentialPipelineState::new(pipeline.project_name());
    let cancelled = Arc::clone(&pipeline.cancelled);
    let mode = pipeline.mode();
    let excluded_dirs = pipeline.excluded_dirs().to_vec();
    let mut ctx = PipelineContext {
      project_name: pipeline.project_name().to_string(),
      repo_path: pipeline.repo_path().to_path_buf(),
      cancelled: cancelled.as_ref(),
      pipeline,
      mode,
      excluded_dirs,
      sequential: &mut sequential,
    };

    let predump: Vec<&dyn PredumpPass> =
      self.predump_passes.iter().map(|p| &**p as &dyn PredumpPass).collect();
    self.indexer.run_post_extraction(&mut ctx, files, &predump)?;
    ctx.check_cancel()?;
    self.indexer.dump_and_persist(pipeline, files)
  }
}

/// Run sequential passes with timing and cancellation checks.
pub fn run_sequential_passes(
  ctx: &mut PipelineContext<'_>,
  files: &[FileInfo],
  passes: &[SequentialPass],
) -> PipelineResult<()> {
  ctx.sequential.ensure_cache(files.len());
  for pass in passes {
    let started = Instant::now();
    let result = pass.run(ctx, files);
    let _elapsed = started.elapsed();

    if let Err(err) = result {
      if !pass.ignore_error() {
        return Err(err);
      }
    }
    ctx.check_cancel()?;
  }
  Ok(())
}

/// Run pre-dump passes, skipping moderate-only passes in fast mode.
pub fn run_predump_passes(
  ctx: &mut PipelineContext<'_>,
  passes: &[&dyn PredumpPass],
) -> PipelineResult<()> {
  for pass in passes {
    if pass.moderate_only() && ctx.mode.skips_moderate_only_passes() {
      continue;
    }
    let started = Instant::now();
    pass.run(ctx)?;
    let _elapsed = started.elapsed();
  }
  Ok(())
}

/// No-op discoverer for wiring tests.
#[derive(Debug, Default)]
pub struct NullDiscoverer;

impl FileDiscoverer for NullDiscoverer {
  fn discover(&self, _pipeline: &Pipeline) -> PipelineResult<DiscoverResult> {
    Ok(DiscoverResult::default())
  }
}

/// No-op reindex router: always proceed with full index.
#[derive(Debug, Default)]
pub struct FullReindexRouter;

impl ReindexRouter for FullReindexRouter {
  fn try_incremental_or_delete_db(
    &self,
    _pipeline: &mut Pipeline,
    _files: &[FileInfo],
  ) -> PipelineResult<Option<()>> {
    Ok(None)
  }
}

/// Stub graph indexer that exercises sequential pass orchestration.
#[derive(Debug, Default)]
pub struct StubGraphIndexer;

impl GraphIndexer for StubGraphIndexer {
  fn pass_structure(
    &self,
    _ctx: &mut PipelineContext<'_>,
    _files: &[FileInfo],
  ) -> PipelineResult<()> {
    Ok(())
  }

  fn run_parallel_extraction(
    &self,
    _ctx: &mut PipelineContext<'_>,
    _files: &[FileInfo],
    _worker_count: usize,
  ) -> PipelineResult<()> {
    Ok(())
  }

  fn run_sequential_extraction(
    &self,
    ctx: &mut PipelineContext<'_>,
    files: &[FileInfo],
    passes: &[SequentialPass],
  ) -> PipelineResult<()> {
    run_sequential_passes(ctx, files, passes)
  }

  fn run_post_extraction(
    &self,
    ctx: &mut PipelineContext<'_>,
    _files: &[FileInfo],
    predump_passes: &[&dyn PredumpPass],
  ) -> PipelineResult<()> {
    run_predump_passes(ctx, predump_passes)
  }

  fn dump_and_persist(&self, pipeline: &mut Pipeline, _files: &[FileInfo]) -> PipelineResult<()> {
    pipeline.set_committed_counts(0, 0);
    Ok(())
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::pipeline::error::PipelineError;
  use crate::pipeline::types::IndexMode;

  #[test]
  fn pipeline_run_completes_with_stubs() {
    let mut pipeline = Pipeline::new("/tmp/example-repo", None, IndexMode::Full);
    let runner = PipelineRunner::new(NullDiscoverer, StubGraphIndexer, FullReindexRouter);
    runner.run(&mut pipeline).expect("pipeline should succeed");
    assert_eq!(pipeline.committed_counts().nodes, 0);
  }

  #[test]
  fn cancellation_surfaces_as_error() {
    let mut pipeline = Pipeline::new("/tmp/example-repo", None, IndexMode::Full);
    pipeline.cancel();
    let mut sequential = SequentialPipelineState::new(pipeline.project_name());
    let cancelled = Arc::clone(&pipeline.cancelled);
    let mode = pipeline.mode();
    let excluded_dirs = pipeline.excluded_dirs().to_vec();
    let mut ctx = PipelineContext {
      project_name: pipeline.project_name().to_owned(),
      repo_path: pipeline.repo_path().to_path_buf(),
      cancelled: cancelled.as_ref(),
      pipeline: &mut pipeline,
      mode,
      excluded_dirs,
      sequential: &mut sequential,
    };
    assert!(matches!(ctx.check_cancel(), Err(PipelineError::Cancelled)));
  }
}
