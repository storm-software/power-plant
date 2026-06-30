use crate::types::{binding_log::BindingLog, binding_log_level::BindingLogLevel};
use derive_more::Debug;
use power_plant_common::StoreOutput;
use power_plant_error::Severity;

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
