use std::path::PathBuf;

use super::Issue;
use crate::types::{diagnostic_options::DiagnosticOptions, issue_kind::IssueKind};

#[derive(Debug)]
pub struct PathIsNotValidUtf8 {
  pub path: PathBuf,
}

impl Issue for PathIsNotValidUtf8 {
  fn kind(&self) -> IssueKind {
    IssueKind::PathIsNotValidUtf8
  }

  fn id(&self) -> Option<String> {
    Some(self.path.to_str().unwrap_or_default().to_string())
  }

  fn message(&self, _opts: &DiagnosticOptions) -> String {
    format!("Invalid UTF-8 sequence in path '{}'", self.path.to_str().unwrap_or_default())
  }
}
