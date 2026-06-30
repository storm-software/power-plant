/// The `trace_action` macro logs a trace-level message with serialized metadata.
#[macro_export]
macro_rules! trace_action {
  ($expr:expr) => {
    tracing::trace!(meta = serde_json::to_string(&$expr).unwrap());
  };
}

/// The `trace_action_enabled` macro checks if trace-level logging is enabled.
#[macro_export]
macro_rules! trace_action_enabled {
  () => {
    tracing::enabled!(tracing::Level::TRACE)
  };
}
