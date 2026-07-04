use crate::types::binding_error::{BindingError, NativeError};
use power_plant_core::PowerPlantError;

pub fn to_binding_error(err: &dyn PowerPlantError) -> BindingError {
  BindingError::NativeError(NativeError { kind: err.kind(), message: err.message() })
}

struct NapiBindingError(napi::Error);

impl PowerPlantError for NapiBindingError {
  fn kind(&self) -> String {
    "JsError".to_string()
  }

  fn message(&self) -> String {
    self.0.reason.clone()
  }
}

pub fn to_power_plant_error(err: napi::Error) -> Box<dyn PowerPlantError + Send + Sync> {
  Box::new(NapiBindingError(err))
}
