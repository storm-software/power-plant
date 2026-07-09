use std::path::Path;

use super::error::{PipelineError, PipelineResult};
use crate::Language;

/// Tree-sitter extraction budget per file (mirrors `CBM_EXTRACT_BUDGET`).
pub const EXTRACT_BUDGET: usize = 5_000_000;

const DEFAULT_MAX_FILE_BYTES: u64 = 512 * 1024 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReadStatus {
  Ok,
  OpenFail,
  Oom,
  Oversized,
  Empty,
}

/// One extracted definition. Mirrors `CBMDefinition`.
#[derive(Debug, Clone, Default)]
pub struct Definition {
  pub name: String,
  pub qualified_name: String,
  pub label: String,
  pub file_path: Option<String>,
  pub start_line: u32,
  pub end_line: u32,
  pub signature: Option<String>,
  pub return_type: Option<String>,
  pub parent_class: Option<String>,
  pub decorators: Vec<String>,
  pub base_classes: Vec<String>,
  pub complexity: i32,
  pub lines: i32,
  pub is_exported: bool,
  pub is_test: bool,
  pub is_entry_point: bool,
}

/// Call site from extraction. Mirrors `CBMCall`.
#[derive(Debug, Clone, Default)]
pub struct CallSite {
  pub callee_name: String,
  pub enclosing_func_qn: Option<String>,
  pub is_method: bool,
}

/// Resolved call from LSP / registry. Mirrors resolved_calls entries.
#[derive(Debug, Clone, Default)]
pub struct ResolvedCall {
  pub callee_name: String,
  pub qualified_name: String,
  pub strategy: String,
  pub confidence: f64,
}

/// Import extracted from source. Mirrors `CBMImport`.
#[derive(Debug, Clone, Default)]
pub struct Import {
  pub module_path: String,
  pub local_name: Option<String>,
  pub namespace: Option<String>,
}

/// Type usage edge candidate. Mirrors usage entries.
#[derive(Debug, Clone, Default)]
pub struct Usage {
  pub type_name: String,
  pub enclosing_func_qn: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct ThrowSite {
  pub exception_type: String,
  pub enclosing_func_qn: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct ReadWriteAccess {
  pub var_name: String,
  pub enclosing_func_qn: Option<String>,
  pub is_write: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ChannelDirection {
  #[default]
  Emit,
  Listen,
}

#[derive(Debug, Clone, Default)]
pub struct Channel {
  pub channel_name: String,
  pub transport: Option<String>,
  pub direction: ChannelDirection,
  pub enclosing_func_qn: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct EnvAccess {
  pub env_key: String,
  pub enclosing_func_qn: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct ImplTrait {
  pub trait_qn: String,
  pub type_qn: String,
}

/// Per-file extraction result. Mirrors `CBMFileResult`.
#[derive(Debug, Clone, Default)]
pub struct FileResult {
  pub has_error: bool,
  pub error_msg: Option<String>,
  pub defs: Vec<Definition>,
  pub calls: Vec<CallSite>,
  pub resolved_calls: Vec<ResolvedCall>,
  pub imports: Vec<Import>,
  pub usages: Vec<Usage>,
  pub throws: Vec<ThrowSite>,
  pub rw: Vec<ReadWriteAccess>,
  pub channels: Vec<Channel>,
  pub env_accesses: Vec<EnvAccess>,
  pub impl_traits: Vec<ImplTrait>,
}

pub fn max_file_bytes() -> u64 {
  std::env::var("CBM_MAX_FILE_BYTES")
    .ok()
    .and_then(|v| v.parse().ok())
    .unwrap_or(DEFAULT_MAX_FILE_BYTES)
}

pub fn read_file(path: &Path) -> Result<(Vec<u8>, ReadStatus), ReadStatus> {
  let meta = std::fs::metadata(path).map_err(|_| ReadStatus::OpenFail)?;
  let size = meta.len();
  if size == 0 {
    return Err(ReadStatus::Empty);
  }
  if size > max_file_bytes() {
    return Err(ReadStatus::Oversized);
  }
  let data = std::fs::read(path).map_err(|_| ReadStatus::OpenFail)?;
  Ok((data, ReadStatus::Ok))
}

/// Extraction backend — native Rust or C FFI (`cbm_extract_file`).
pub trait Extractor {
  fn extract_file(
    &self,
    source: &[u8],
    language: Language,
    project: &str,
    rel_path: &str,
  ) -> PipelineResult<FileResult>;
}

/// No-op extractor for tests and wasm builds without native CBM.
#[derive(Debug, Default)]
pub struct StubExtractor;

impl Extractor for StubExtractor {
  fn extract_file(
    &self,
    _source: &[u8],
    _language: Language,
    _project: &str,
    _rel_path: &str,
  ) -> PipelineResult<FileResult> {
    Ok(FileResult::default())
  }
}

/// Default extraction backend for this build target.
pub fn default_extractor() -> Box<dyn Extractor + Send + Sync> {
  #[cfg(cbm_native)]
  {
    Box::new(super::cbm_native::CbmExtractor)
  }
  #[cfg(not(cbm_native))]
  {
    Box::new(StubExtractor)
  }
}

pub fn oversized_reason(size: u64) -> String {
  let cap = max_file_bytes();
  format!("oversized ({} MB > {} MB)", size / (1024 * 1024), cap / (1024 * 1024))
}

pub fn label_is_type_like(label: &str) -> bool {
  matches!(label, "Class" | "Struct" | "Interface" | "Enum" | "Type" | "Trait")
}

pub fn label_is_registry_symbol(label: &str) -> bool {
  matches!(label, "Function" | "Method" | "Variable" | "Field") || label_is_type_like(label)
}

pub fn module_is_dir(language: Language) -> bool {
  matches!(language, Language::Java | Language::Go)
}

pub fn quarantine_file() -> Option<String> {
  std::env::var("CBM_INDEX_QUARANTINE_FILE").ok()
}

pub fn is_quarantined(rel_path: &str) -> bool {
  quarantine_file().is_some_and(|q| q == rel_path)
}

pub fn quarantine_phase(rel_path: &str) -> &'static str {
  if quarantine_file().is_some_and(|q| q == rel_path) {
    std::env::var("CBM_INDEX_QUARANTINE_PHASE")
      .ok()
      .filter(|p| p == "hang")
      .map(|_| "hang")
      .unwrap_or("crash")
  } else {
    "crash"
  }
}

pub fn extract_error_message(err: PipelineError) -> String {
  err.to_string()
}
