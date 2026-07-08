use std::sync::Arc;

use crate::types::binding_mode::BindingMode;
use crate::types::js_callback::JsCallbackExt;
use crate::types::{
  binding_log::BindingLog, binding_log_level::BindingLogLevel, js_callback::JsCallback,
};
use crate::utils::to_power_plant_error;
use napi::bindgen_prelude::Promise;
use power_plant_core::{Options, log::Logger};

pub type BindingLogger = Option<JsCallback<BindingLog, Promise<()>>>;

#[napi_derive::napi(object, object_to_js = false)]
#[derive(Clone)]
pub struct BindingOptions {
  /// The mode.
  #[napi(ts_type = "'development' | 'production' | 'test'")]
  pub mode: Option<BindingMode>,
  /// The username of the user currently using the application
  pub username: Option<String>,
  #[napi(ts_type = "'debug' | 'info' | 'warn' | 'error' | 'silent'")]
  /// The log level.
  pub log_level: Option<BindingLogLevel>,
  #[napi(
    ts_type = "(logLevel: 'debug' | 'info' | 'warn' | 'error', log: BindingLog) => Promise<void>"
  )]
  /// Callback for log messages.
  pub custom_logger: Option<BindingLogger>,
  /// The current working directory.
  pub cwd: Option<String>,
}

impl Default for BindingOptions {
  fn default() -> Self {
    Self { mode: None, username: None, log_level: None, custom_logger: None, cwd: None }
  }
}

impl Into<Options> for BindingOptions {
  fn into(self) -> Options {
    let log_level =
      if self.log_level.is_some() { Some(self.log_level.unwrap().into()) } else { None };

    let custom_logger = if self.custom_logger.is_some() {
      let on_log = self
        .custom_logger
        .unwrap()
        .map(|ts_fn| {
          Logger::new(Arc::new(move |log| {
            let ts_fn = Arc::clone(&ts_fn);
            Box::pin(async move {
              match ts_fn.invoke_async(log.into()).await {
                Ok(promise) => promise.await.map_err(to_power_plant_error),
                Err(err) => Err(to_power_plant_error(err)),
              }
            })
          }))
        })
        .unwrap();
      Some(on_log)
    } else {
      None
    };

    Options {
      mode: self.mode.map(|mode| mode.into()),
      username: self.username,
      log_level,
      custom_logger,
      cwd: self.cwd,
    }
  }
}
