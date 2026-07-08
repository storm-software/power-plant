use crate::types::binding_log_level::BindingLogLevel;
use crate::types::binding_mode::BindingMode;
use napi_derive::napi;
use power_plant_core::{EnvPaths, Settings};
use std::fmt::{self, Display, Formatter};

use crate::types::binding_env_paths::BindingEnvPaths;

#[derive(Clone, PartialEq, Eq)]
#[napi(object)]
pub struct BindingSettings {
  /// The app mode to use.
  #[napi(ts_type = "'development' | 'production' | 'test'")]
  pub mode: BindingMode,
  /// The paths to use.``
  #[napi(
    ts_type = "{ cache: string, config: string, data: string, logs: string, temp: string, downloads: string, executable: string }"
  )]
  pub paths: BindingEnvPaths,
  /// The log level to use.
  #[napi(ts_type = "'debug' | 'info' | 'warn' | 'error' | 'silent'")]
  pub log_level: BindingLogLevel,
  /// Whether to skip execution metadata storage after completing generation.
  #[napi(ts_type = "boolean")]
  pub skip_storage: bool,
  /// Whether to skip tracing.
  #[napi(ts_type = "boolean")]
  pub skip_tracing: bool,
}

impl Default for BindingSettings {
  fn default() -> Self {
    Self {
      mode: BindingMode::Production,
      paths: BindingEnvPaths::default(),
      log_level: BindingLogLevel::Info,
      skip_storage: false,
      skip_tracing: false,
    }
  }
}

impl BindingSettings {
  /// Create a new settings instance.
  pub fn new(
    mode: BindingMode,
    paths: BindingEnvPaths,
    log_level: BindingLogLevel,
    skip_storage: bool,
    skip_tracing: bool,
  ) -> Self {
    Self { mode, paths, log_level, skip_storage, skip_tracing }
  }
}

impl Display for BindingSettings {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    write!(
      f,
      "mode: {}, paths: {}, log_level: {}, skip_storage: {}, skip_tracing: {}",
      self.mode, self.paths, self.log_level, self.skip_storage, self.skip_tracing
    )
  }
}

impl From<Settings> for BindingSettings {
  fn from(value: Settings) -> Self {
    Self {
      mode: value.mode.into(),
      paths: value.paths.into(),
      log_level: value.log_level.into(),
      skip_storage: value.skip_storage,
      skip_tracing: value.skip_tracing,
    }
  }
}

impl From<BindingSettings> for Settings {
  fn from(value: BindingSettings) -> Self {
    Self {
      mode: value.mode.into(),
      paths: value.paths.clone().into(),
      log_level: value.log_level.into(),
      skip_storage: value.skip_storage,
      skip_tracing: value.skip_tracing,
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
