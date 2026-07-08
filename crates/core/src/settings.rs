//! Configuration types used by the Power Plant application.

use std::path::Path;

use crate::{
  LogLevel, Mode, NormalizedOptions,
  env_paths::{EnvPaths, get_config_dir},
};
use derive_more::Debug;

/// Application settings.
#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(
  feature = "serde",
  derive(serde::Deserialize, serde::Serialize),
  serde(rename_all = "camelCase", deny_unknown_fields)
)]
pub struct Settings {
  /// The mode to use for the application.
  pub mode: Mode,
  /// The log level to use for the application.
  pub log_level: LogLevel,
  /// The paths to use for the application.
  pub paths: EnvPaths,
  /// Whether to skip execution metadata storage after completing generation.
  pub skip_storage: bool,
  /// Whether to skip tracing.
  pub skip_tracing: bool,
}

impl Default for Settings {
  fn default() -> Self {
    let config = config::Config::builder()
      .add_source(config::File::with_name(&(get_config_dir().to_owned() + "/settings.json")))
      .add_source(config::Environment::with_prefix("POWER_PLANT"))
      .add_source(config::Environment::with_prefix("POWERPLANT"))
      .add_source(config::File::from_str(
        &serde_json::json!({ "paths": EnvPaths::default() }).to_string(),
        config::FileFormat::Json,
      ))
      .build()
      .unwrap()
      .try_deserialize::<Settings>()
      .unwrap();

    Self {
      mode: config.mode,
      log_level: config.log_level,
      paths: config.paths,
      skip_storage: config.skip_storage,
      skip_tracing: config.skip_tracing,
    }
  }
}

impl Settings {
  /// Create a new settings instance.
  pub fn new(
    mode: Mode,
    log_level: LogLevel,
    paths: EnvPaths,
    skip_storage: bool,
    skip_tracing: bool,
  ) -> Self {
    Self { mode, log_level, paths, skip_storage, skip_tracing }
  }

  /// Load settings from the current working directory.
  pub fn from_cwd(cwd: &Path) -> Self {
    let config = config::Config::builder()
      .add_source(config::File::with_name(
        &(cwd.to_string_lossy().to_string() + "/power-plant.config.json"),
      ))
      .add_source(config::File::with_name(
        &(cwd.to_string_lossy().to_string() + "/power-plant.json"),
      ))
      .add_source(config::File::with_name(
        &(cwd.to_string_lossy().to_string() + "/.power-plant/config.json"),
      ))
      .add_source(config::File::with_name(&(get_config_dir().to_owned() + "/settings.json")))
      .add_source(config::Environment::with_prefix("POWER_PLANT"))
      .add_source(config::Environment::with_prefix("POWERPLANT"))
      .add_source(config::File::from_str(
        &serde_json::json!({ "paths": EnvPaths::default() }).to_string(),
        config::FileFormat::Json,
      ))
      .build()
      .unwrap()
      .try_deserialize::<Settings>()
      .unwrap();

    Self {
      mode: config.mode,
      log_level: config.log_level,
      paths: config.paths,
      skip_storage: config.skip_storage,
      skip_tracing: config.skip_tracing,
    }
  }

  pub fn from_normalized_options(options: NormalizedOptions) -> Self {
    let mut settings = Self::from_cwd(options.paths.cwd.as_std_path());
    settings.mode = options.mode.unwrap_or(settings.mode);
    settings.log_level = options.log_level;
    settings.skip_storage = false;
    settings.skip_tracing = false;

    settings
  }
}
