use std::path::PathBuf;

use crate::Language;

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
