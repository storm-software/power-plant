use serde::{Deserialize, Serialize};
use std::path::Path;

/// Input for searching stored execution metadata.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
pub struct GetSettingsInput {
  /// The current working directory to load settings from.
  pub cwd: Option<String>,
}

impl GetSettingsInput {
  pub fn new(cwd: Option<String>) -> Self {
    Self { cwd }
  }

  pub fn from_cwd(cwd: &Path) -> Self {
    Self { cwd: Some(cwd.to_string_lossy().to_string()) }
  }

  pub fn from_env() -> Self {
    Self { cwd: Some(std::env::current_dir().unwrap().to_string_lossy().to_string()) }
  }

  pub fn from_args(args: &[String]) -> Self {
    if args.len() > 0 { Self { cwd: Some(args[0].clone()) } } else { Self::from_env() }
  }
}
