use crate::{LogLevel, Logger, Mode};

#[derive(Debug, Clone)]
/// Configuration options for the Power Plant.
pub struct Options {
  /// The mode.
  pub mode: Option<Mode>,
  /// The log level.
  pub log_level: Option<LogLevel>,
  /// Callback for logging messages.
  pub custom_logger: Option<Logger>,
  /// The current working directory.
  pub cwd: Option<String>,
  /// Path to output directory.
  pub output_path: Option<String>,
}

impl Default for Options {
  fn default() -> Self {
    Self { mode: None, log_level: None, custom_logger: None, cwd: None, output_path: None }
  }
}

impl Options {
  pub fn new(
    mode: Option<Mode>,
    log_level: Option<LogLevel>,
    custom_logger: Option<Logger>,
    cwd: Option<String>,
    output_path: Option<String>,
  ) -> Self {
    Self { mode, log_level, custom_logger, cwd, output_path }
  }
}
