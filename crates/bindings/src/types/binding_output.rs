use crate::types::{binding_input::BindingExecution, binding_settings::BindingSettings};
use power_plant_core::{GetSettingsOutput, RecallOutput, SearchOutput, StoreOutput};

#[derive(Clone, PartialEq, Eq)]
#[napi_derive::napi(object, object_from_js = false)]
pub struct BindingGetSettingsOutput {
  /// The loaded settings.
  pub settings: BindingSettings,
}

impl From<GetSettingsOutput> for BindingGetSettingsOutput {
  fn from(value: GetSettingsOutput) -> Self {
    Self { settings: BindingSettings::from(value.settings) }
  }
}

#[derive(Clone)]
#[napi_derive::napi(object, object_from_js = false)]
pub struct BindingRecallOutput {
  /// The recalled execution.
  pub execution: BindingExecution,
}

impl PartialEq for BindingExecution {
  fn eq(&self, other: &Self) -> bool {
    self.documents == other.documents && self.meta == other.meta
  }
}

impl Eq for BindingExecution {}

impl PartialEq for BindingRecallOutput {
  fn eq(&self, other: &Self) -> bool {
    self.execution == other.execution
  }
}

impl Eq for BindingRecallOutput {}

#[derive(Clone)]
#[napi_derive::napi(object, object_from_js = false)]
pub struct BindingExecutionSearchHit {
  /// The id of the matching execution.
  pub execution_id: String,
  /// Relevance score when provided by the search backend.
  pub score: Option<f64>,
  /// Short excerpt from the matched metadata, when available.
  pub snippet: Option<String>,
}

#[derive(Clone)]
#[napi_derive::napi(object, object_from_js = false)]
pub struct BindingSearchOutput {
  /// Matching executions ordered by relevance.
  pub hits: Vec<BindingExecutionSearchHit>,
}

#[derive(Clone, PartialEq, Eq, Default)]
#[napi_derive::napi(object, object_from_js = false)]
pub struct BindingStoreOutput {
  /// Whether the store operation was successful.
  pub success: bool,
  /// Any warnings encountered during the store operation.
  pub errors: Vec<String>,
}

impl From<StoreOutput> for BindingStoreOutput {
  fn from(value: StoreOutput) -> Self {
    Self {
      success: value.success,
      errors: value.errors.into_iter().map(|error| error.to_string()).collect(),
    }
  }
}

impl From<RecallOutput> for BindingRecallOutput {
  fn from(value: RecallOutput) -> Self {
    Self { execution: value.execution.into() }
  }
}

impl From<SearchOutput> for BindingSearchOutput {
  fn from(value: SearchOutput) -> Self {
    Self {
      hits: value
        .hits
        .into_iter()
        .map(|hit| BindingExecutionSearchHit {
          execution_id: hit.execution_id,
          score: hit.score,
          snippet: hit.snippet,
        })
        .collect(),
    }
  }
}
