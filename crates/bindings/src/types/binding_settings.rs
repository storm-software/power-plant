use crate::types::binding_log_level::BindingLogLevel;
use crate::types::binding_mode::BindingMode;
use napi_derive::napi;
use power_plant_core::settings::{EnvPaths, Settings};
use std::fmt::{self, Display, Formatter};

use crate::types::binding_env_paths::BindingEnvPaths;

#[derive(Clone, PartialEq, Eq)]
#[napi(object)]
pub struct BindingSettings {
  /// The app mode to use.
  #[napi(ts_type = "'development' | 'production' | 'test'")]
  pub mode: BindingMode,
  /// The default username to use.
  pub default_user: String,
  /// The paths to use.``
  #[napi(
    ts_type = "{ cache: string, config: string, data: string, logs: string, temp: string, downloads: string, executable: string }"
  )]
  pub paths: BindingEnvPaths,
  /// The log level to use.
  #[napi(ts_type = "'debug' | 'info' | 'warn' | 'error' | 'silent'")]
  pub log_level: BindingLogLevel,
  /// Whether to skip storage.
  pub skip_storage: bool,
}

impl Default for BindingSettings {
  fn default() -> Self {
    Self {
      mode: BindingMode::Production,
      paths: BindingEnvPaths::default(),
      default_user: String::from("default"),
      log_level: BindingLogLevel::Info,
      skip_storage: false,
    }
  }
}

impl BindingSettings {
  /// Create a new settings instance.
  pub fn new(
    mode: BindingMode,
    default_user: String,
    paths: BindingEnvPaths,
    log_level: BindingLogLevel,
    skip_storage: bool,
  ) -> Self {
    Self { mode, default_user, paths, log_level, skip_storage }
  }
}

impl Display for BindingSettings {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    write!(
      f,
      "mode: {}, default_user: {}, paths: {}, log_level: {}, skip_storage: {}",
      self.mode, self.default_user, self.paths, self.log_level, self.skip_storage
    )
  }
}

impl From<Settings> for BindingSettings {
  fn from(value: Settings) -> Self {
    Self {
      mode: value.mode.into(),
      paths: value.paths.into(),
      log_level: value.log_level.into(),
      default_user: value.default_user,
      skip_storage: value.skip_storage,
    }
  }
}

impl From<BindingSettings> for Settings {
  fn from(value: BindingSettings) -> Self {
    Self {
      mode: value.mode.into(),
      paths: value.paths.clone().into(),
      log_level: value.log_level.into(),
      default_user: value.default_user,
      skip_storage: value.skip_storage,
    }
  }
}

impl From<BindingEnvPaths> for EnvPaths {
  fn from(value: BindingEnvPaths) -> Self {
    Self {
      cache: value.cache.into(),
      config: value.config.into(),
      data: value.data.into(),
      logs: value.logs.into(),
      temp: value.temp.into(),
      downloads: value.downloads.into(),
      executable: value.executable.into(),
    }
  }
}
