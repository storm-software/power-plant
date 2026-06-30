#[derive(Debug)]
pub struct NapiError(pub napi::Error);

impl super::Issue for NapiError {
  fn kind(&self) -> crate::IssueKind {
    crate::IssueKind::NapiError
  }

  fn message(&self, _opts: &crate::DiagnosticOptions) -> String {
    format!("N-API error: {}", self.0)
  }

  #[cfg(feature = "napi")]
  fn as_napi_error(&self) -> Option<&napi::Error> {
    Some(&self.0)
  }
}
