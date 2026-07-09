use super::state::Pipeline;
use super::types::FileInfo;
use super::worker_pool::effective_worker_count;

/// Stored per-file hash row used for incremental classification.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileHash {
  pub rel_path: String,
  pub sha256: Option<String>,
  pub mtime_ns: i64,
  pub size: u64,
}

/// Snapshot of an inbound edge preserved across incremental purge.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SavedEdge {
  pub source_qn: String,
  pub target_qn: String,
  pub edge_type: String,
  pub props: String,
}

const MIN_FILES_FOR_PARALLEL_INCR: usize = 50;

use std::collections::HashMap;
use std::path::Path;
use std::time::UNIX_EPOCH;

/// Classify discovered files against stored hashes using mtime+size.
pub fn classify_files(files: &[FileInfo], stored: &[FileHash]) -> (Vec<bool>, usize, usize) {
  let mut lookup: HashMap<&str, &FileHash> = HashMap::new();
  for hash in stored {
    lookup.insert(hash.rel_path.as_str(), hash);
  }

  let mut changed = vec![false; files.len()];
  let mut n_changed = 0;
  let mut n_unchanged = 0;

  for (i, file) in files.iter().enumerate() {
    let Some(stored_hash) = lookup.get(file.rel_path.as_str()) else {
      changed[i] = true;
      n_changed += 1;
      continue;
    };

    let Ok(meta) = std::fs::metadata(&file.path) else {
      changed[i] = true;
      n_changed += 1;
      continue;
    };

    let mtime_ns = file_mtime_ns(&meta);
    if mtime_ns != stored_hash.mtime_ns || meta.len() != stored_hash.size {
      changed[i] = true;
      n_changed += 1;
    } else {
      n_unchanged += 1;
    }
  }

  (changed, n_changed, n_unchanged)
}

/// Classify stored files absent from current discovery.
pub fn find_deleted_and_mode_skipped(
  repo_path: &Path,
  files: &[FileInfo],
  stored: &[FileHash],
) -> (Vec<String>, Vec<FileHash>) {
  let current: HashMap<&str, ()> = files.iter().map(|f| (f.rel_path.as_str(), ())).collect();

  let mut deleted = Vec::new();
  let mut mode_skipped = Vec::new();

  for row in stored {
    if current.contains_key(row.rel_path.as_str()) {
      continue;
    }

    let abs = repo_path.join(&row.rel_path);
    match std::fs::metadata(&abs) {
      Ok(_) => mode_skipped.push(row.clone()),
      Err(err) if err.kind() == std::io::ErrorKind::NotFound => {
        deleted.push(row.rel_path.clone());
      }
      Err(_) => mode_skipped.push(row.clone()),
    }
  }

  (deleted, mode_skipped)
}

/// Returns true when an edge type must not be restored from a pre-purge snapshot.
pub fn edge_type_is_recomputed(edge_type: &str) -> bool {
  matches!(edge_type, "SIMILAR_TO" | "SEMANTICALLY_RELATED" | "FILE_CHANGES_WITH" | "DATA_FLOWS")
}

/// Decide whether to restore a snapshotted inbound edge.
pub fn should_capture_inbound_edge(
  edge_type: &str,
  source_file: &str,
  target_file: &str,
  changed_paths: &HashMap<&str, ()>,
) -> bool {
  if edge_type_is_recomputed(edge_type) {
    return false;
  }
  changed_paths.contains_key(target_file) && !changed_paths.contains_key(source_file)
}

/// Incremental fast path: nothing changed and nothing deleted.
pub fn is_incremental_noop(changed: usize, deleted: usize) -> bool {
  changed == 0 && deleted == 0
}

/// Choose parallel vs sequential extract+resolve for changed files.
pub fn incremental_use_parallel(changed_count: usize) -> bool {
  let workers = effective_worker_count(true);
  workers > 1 && changed_count > MIN_FILES_FOR_PARALLEL_INCR
}

pub fn file_mtime_ns(meta: &std::fs::Metadata) -> i64 {
  meta
    .modified()
    .ok()
    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
    .map(|d| i64::try_from(d.as_nanos()).unwrap_or(i64::MAX))
    .unwrap_or(0)
}

/// Incremental orchestration entry. Mirrors `cbm_pipeline_run_incremental`.
pub struct IncrementalRun<'a> {
  pub pipeline: &'a mut Pipeline,
  pub db_path: &'a Path,
  pub files: &'a [FileInfo],
  pub stored_hashes: &'a [FileHash],
}

impl<'a> IncrementalRun<'a> {
  pub fn classify(&self) -> IncrementalClassification {
    let (is_changed, n_changed, n_unchanged) = classify_files(self.files, self.stored_hashes);
    let (deleted, mode_skipped) =
      find_deleted_and_mode_skipped(self.pipeline.repo_path(), self.files, self.stored_hashes);

    IncrementalClassification { is_changed, n_changed, n_unchanged, deleted, mode_skipped }
  }

  pub fn should_noop(&self, classification: &IncrementalClassification) -> bool {
    is_incremental_noop(classification.n_changed, classification.deleted.len())
  }
}

#[derive(Debug)]
pub struct IncrementalClassification {
  pub is_changed: Vec<bool>,
  pub n_changed: usize,
  pub n_unchanged: usize,
  pub deleted: Vec<String>,
  pub mode_skipped: Vec<FileHash>,
}

impl IncrementalClassification {
  pub fn changed_files<'b>(&'b self, files: &'b [FileInfo]) -> Vec<&'b FileInfo> {
    files
      .iter()
      .zip(self.is_changed.iter())
      .filter_map(|(file, changed)| changed.then_some(file))
      .collect()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::pipeline::infer_language;
  use std::collections::HashMap;
  use std::fs;
  use std::path::PathBuf;

  fn temp_file(rel: &str, contents: &str) -> (PathBuf, FileInfo) {
    let base = std::env::temp_dir().join(format!("cbm-test-{}", std::process::id()));
    let path = base.join(rel);
    if let Some(parent) = path.parent() {
      let _ = fs::create_dir_all(parent);
    }
    fs::write(&path, contents).unwrap();
    (
      base,
      FileInfo { path: path.clone(), rel_path: rel.to_string(), language: infer_language(rel) },
    )
  }

  #[test]
  fn classify_marks_new_and_changed_files() {
    let (_base, file_a) = temp_file("incr-a.rs", "one");
    let (_base2, file_b) = temp_file("incr-b.rs", "two");
    let files = vec![file_a, file_b];
    let stored =
      vec![FileHash { rel_path: "incr-a.rs".into(), sha256: None, mtime_ns: 1, size: 3 }];
    let (changed, n_changed, n_unchanged) = classify_files(&files, &stored);
    assert_eq!(n_changed, 2);
    assert_eq!(n_unchanged, 0);
    assert!(changed[0]);
    assert!(changed[1]);
  }

  #[test]
  fn mode_skipped_file_is_preserved_not_deleted() {
    let (_base, file) = temp_file("tools/hidden.rs", "x");
    let stored = vec![FileHash {
      rel_path: "tools/hidden.rs".into(),
      sha256: None,
      mtime_ns: file_mtime_ns(&fs::metadata(&file.path).unwrap()),
      size: 1,
    }];
    let (deleted, mode_skipped) = find_deleted_and_mode_skipped(&_base, &[], &stored);
    assert!(deleted.is_empty());
    assert_eq!(mode_skipped.len(), 1);
  }

  #[test]
  fn inbound_edge_capture_skips_recomputed_types() {
    let mut changed = HashMap::new();
    changed.insert("b.rs", ());
    assert!(!should_capture_inbound_edge("SIMILAR_TO", "a.rs", "b.rs", &changed));
    assert!(should_capture_inbound_edge("CALLS", "a.rs", "b.rs", &changed));
  }
}
