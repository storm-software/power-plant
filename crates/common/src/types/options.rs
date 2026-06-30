use crate::{Logger, log::LogLevel};

#[derive(Debug, Clone)]
/// Configuration options for the Power Plant.
pub struct Options {
  /// The log level.
  pub log_level: Option<LogLevel>,
  /// Callback for logging messages.
  pub custom_logger: Option<Logger>,
  /// Whether to disable tracing.
  pub disable_tracing: Option<bool>,
  /// The current working directory.
  pub cwd: String,
  /// Path to cache directory.
  pub cache_path: String,
  /// Path to data directory.
  pub data_path: String,
  /// Path to log directory.
  pub log_path: String,
  /// Path to temporary directory.
  pub temp_path: String,
  /// Path to configuration directory.
  pub config_path: String,
  /// Path to output directory.
  pub output_path: String,
}

impl Default for Options {
  fn default() -> Self {
    Self {
      log_level: None,
      custom_logger: None,
      disable_tracing: None,
      cwd: std::env::current_dir().unwrap().to_string_lossy().to_string(),
      cache_path: String::new(),
      data_path: String::new(),
      log_path: String::new(),
      temp_path: String::new(),
      config_path: String::new(),
      output_path: String::new(),
    }
  }
}
