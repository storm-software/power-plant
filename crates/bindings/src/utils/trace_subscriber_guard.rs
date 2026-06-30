use std::any::Any;

use napi_derive::napi;
use power_plant_common::{Log, LogLevel, LogMessage, NormalizedOptions};
use power_plant_error::{DiagnosticOptions, PowerPlantDiagnostic};
use power_plant_tracing::try_init_tracing;

#[napi]
#[derive(Debug)]
pub struct TraceSubscriberGuard {
  guard: Option<Box<dyn Any + Send>>,
}

#[napi]
impl TraceSubscriberGuard {
  #[napi]
  pub fn close(&mut self) {
    self.guard.take();
  }
}

#[napi]
pub fn init_trace_subscriber() -> Option<TraceSubscriberGuard> {
  let maybe_guard = try_init_tracing();
  let guard = maybe_guard?;
  Some(TraceSubscriberGuard { guard: Some(guard) })
}

pub fn handle_result<T>(result: anyhow::Result<T>) -> napi::Result<T> {
  result.map_err(|e| match e.downcast::<napi::Error>() {
    Ok(e) => e,
    Err(e) => napi::Error::from_reason(format!("Power Plant downcast internal error: {e}")),
  })
}

pub async fn handle_warnings(
  path: &str,
  warnings: Vec<PowerPlantDiagnostic>,
  options: &NormalizedOptions,
) -> anyhow::Result<()> {
  if options.log_level == LogLevel::Silent {
    return Ok(());
  }

  if let Some(logger) = options.custom_logger.as_ref() {
    for warning in warnings {
      logger
        .call(Log {
          level: LogLevel::Warn,
          message: LogMessage {
            code: Some(warning.kind().to_string()),
            message: warning
              .to_diagnostic_with(&DiagnosticOptions { path: path.into() })
              .to_color_string(),
            details: None,
            plugin: None,
          },
        })
        .await?;
    }
  }
  Ok(())
}
