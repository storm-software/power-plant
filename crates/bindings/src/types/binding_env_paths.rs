use napi_derive::napi;
use power_plant_core::settings::EnvPaths;
use std::fmt::{self, Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq)]
#[napi(object)]
pub struct BindingEnvPaths {
  /// Path to the cache directory.
  pub cache: String,
  /// Path to the configuration directory.
  pub config: String,
  /// Path to the data directory.
  pub data: String,
  /// Path to the log directory.
  pub logs: String,
  /// Path to the temporary directory.
  pub temp: String,
  /// Path to the downloads directory.
  pub downloads: String,
  /// Path to the executable directory.
  pub executable: String,
}

impl BindingEnvPaths {
  pub fn new(
    cache: String,
    config: String,
    data: String,
    logs: String,
    temp: String,
    downloads: String,
    executable: String,
  ) -> Self {
    Self { cache, config, data, logs, temp, downloads, executable }
  }
}

impl Display for BindingEnvPaths {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    write!(
      f,
      "cache: {}, config: {}, data: {}, logs: {}, temp: {}, downloads: {}, executable: {}",
      self.cache, self.config, self.data, self.logs, self.temp, self.downloads, self.executable
    )
  }
}

impl From<EnvPaths> for BindingEnvPaths {
  fn from(value: EnvPaths) -> Self {
    match value {
      EnvPaths { cache, config, data, logs, temp, downloads, executable } => Self {
        cache: cache.to_string(),
        config: config.to_string(),
        data: data.to_string(),
        logs: logs.to_string(),
        temp: temp.to_string(),
        downloads: downloads.to_string(),
        executable: executable.to_string(),
      },
    }
  }
}

impl Default for BindingEnvPaths {
  fn default() -> Self {
    Self {
      cache: EnvPaths::default().cache.to_string(),
      config: EnvPaths::default().config.to_string(),
      data: EnvPaths::default().data.to_string(),
      logs: EnvPaths::default().logs.to_string(),
      temp: EnvPaths::default().temp.to_string(),
      downloads: EnvPaths::default().downloads.to_string(),
      executable: EnvPaths::default().executable.to_string(),
    }
  }
}
