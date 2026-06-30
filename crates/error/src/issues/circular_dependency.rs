use super::Issue;
use crate::{IssueKind, types::diagnostic_options::DiagnosticOptions};

#[derive(Debug)]
pub struct CircularDependency {
  pub paths: Vec<String>,
}

impl CircularDependency {
  fn stable_paths(&self, opts: &DiagnosticOptions) -> Vec<String> {
    self.paths.iter().map(|p| opts.stabilize_path(p)).collect::<Vec<_>>()
  }
}

impl Issue for CircularDependency {
  fn kind(&self) -> IssueKind {
    IssueKind::CircularDependency
  }

  fn message(&self, opts: &DiagnosticOptions) -> String {
    format!("Circular dependency: {}.", self.stable_paths(opts).join(" -> "))
  }
}
