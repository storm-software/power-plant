use derive_more::Debug;

/// Log structure representing a log message.
#[derive(Debug, Default)]
pub struct LogMessage {
  /// The log message displayed to the user.
  pub message: String,
  /// The log code associated with the message.
  pub code: Option<String>,
  /// Additional details about the log message.
  pub details: Option<String>,
  /// The plugin that generated the log message.
  pub plugin: Option<String>,
}
