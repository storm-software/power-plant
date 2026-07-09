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
pub struct NormalizedOptions {
  /// The mode.
  pub mode: Option<Mode>,
  /// The user name to use for the application.
  pub username: Option<String>,
  /// The log level.
  pub log_level: LogLevel,
  /// Callback for logging messages.
  pub custom_logger: Option<Logger>,
  /// The current working directory.
  pub cwd: Utf8PathBuf,
  /// The repository root.
  pub repository_root: Utf8PathBuf,
}

impl Default for NormalizedOptions {
  fn default() -> Self {
    let cwd = Utf8PathBuf::from_path_buf(std::env::current_dir().unwrap()).unwrap();

    Self {
      mode: None,
      username: None,
      log_level: LogLevel::default(),
      custom_logger: None,
      cwd: cwd.clone(),
      repository_root: cwd,
    }
  }
}

impl From<Options> for NormalizedOptions {
  fn from(opts: Options) -> Self {
    Self {
      mode: opts.mode,
      username: opts.username,
      log_level: opts.log_level.unwrap_or_default(),
      custom_logger: opts.custom_logger,
      cwd: opts
        .cwd
        .unwrap_or(std::env::current_dir().unwrap().to_string_lossy().to_string())
        .into(),
      repository_root: opts
        .repository_root
        .unwrap_or(std::env::current_dir().unwrap().to_string_lossy().to_string())
        .into(),
    }
  }
}

/// Shared reference to NormalizedOptions.
pub type SharedNormalizedOptions = Arc<NormalizedOptions>;
