use crate::types::{binding_input::BindingExecution, binding_log::BindingLog, binding_log_level::BindingLogLevel};
use derive_more::Debug;
use power_plant_common::{RecallOutput, StoreOutput};
use power_plant_error::Severity;

#[derive(Debug, Clone, PartialEq)]
#[napi_derive::napi(object, object_from_js = false)]
pub struct BindingRecallOutput {
  /// The recalled execution.
  pub execution: BindingExecution,
}

#[derive(Default, Debug)]
#[napi_derive::napi(object, object_from_js = false)]
pub struct BindingStoreOutput {
  /// Whether the store operation was successful.
  pub success: bool,
  /// Any warnings encountered during the store operation.
  pub warnings: Vec<BindingLog>,
}

impl From<StoreOutput> for BindingStoreOutput {
  fn from(value: StoreOutput) -> Self {
    Self {
      success: value.success,
      warnings: value
        .warnings
        .into_iter()
        .map(|diagnostic| BindingLog {
          message: diagnostic.to_string(),
          code: diagnostic.id(),
          details: None,
          level: match diagnostic.severity() {
            Severity::Error => BindingLogLevel::Error,
            Severity::Warning => BindingLogLevel::Warn,
          },
          plugin: diagnostic.exporter(),
        })
        .collect(),
    }
  }
}

impl From<RecallOutput> for BindingRecallOutput {
  fn from(value: RecallOutput) -> Self {
    Self { execution: value.execution.into() }
  }
}
