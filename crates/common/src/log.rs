use derive_more::Debug;
use std::sync::Arc;
use std::{future::Future, pin::Pin};

use crate::{LogLevel, LogMessage};

/// Log structure representing a log message.
#[derive(Debug, Default)]
pub struct Log {
  /// The log message displayed to the user.
  pub message: LogMessage,
  /// The log level of the message.
  pub level: LogLevel,
}

impl Log {
  /// Convert a LogMessage into a Log with the specified level.
  #[must_use]
  pub fn from_message(message: LogMessage, level: LogLevel) -> Self {
    Self { message, level }
  }
}

/// Type alias for the asynchronous log handling function.
pub type LoggerFn =
  dyn Fn(Log) -> Pin<Box<dyn Future<Output = anyhow::Result<()>> + Send + 'static>> + Send + Sync;

/// Wrapper around the LoggerFn type alias.
#[derive(Clone, Debug)]
#[debug("LoggerFn::Fn(...)")]
pub struct Logger(Arc<LoggerFn>);

impl Logger {
  /// Create a new Logger instance from the given function.
  pub fn new(f: Arc<LoggerFn>) -> Self {
    Self(f)
  }

  /// Call the log handling function with the given log level and log.
  pub async fn call(&self, log: Log) -> anyhow::Result<()> {
    self.0(log).await
  }

  /// Call the log handling function with the given log level and log.
  pub async fn call_with_message(
    &self,
    message: LogMessage,
    level: Option<LogLevel>,
  ) -> anyhow::Result<()> {
    let log = match level {
      Some(level) => Log { level, message },
      None => Log { level: LogLevel::Info, message },
    };

    self.call(log).await
  }
}
