use config::ValueKind;

/// Application mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[cfg_attr(
  feature = "serde",
  derive(serde::Deserialize, serde::Serialize),
  serde(rename_all = "camelCase")
)]
pub enum Mode {
  /// Development mode.
  Development,
  /// Production mode.
  Production,
  /// Test mode.
  Test,
}

impl Default for Mode {
  fn default() -> Self {
    for var in ["POWER_PLANT_MODE", "NODE_ENV", "POWER_PLANT_ENV"] {
      if let Ok(value) = std::env::var(var) {
        if let Some(mode) = Self::from_env_value(&value) {
          return mode;
        }
      }
    }

    Self::Production
  }
}

impl Mode {
  fn from_env_value(value: &str) -> Option<Self> {
    match value.to_ascii_lowercase().as_str() {
      "development" => Some(Self::Development),
      "production" => Some(Self::Production),
      "test" => Some(Self::Test),
      _ => None,
    }
  }

  /// Check if the mode is development.
  pub fn is_development(&self) -> bool {
    *self == Self::Development
  }

  /// Check if the mode is production.
  pub fn is_production(&self) -> bool {
    *self == Self::Production
  }

  /// Check if the mode is test.
  pub fn is_test(&self) -> bool {
    *self == Self::Test
  }

  /// Check if the mode is development or test.
  pub fn is_development_or_test(&self) -> bool {
    *self == Self::Development || *self == Self::Test
  }
}

impl Into<ValueKind> for Mode {
  fn into(self) -> ValueKind {
    match self {
      Self::Development => ValueKind::String("development".to_string()),
      Self::Production => ValueKind::String("production".to_string()),
      Self::Test => ValueKind::String("test".to_string()),
    }
  }
}
