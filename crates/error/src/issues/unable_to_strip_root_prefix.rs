use camino::Utf8PathBuf;

use crate::types::{diagnostic_options::DiagnosticOptions, issue_kind::IssueKind};

use super::Issue;

#[derive(Debug)]
pub struct UnableToStripRootPrefix {
  pub path: Utf8PathBuf,
  pub root: Utf8PathBuf,
}

impl Issue for UnableToStripRootPrefix {
  fn kind(&self) -> IssueKind {
    IssueKind::UnableToStripRootPrefix
  }

  fn id(&self) -> Option<String> {
    Some(self.path.to_string())
  }

  fn message(&self, _opts: &DiagnosticOptions) -> String {
    format!("Unable to strip root prefix from '{}' with root '{}'", self.path, self.root)
  }
}
