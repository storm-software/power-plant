//! Paths used by the application.

use camino::Utf8PathBuf;
use config::{Value, ValueKind};
use dirs::{cache_dir, config_dir, data_dir, download_dir, executable_dir};

pub fn prefix() -> String {
  if cfg!(windows) {
    String::from("/Storm Software/Power Plant")
  } else if cfg!(target_os = "macos") {
    String::from("/Storm Software/Power Plant")
  } else {
    String::from("/storm-software/power-plant")
  }
}

pub fn get_cache_dir() -> String {
  std::env::var("CACHE_DIR")
    .unwrap_or_else(|_| cache_dir().unwrap().to_string_lossy().to_string() + prefix().as_str())
}

pub fn get_config_dir() -> String {
  std::env::var("CONFIG_DIR")
    .unwrap_or_else(|_| config_dir().unwrap().to_string_lossy().to_string() + prefix().as_str())
}

pub fn get_data_dir() -> String {
  std::env::var("DATA_DIR")
    .unwrap_or_else(|_| data_dir().unwrap().to_string_lossy().to_string() + prefix().as_str())
}

pub fn get_logs_dir() -> String {
  std::env::var("LOG_DIR")
    .unwrap_or_else(|_| data_dir().unwrap().to_string_lossy().to_string() + "/logs")
}

pub fn get_temp_dir() -> String {
  std::env::var("TEMP_DIR")
    .unwrap_or_else(|_| cache_dir().unwrap().to_string_lossy().to_string() + "/temp")
}

pub fn get_downloads_dir() -> String {
  std::env::var("DOWNLOADS_DIR")
    .unwrap_or_else(|_| download_dir().unwrap().to_string_lossy().to_string())
}

pub fn get_executable_dir() -> String {
  std::env::var("EXECUTABLE_DIR")
    .unwrap_or_else(|_| executable_dir().unwrap().to_string_lossy().to_string() + prefix().as_str())
}

pub fn get_settings_file_path() -> String {
  get_config_dir() + "/settings.json"
}

pub fn get_local_store_file_path() -> String {
  get_data_dir() + "/.local-store.json"
}

/// Paths used by the application.
#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(
  feature = "serde",
  derive(serde::Deserialize, serde::Serialize),
  serde(rename_all = "camelCase")
)]
pub struct EnvPaths {
  /// Path to the cache directory.
  pub cache: Utf8PathBuf,
  /// Path to the configuration directory.
  pub config: Utf8PathBuf,
  /// Path to the data directory.
  pub data: Utf8PathBuf,
  /// Path to the log directory.
  pub logs: Utf8PathBuf,
  /// Path to the temporary directory.
  pub temp: Utf8PathBuf,
  /// Path to the downloads directory.
  pub downloads: Utf8PathBuf,
  /// Path to the executable directory.
  pub executable: Utf8PathBuf,
}

impl Default for EnvPaths {
  fn default() -> Self {
    let cache = get_cache_dir();
    let config = get_config_dir();
    let data = get_data_dir();
    let logs = get_logs_dir();
    let temp = get_temp_dir();
    let downloads = get_downloads_dir();
    let executable = get_executable_dir();

    Self {
      cache: Utf8PathBuf::from(cache),
      config: Utf8PathBuf::from(config),
      data: Utf8PathBuf::from(data),
      logs: Utf8PathBuf::from(logs),
      temp: Utf8PathBuf::from(temp),
      downloads: Utf8PathBuf::from(downloads),
      executable: Utf8PathBuf::from(executable),
    }
  }
}

impl EnvPaths {
  pub fn new(
    cache: String,
    config: String,
    data: String,
    logs: String,
    temp: String,
    downloads: String,
    executable: String,
  ) -> Self {
    Self {
      cache: cache.into(),
      config: config.into(),
      data: data.into(),
      logs: logs.into(),
      temp: temp.into(),
      downloads: downloads.into(),
      executable: executable.into(),
    }
  }
}

impl Into<ValueKind> for EnvPaths {
  fn into(self) -> ValueKind {
    match self {
      Self { cache, config, data, logs, temp, downloads, executable } => {
        let mut map = std::collections::HashMap::new();
        map.insert("cache".to_string(), Value::from(cache.to_string()));
        map.insert("config".to_string(), Value::from(config.to_string()));
        map.insert("data".to_string(), Value::from(data.to_string()));
        map.insert("logs".to_string(), Value::from(logs.to_string()));
        map.insert("temp".to_string(), Value::from(temp.to_string()));
        map.insert("downloads".to_string(), Value::from(downloads.to_string()));
        map.insert("executable".to_string(), Value::from(executable.to_string()));
        ValueKind::Table(map)
      }
    }
  }
}
