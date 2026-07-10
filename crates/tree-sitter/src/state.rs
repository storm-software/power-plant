use std::path::{Path, PathBuf};
use std::sync::Arc;

use super::fqn;
use crate::{CancellationToken, CommittedCounts, FileError, FileErrorPhase, IndexMode};

/// Main indexing pipeline handle. Mirrors `cbm_pipeline_t`.
#[derive(Debug)]
pub struct Pipeline {
  pub repo_path: PathBuf,
  pub db_path: Option<PathBuf>,
  pub project_name: String,
  pub mode: IndexMode,
  pub persistence: bool,
  pub cancelled: Arc<CancellationToken>,
  pub excluded_dirs: Vec<String>,
  pub file_errors: Vec<FileError>,
  pub committed: CommittedCounts,
  saved_adr: Option<String>,
}

impl Pipeline {
  pub fn new(repo_path: impl Into<PathBuf>, db_path: Option<PathBuf>, mode: IndexMode) -> Self {
    let repo_path = repo_path.into();
    let project_name = fqn::project_name_from_path_buf(&repo_path);
    Self {
      repo_path,
      db_path,
      project_name,
      mode,
      persistence: false,
      cancelled: Arc::new(CancellationToken::default()),
      excluded_dirs: Vec::new(),
      file_errors: Vec::new(),
      committed: CommittedCounts::UNSET,
      saved_adr: None,
    }
  }

  pub fn set_persistence(&mut self, enabled: bool) {
    self.persistence = enabled;
  }

  pub fn cancel(&self) {
    self.cancelled.cancel();
  }

  pub fn project_name(&self) -> &str {
    &self.project_name
  }

  pub fn set_project_name(&mut self, name: &str) -> bool {
    if name.is_empty() {
      return false;
    }
    let normalized = fqn::project_name_from_path(name);
    if !fqn::validate_project_name(&normalized) {
      return false;
    }
    self.project_name = normalized;
    true
  }

  pub fn mode(&self) -> IndexMode {
    self.mode
  }

  pub fn excluded_dirs(&self) -> &[String] {
    &self.excluded_dirs
  }

  pub fn file_errors(&self) -> &[FileError] {
    &self.file_errors
  }

  pub fn committed_counts(&self) -> CommittedCounts {
    self.committed
  }

  pub fn set_committed_counts(&mut self, nodes: i32, edges: i32) {
    self.committed = CommittedCounts { nodes, edges };
  }

  pub fn add_file_error(
    &mut self,
    path: impl Into<String>,
    reason: impl Into<String>,
    phase: FileErrorPhase,
  ) {
    self.file_errors.push(FileError { path: path.into(), reason: reason.into(), phase });
  }

  pub(crate) fn repo_path(&self) -> &Path {
    &self.repo_path
  }

  pub(crate) fn db_path(&self) -> Option<&Path> {
    self.db_path.as_deref()
  }

  pub(crate) fn take_saved_adr(&mut self) -> Option<String> {
    self.saved_adr.take()
  }

  pub(crate) fn set_saved_adr(&mut self, adr: String) {
    self.saved_adr = Some(adr);
  }
}
