/// Log level for Power Plant operations.

#[cfg(feature = "deserialize_bundler_options")]
use schemars::JsonSchema;
#[cfg(feature = "deserialize_bundler_options")]
use serde::Deserialize;
use std::fmt::{self, Display, Formatter};

/// Log level for Power Plant operations.
#[cfg_attr(
  feature = "deserialize_bundler_options",
  derive(Deserialize, JsonSchema),
  serde(rename_all = "camelCase", deny_unknown_fields)
)]
#[derive(Debug, PartialEq, Clone, Copy, Default)]
pub enum LogLevel {
  /// Show no logs.
  Silent,
  /// Show only error logs.
  Error,
  /// Show error and warning logs.
  Warn,
  /// Show error, warning, and informational logs.
  #[default]
  Info,
  /// Show error, warning, informational, and debug logs.
  Debug,
}

impl From<String> for LogLevel {
  fn from(value: String) -> Self {
    match value.as_str() {
      "silent" => Self::Silent,
      "error" => Self::Error,
      "warn" => Self::Warn,
      "info" => Self::Info,
      "debug" => Self::Debug,
      _ => panic!("Invalid log level: {value}"),
    }
  }
}

impl Display for LogLevel {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    match self {
      Self::Silent => write!(f, "silent"),
      Self::Error => write!(f, "error"),
      Self::Warn => write!(f, "warn"),
      Self::Info => write!(f, "info"),
      Self::Debug => write!(f, "debug"),
    }
  }
}
