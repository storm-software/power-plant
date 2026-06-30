use crate::types::binding_error::{BindingError, NativeError};
use camino::Utf8PathBuf;
use power_plant_error::{DiagnosticOptions, PowerPlantDiagnostic};

pub fn to_binding_error(diagnostic: &PowerPlantDiagnostic, path: Utf8PathBuf) -> BindingError {
  match diagnostic.downcast_napi_error() {
    Ok(napi_error) => {
      // Note: In WASM workers, napi::Error objects with maybe_raw/maybe_env references cannot be
      // safely shared across threads, which would cause try_clone() to fail. Currently, we don't
      // guarantee full JS error consistency in WASM environments. In the future, we could enhance
      // the BindingError fields to preserve all custom error properties and achieve complete JS
      // error consistency across all environments.
      #[cfg(not(target_family = "wasm"))]
      {
        use crate::types::binding_error::BindingError;

        let error = napi_error.try_clone().unwrap_or_else(|e| e);
        BindingError::JsError(napi::JsError::from(error))
      }
      #[cfg(target_family = "wasm")]
      {
        let error = napi::Error::new(napi_error.status, napi_error.reason.clone());
        BindingError::JsError(napi::JsError::from(error))
      }
    }
    Err(error) => BindingError::NativeError(NativeError {
      kind: error.kind().to_string(),
      message: error.to_diagnostic_with(&DiagnosticOptions { path }).to_color_string(),
    }),
  }
}
