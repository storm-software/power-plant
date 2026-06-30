use std::sync::Arc;

use crate::types::js_callback::JsCallbackExt;
use crate::types::{
  binding_log::BindingLog, binding_log_level::BindingLogLevel, js_callback::JsCallback,
};
use derive_more::Debug;
use napi::bindgen_prelude::Promise;
use power_plant_common::{Logger, Options};
pub type BindingLogger = Option<JsCallback<BindingLog, Promise<()>>>;

#[napi_derive::napi(object, object_to_js = false)]
#[derive(Debug)]
pub struct BindingOptions {
  #[napi(ts_type = "'debug' | 'info' | 'warn' | 'error' | 'silent'")]
  /// The log level.
  pub log_level: Option<BindingLogLevel>,
  #[debug(skip)]
  #[napi(
    ts_type = "(logLevel: 'debug' | 'info' | 'warn' | 'error', log: BindingLog) => Promise<void>"
  )]
  /// Callback for log messages.
  pub custom_logger: Option<BindingLogger>,
  /// Disable tracing.
  pub disable_tracing: Option<bool>,
  /// The current working directory.
  pub cwd: String,
  /// Path to cache directory.
  pub cache_path: String,
  /// Path to data directory.
  pub data_path: String,
  /// Path to log directory.
  pub log_path: String,
  /// Path to temporary directory.
  pub temp_path: String,
  /// Path to configuration directory.
  pub config_path: String,
  /// Path to output directory.
  pub output_path: String,
}

impl Default for BindingOptions {
  fn default() -> Self {
    Self {
      log_level: None,
      disable_tracing: None,
      custom_logger: None,
      cwd: std::env::current_dir().unwrap().to_string_lossy().to_string(),
      cache_path: String::new(),
      data_path: String::new(),
      log_path: String::new(),
      temp_path: String::new(),
      config_path: String::new(),
      output_path: String::new(),
    }
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
              ts_fn.invoke_async(log.into()).await?.await.map_err(anyhow::Error::from)
            })
          }))
        })
        .unwrap();
      Some(on_log)
    } else {
      None
    };

    Options {
      log_level,
      disable_tracing: self.disable_tracing,
      custom_logger,
      cwd: self.cwd,
      cache_path: self.cache_path,
      data_path: self.data_path,
      log_path: self.log_path,
      temp_path: self.temp_path,
      config_path: self.config_path,
      output_path: self.output_path,
    }
  }
}
