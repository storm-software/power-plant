use serde::{Deserialize, Serialize};

use crate::settings::Settings;

/// Output of settings loading.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GetSettingsOutput {
  /// The loaded settings.
  pub settings: Settings,
}

impl From<Settings> for GetSettingsOutput {
  fn from(value: Settings) -> Self {
    Self { settings: value }
  }
}
