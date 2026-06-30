use crate::types::{diagnostic_options::DiagnosticOptions, issue_kind::IssueKind};

use super::Issue;

/// This is used for returning errors that are not expected to be handled by rolldown. Such as
/// - Error of converting u64 to usize in a platform that usize is 32-bit.
/// - ...
///   Handling such errors is meaningless.
///
/// Notice:
/// - We might mark some errors as unhandleable for faster development, but we should convert them
///   to `BuildDiagnostic` to provide better error messages to users.
#[derive(Debug)]
pub struct UnhandleableError(pub(crate) anyhow::Error);

impl Issue for UnhandleableError {
  fn kind(&self) -> IssueKind {
    IssueKind::UnhandleableError
  }

  fn message(&self, _opts: &DiagnosticOptions) -> String {
    format!(
      "Something went wrong inside the Power Plant runtime, please report this problem at https://support.stormsoftware.com/projects/power-plant/report-issue.\n{}",
      self.0
    )
  }
}
