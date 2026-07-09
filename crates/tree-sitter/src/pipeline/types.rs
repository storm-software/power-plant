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

/// One source file skipped during indexing (Track B).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileError {
  pub path: String,
  pub reason: String,
  pub phase: FileErrorPhase,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FileErrorPhase {
  Read,
  Extract,
  Oversized,
}

impl FileErrorPhase {
  pub fn as_str(self) -> &'static str {
    match self {
      Self::Read => "read",
      Self::Extract => "extract",
      Self::Oversized => "oversized",
    }
  }
}

/// Discovered file metadata passed into pipeline passes.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileInfo {
  pub path: PathBuf,
  pub rel_path: String,
  pub language: Language,
}

impl FileInfo {
  pub fn new(path: PathBuf, rel_path: impl Into<String>) -> Self {
    let rel_path = rel_path.into();
    let language = Language::from(&rel_path);

    Self { path, rel_path, language }
  }
}

/// Committed graph size captured at dump time (-1 when dump did not run).
#[derive(Debug, Clone, Copy, Default)]
pub struct CommittedCounts {
  pub nodes: i32,
  pub edges: i32,
}

impl CommittedCounts {
  pub const UNSET: Self = Self { nodes: -1, edges: -1 };
}

/// Cancellation flag shared across pipeline phases.
#[derive(Debug, Default)]
pub struct CancellationToken(AtomicBool);

impl CancellationToken {
  pub fn cancel(&self) {
    self.0.store(true, Ordering::SeqCst);
  }

  pub fn is_cancelled(&self) -> bool {
    self.0.load(Ordering::SeqCst)
  }
}

/// Minimum discovered files before choosing the parallel extraction path.
pub const MIN_FILES_FOR_PARALLEL: usize = 50;

/// Sequential extraction passes (definitions → k8s → lsp_cross → calls → usages → semantic).
pub const SEQUENTIAL_PASS_COUNT: usize = 6;
