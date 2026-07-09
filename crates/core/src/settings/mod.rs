//! Configuration types used by the Power Plant application.

use crate::{NormalizedOptions, log::LogLevel};
use camino::Utf8PathBuf;
use derive_more::Debug;

pub mod env_paths;
pub mod mode;

pub use env_paths::*;
pub use mode::*;

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
  /// The default user name to use for the application.
  pub default_user: String,
}

impl Default for Settings {
  fn default() -> Self {
    let config = config::Config::builder()
      .add_source(config::File::with_name(&get_settings_file_path()))
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
      default_user: if config.default_user.is_empty() {
        whoami::username().expect("Unable to determine current user").to_string()
      } else {
        config.default_user
      },
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
    default_user: String,
  ) -> Self {
    Self { mode, log_level, paths, skip_storage, default_user }
  }

  /// Load settings from the current working directory.
  pub fn from_cwd(cwd: &Utf8PathBuf) -> Self {
    let config = config::Config::builder()
      .add_source(config::File::with_name(&(cwd.to_string() + "/power-plant.config.json")))
      .add_source(config::File::with_name(&(cwd.to_string() + "/power-plant.json")))
      .add_source(config::File::with_name(&(cwd.to_string() + "/.power-plant/config.json")))
      .add_source(config::File::with_name(get_settings_file_path().as_str()))
      .add_source(config::Environment::with_prefix("POWER_PLANT"))
      .add_source(config::Environment::with_prefix("POWERPLANT"))
      .add_source(config::File::from_str(
        &serde_json::json!({ "paths": EnvPaths::default() }).to_string(),
        config::FileFormat::Json,
      ))
      .set_default("mode", Mode::default())
      .expect("Unable to default mode setting")
      .set_default("log_level", LogLevel::default())
      .expect("Unable to default log_level setting")
      .set_default("paths", EnvPaths::default())
      .expect("Unable to default paths setting")
      .set_default("skip_storage", false)
      .expect("Unable to default skip_storage setting")
      .set_default("default_user", whoami::username().unwrap_or_else(|_| "unknown".to_string()))
      .expect("Unable to default default_user setting")
      .build()
      .unwrap()
      .try_deserialize::<Settings>()
      .unwrap();

    Self {
      mode: config.mode,
      log_level: config.log_level,
      paths: config.paths,
      skip_storage: config.skip_storage,
      default_user: config.default_user,
    }
  }
}

impl From<&NormalizedOptions> for Settings {
  fn from(options: &NormalizedOptions) -> Self {
    Self::from_cwd(&options.cwd)
  }
}
