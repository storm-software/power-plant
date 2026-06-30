use derive_more::Debug;
use napi_derive::napi;
use power_plant_common::log::LogLevel;
use std::fmt::{self, Display, Formatter};

#[derive(Debug, PartialEq, Clone, Copy, Default)]
#[napi]
pub enum BindingLogLevel {
  Silent,
  Error,
  #[default]
  Warn,
  Info,
  Debug,
}

impl From<String> for BindingLogLevel {
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

impl Display for BindingLogLevel {
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

impl From<BindingLogLevel> for LogLevel {
  fn from(value: BindingLogLevel) -> Self {
    match value {
      BindingLogLevel::Silent => Self::Silent,
      BindingLogLevel::Error => Self::Error,
      BindingLogLevel::Warn => Self::Warn,
      BindingLogLevel::Info => Self::Info,
      BindingLogLevel::Debug => Self::Debug,
    }
  }
}

impl From<LogLevel> for BindingLogLevel {
  fn from(value: LogLevel) -> Self {
    match value {
      LogLevel::Silent => Self::Silent,
      LogLevel::Error => Self::Error,
      LogLevel::Warn => Self::Warn,
      LogLevel::Info => Self::Info,
      LogLevel::Debug => Self::Debug,
    }
  }
}
