use crate::PowerPlantDiagnostic;

pub fn downcast_napi_error_diagnostics(err: anyhow::Error) -> anyhow::Result<PowerPlantDiagnostic> {
  #[cfg(feature = "napi")]
  {
    err.downcast::<napi::Error>().map(PowerPlantDiagnostic::napi_error)
  }
  #[cfg(not(feature = "napi"))]
  {
    Err(err)
  }
}
