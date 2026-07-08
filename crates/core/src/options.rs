use crate::{
  log::{LogLevel, Logger},
  settings::Mode,
};

#[derive(Debug, Clone)]
/// Configuration options for the Power Plant.
pub struct Options {
  /// The mode.
  pub mode: Option<Mode>,
  /// The user name to use for the application.
  pub username: Option<String>,
  /// The log level.
  pub log_level: Option<LogLevel>,
  /// Callback for logging messages.
  pub custom_logger: Option<Logger>,
  /// The current working directory.
  pub cwd: Option<String>,
}

impl Default for Options {
  fn default() -> Self {
    Self { mode: None, username: None, log_level: None, custom_logger: None, cwd: None }
  }
}

impl Options {
  pub fn new(
    mode: Option<Mode>,
    username: Option<String>,
    log_level: Option<LogLevel>,
    custom_logger: Option<Logger>,
    cwd: Option<String>,
  ) -> Self {
    Self { mode, username, log_level, custom_logger, cwd }
  }
}
