use derive_more::Debug;

/// Output of the store operation, containing any errors.
#[derive(Default, Debug)]
pub struct StoreOutput {
  /// Whether the store operation was successful.
  pub success: bool,
  /// Any errors encountered during the store operation.
  pub errors: Vec<String>,
}
