use camino::Utf8PathBuf;

use crate::types::{diagnostic_options::DiagnosticOptions, issue_kind::IssueKind};

use super::Issue;

#[derive(Debug)]
pub struct UnableToReadFile {
  pub path: Utf8PathBuf,
}

impl Issue for UnableToReadFile {
  fn kind(&self) -> IssueKind {
    IssueKind::UnableToReadFile
  }

  fn id(&self) -> Option<String> {
    Some(self.path.to_string())
  }

  fn message(&self, _opts: &DiagnosticOptions) -> String {
    format!("Unable to read file '{}'", self.path)
  }
}
