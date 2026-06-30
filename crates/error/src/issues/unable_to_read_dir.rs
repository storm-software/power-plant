use camino::Utf8PathBuf;

use crate::types::{diagnostic_options::DiagnosticOptions, issue_kind::IssueKind};

use super::Issue;

#[derive(Debug)]
pub struct UnableToReadDir {
  pub path: Utf8PathBuf,
  pub error: std::io::Error,
}

impl Issue for UnableToReadDir {
  fn kind(&self) -> IssueKind {
    IssueKind::UnableToReadDir
  }

  fn id(&self) -> Option<String> {
    Some(self.path.to_string())
  }

  fn message(&self, _opts: &DiagnosticOptions) -> String {
    format!("Unable to read directory '{}' - {}", self.path, self.error)
  }
}
