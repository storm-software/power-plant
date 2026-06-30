use power_plant_common::log::Log;

use crate::types::binding_log_level::BindingLogLevel;
use derive_more::Debug;

/// Represents a log entry in the Power Plant binding.
#[napi_derive::napi(object, object_from_js = false)]
#[derive(Debug, Clone)]
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
    let message = power_plant_common::log::LogMessage {
      message: value.message,
      code: value.code,
      details: value.details,
      plugin: value.plugin,
    };
    let level = BindingLogLevel::into(value.level);
    Self { message, level }
  }
}
