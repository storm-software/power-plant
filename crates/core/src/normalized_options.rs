use crate::{
  Options,
  log::{LogLevel, Logger},
  settings::Mode,
};
use camino::Utf8PathBuf;
use derive_more::Debug;
use std::sync::Arc;

/// The normalized path options for Power Plant.
#[derive(Debug, Clone)]
pub struct NormalizedPathOptions {
  /// The current working directory.
  pub cwd: Utf8PathBuf,
}

impl Default for NormalizedPathOptions {
  fn default() -> Self {
    Self { cwd: std::env::current_dir().unwrap().to_string_lossy().to_string().into() }
  }
}

/// The normalized path options for Power Plant.
#[derive(Debug, Clone)]
pub struct NormalizedOptions {
  /// The mode.
  pub mode: Option<Mode>,
  /// The user name to use for the application.
  pub username: Option<String>,
  /// The log level.
  pub log_level: LogLevel,
  /// Callback for logging messages.
  pub custom_logger: Option<Logger>,
  /// Normalized path options.
  pub paths: NormalizedPathOptions,
}

impl Default for NormalizedOptions {
  fn default() -> Self {
    Self {
      mode: None,
      username: None,
      log_level: LogLevel::default(),
      custom_logger: None,
      paths: NormalizedPathOptions::default(),
    }
  }
}

impl From<Options> for NormalizedOptions {
  fn from(opts: Options) -> Self {
    let cwd = opts.cwd.unwrap_or(std::env::current_dir().unwrap().to_string_lossy().to_string());

    Self {
      mode: opts.mode,
      username: opts.username,
      log_level: opts.log_level.unwrap_or_default(),
      custom_logger: opts.custom_logger,
      paths: NormalizedPathOptions { cwd: cwd.clone().into() },
    }
  }
}

/// Shared reference to NormalizedOptions.
pub type SharedNormalizedOptions = Arc<NormalizedOptions>;
