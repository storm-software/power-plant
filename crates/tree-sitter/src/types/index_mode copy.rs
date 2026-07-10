use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};

use crate::Language;

/// Index breadth / similarity edge policy. Mirrors `cbm_index_mode_t`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[repr(u8)]
pub enum IndexMode {
  #[default]
  Full = 0,
  Moderate = 1,
  Fast = 2,
}

impl IndexMode {
  pub fn from_raw(value: i32) -> Self {
    match value {
      1 => Self::Moderate,
      2 => Self::Fast,
      _ => Self::Full,
    }
  }

  pub fn skips_moderate_only_passes(self) -> bool {
    matches!(self, Self::Fast)
  }
}
