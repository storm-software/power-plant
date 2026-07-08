use napi_derive::napi;
use power_plant_core::settings::Mode;
use std::fmt::{self, Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[napi]
pub enum BindingMode {
  /// Development mode.
  Development,
  /// Production mode.
  Production,
  /// Test mode.
  Test,
}

impl From<String> for BindingMode {
  fn from(value: String) -> Self {
    match value.as_str() {
      "development" => Self::Development,
      "production" => Self::Production,
      "test" => Self::Test,
      _ => panic!("Invalid app mode: {value}"),
    }
  }
}

impl Display for BindingMode {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    match self {
      Self::Development => write!(f, "development"),
      Self::Production => write!(f, "production"),
      Self::Test => write!(f, "test"),
    }
  }
}

impl From<BindingMode> for Mode {
  fn from(value: BindingMode) -> Self {
    match value {
      BindingMode::Development => Self::Development,
      BindingMode::Production => Self::Production,
      BindingMode::Test => Self::Test,
    }
  }
}

impl From<Mode> for BindingMode {
  fn from(value: Mode) -> Self {
    match value {
      Mode::Development => Self::Development,
      Mode::Production => Self::Production,
      Mode::Test => Self::Test,
    }
  }
}
