mod calls;
mod definitions;
mod k8s;
mod lsp_cross;
mod semantic;
mod usages;

use crate::FileInfo;
use crate::context::PipelineContext;
use crate::error::PipelineResult;
use crate::extract::Extractor;
use crate::graph::GraphBuffer;
use crate::registry::Registry;

pub use calls::pass_calls;
pub use definitions::pass_definitions;
pub use k8s::pass_k8s;
pub use lsp_cross::pass_lsp_cross;
pub use semantic::pass_semantic;
pub use usages::pass_usages;

use crate::extract::{FileResult, default_extractor};
use std::collections::HashMap;

/// Mutable per-run state for the sequential indexing path.
pub struct SequentialPipelineState {
  pub graph: GraphBuffer,
  pub registry: Registry,
  pub result_cache: Vec<Option<FileResult>>,
  pub owns_cache: bool,
  pub pkgmap: HashMap<String, String>,
  extractor: Box<dyn Extractor + Send + Sync>,
}

impl SequentialPipelineState {
  pub fn new(_project_name: &str) -> Self {
    Self {
      graph: GraphBuffer::new(),
      registry: Registry::new(),
      result_cache: Vec::new(),
      owns_cache: true,
      pkgmap: HashMap::new(),
      extractor: default_extractor(),
    }
  }

  pub fn with_extractor(mut self, extractor: Box<dyn Extractor + Send + Sync>) -> Self {
    self.extractor = extractor;
    self
  }

  pub fn ensure_cache(&mut self, file_count: usize) {
    if self.result_cache.len() < file_count {
      self.result_cache.resize(file_count, None);
    }
  }

  pub fn extractor(&self) -> &dyn Extractor {
    self.extractor.as_ref()
  }
}

pub fn run_pass(
  name: &str,
  ctx: &mut PipelineContext<'_>,
  files: &[FileInfo],
) -> PipelineResult<()> {
  match name {
    "definitions" => pass_definitions(ctx, files),
    "k8s" => pass_k8s(ctx, files),
    "lsp_cross" => pass_lsp_cross(ctx, files),
    "calls" => pass_calls(ctx, files),
    "usages" => pass_usages(ctx, files),
    "semantic" => pass_semantic(ctx, files),
    other => Err(super::error::PipelineError::Other(format!("unknown sequential pass: {other}"))),
  }
}
