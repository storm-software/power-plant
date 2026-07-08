use crate::{LogLevel, Logger, Mode, Options};
use camino::Utf8PathBuf;
use derive_more::Debug;
use std::sync::Arc;

/// The normalized path options for Power Plant.
#[derive(Debug, Clone)]
pub struct NormalizedPathOptions {
  /// The current working directory.
  pub cwd: Utf8PathBuf,
  /// Path to output directory.
  pub output: Utf8PathBuf,
}

impl Default for NormalizedPathOptions {
  fn default() -> Self {
    Self {
      cwd: std::env::current_dir().unwrap().to_string_lossy().to_string().into(),
      output: std::env::current_dir().unwrap().join("output").to_string_lossy().to_string().into(),
    }
  }
}

/// The normalized path options for Power Plant.
#[derive(Debug, Clone)]
pub struct NormalizedOptions {
  /// The mode.
  pub mode: Option<Mode>,
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
      log_level: LogLevel::default(),
      custom_logger: None,
      paths: NormalizedPathOptions::default(),
    }
  }
}

impl From<Options> for NormalizedOptions {
  fn from(opts: Options) -> Self {
    Self {
      mode: opts.mode,
      log_level: opts.log_level.unwrap_or_default(),
      custom_logger: opts.custom_logger,
      paths: NormalizedPathOptions {
        cwd: opts
          .cwd
          .unwrap_or(std::env::current_dir().unwrap().to_string_lossy().to_string())
          .into(),
        output: opts
          .output_path
          .unwrap_or(std::env::current_dir().unwrap().join("output").to_string_lossy().to_string())
          .into(),
      },
    }
  }
}

/// Shared reference to NormalizedOptions.
pub type SharedNormalizedOptions = Arc<NormalizedOptions>;
