use crate::{Logger, Options, log::LogLevel};
use camino::Utf8PathBuf;
use derive_more::Debug;
use std::sync::Arc;

/// The normalized path options for Power Plant.
#[derive(Debug, Clone)]
pub struct NormalizedPathOptions {
  /// The current working directory.
  pub cwd: Utf8PathBuf,
  /// Path to cache directory.
  pub cache_path: Utf8PathBuf,
  /// Path to data directory.
  pub data_path: Utf8PathBuf,
  /// Path to log directory.
  pub log_path: Utf8PathBuf,
  /// Path to temporary directory.
  pub temp_path: Utf8PathBuf,
  /// Path to configuration directory.
  pub config_path: Utf8PathBuf,
  /// Path to output directory.
  pub output_path: Utf8PathBuf,
}

impl Default for NormalizedPathOptions {
  fn default() -> Self {
    Self {
      cwd: std::env::current_dir().unwrap().to_string_lossy().to_string().into(),
      cache_path: std::env::current_dir()
        .unwrap()
        .join(".cache")
        .to_string_lossy()
        .to_string()
        .into(),
      data_path: std::env::current_dir().unwrap().join("data").to_string_lossy().to_string().into(),
      log_path: std::env::current_dir().unwrap().join("log").to_string_lossy().to_string().into(),
      temp_path: std::env::current_dir().unwrap().join("tmp").to_string_lossy().to_string().into(),
      config_path: std::env::current_dir()
        .unwrap()
        .join(".config")
        .to_string_lossy()
        .to_string()
        .into(),
      output_path: std::env::current_dir()
        .unwrap()
        .join("output")
        .to_string_lossy()
        .to_string()
        .into(),
    }
  }
}

/// The normalized path options for Power Plant.
#[derive(Debug, Clone)]
pub struct NormalizedOptions {
  /// The log level.
  pub log_level: LogLevel,
  /// Callback for logging messages.
  pub custom_logger: Option<Logger>,
  /// Whether to disable tracing.
  pub disable_tracing: bool,
  /// Normalized path options.
  pub paths: NormalizedPathOptions,
}

impl Default for NormalizedOptions {
  fn default() -> Self {
    Self {
      log_level: LogLevel::default(),
      custom_logger: None,
      disable_tracing: false,
      paths: NormalizedPathOptions::default(),
    }
  }
}

impl From<Options> for NormalizedOptions {
  fn from(opts: Options) -> Self {
    Self {
      log_level: opts.log_level.unwrap_or_default(),
      custom_logger: opts.custom_logger,
      disable_tracing: opts.disable_tracing.unwrap_or(false),
      paths: NormalizedPathOptions {
        cwd: opts.cwd.into(),
        cache_path: opts.cache_path.into(),
        data_path: opts.data_path.into(),
        log_path: opts.log_path.into(),
        temp_path: opts.temp_path.into(),
        config_path: opts.config_path.into(),
        output_path: opts.output_path.into(),
      },
    }
  }
}

/// Shared reference to NormalizedOptions.
pub type SharedNormalizedOptions = Arc<NormalizedOptions>;
