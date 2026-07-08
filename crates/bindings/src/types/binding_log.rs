use power_plant_core::{Log, LogMessage};

use crate::types::binding_log_level::BindingLogLevel;

/// Represents a log entry in the Power Plant binding.
#[napi_derive::napi(object, object_from_js = false)]
#[derive(Clone)]
pub struct BindingLog {
  /// The log message.
  pub message: String,
  /// The log code.
  pub code: Option<String>,
  /// Additional details about the log.
  pub details: Option<String>,
  /// The log level.
  pub level: BindingLogLevel,
  /// The plugin that generated the log.
  pub plugin: Option<String>,
}

impl From<Log> for BindingLog {
  fn from(value: Log) -> Self {
    Self {
      code: value.message.code,
      message: value.message.message,
      details: value.message.details,
      level: BindingLogLevel::from(value.level),
      plugin: value.message.plugin,
    }
  }
}

impl From<BindingLog> for Log {
  fn from(value: BindingLog) -> Self {
    let message = LogMessage {
      message: value.message,
      code: value.code,
      details: value.details,
      plugin: value.plugin,
    };
    let level = BindingLogLevel::into(value.level);
    Self { message, level }
  }
}
