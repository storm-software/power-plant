use crate::session::Session;

/// Output of session loading.
#[derive(Debug, Clone, PartialEq)]
pub struct GetSessionOutput {
  /// The current session.
  pub session: Session,
}

impl From<Session> for GetSessionOutput {
  fn from(value: Session) -> Self {
    Self { session: value }
  }
}
