use derive_more::Debug;
use power_plant_error::PowerPlantDiagnostic;

/// Output of the preparation process, containing any warnings and the prepared routes.
#[derive(Default, Debug)]
pub struct StoreOutput {
  /// Whether the store operation was successful.
  pub success: bool,
  /// Any warnings encountered during the store operation.
  pub warnings: Vec<PowerPlantDiagnostic>,
}
