///! Log level for Power Plant operations.
use config::ValueKind;

#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};
use std::fmt::{self, Display, Formatter};

/// Log level for Power Plant operations.
#[cfg_attr(feature = "serde", derive(Serialize, Deserialize), serde(rename_all = "camelCase"))]
#[derive(Debug, PartialEq, Eq, Clone, Copy, Default)]
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

impl Into<ValueKind> for LogLevel {
  fn into(self) -> ValueKind {
    match self {
      Self::Silent => ValueKind::String("silent".to_string()),
      Self::Error => ValueKind::String("error".to_string()),
      Self::Warn => ValueKind::String("warn".to_string()),
      Self::Info => ValueKind::String("info".to_string()),
      Self::Debug => ValueKind::String("debug".to_string()),
    }
  }
}
