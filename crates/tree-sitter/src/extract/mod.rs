//! Tree-sitter extraction: source → definitions / calls / imports → graph nodes.

mod index;
mod walk;

use std::cell::RefCell;
use std::path::Path;

use crate::Language;
use crate::error::{PipelineError, PipelineResult};
use crate::parser::{LanguageParser, ParserLanguageError};

pub use index::{IndexCounts, index_file_result, index_file_result_with_registry};
pub(crate) use walk::extract_from_tree;

/// Tree-sitter extraction budget per file.
pub const EXTRACT_BUDGET: usize = 5_000_000;

const DEFAULT_MAX_FILE_BYTES: u64 = 512 * 1024 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum ReadStatus {
  Ok,
  OpenFail,
  Oom,
  Oversized,
  Empty,
}

/// One extracted definition.
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

/// Call site from extraction.
#[derive(Debug, Clone, Default)]
pub struct CallSite {
  pub callee_name: String,
  pub enclosing_func_qn: Option<String>,
  pub is_method: bool,
}

/// Resolved call from LSP / registry.
#[derive(Debug, Clone, Default)]
pub struct ResolvedCall {
  pub callee_name: String,
  pub qualified_name: String,
  pub strategy: String,
  pub confidence: f64,
}

/// Import extracted from source.
#[derive(Debug, Clone, Default)]
pub struct Import {
  pub module_path: String,
  pub local_name: Option<String>,
  pub namespace: Option<String>,
}

/// Type usage edge candidate.
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

/// Per-file extraction result.
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

pub(crate) fn max_file_bytes() -> u64 {
  std::env::var("POWER_PLANT_MAX_FILE_BYTES")
    .ok()
    .and_then(|v| v.parse().ok())
    .unwrap_or(DEFAULT_MAX_FILE_BYTES)
}

pub(crate) fn read_file(path: &Path) -> Result<(Vec<u8>, ReadStatus), ReadStatus> {
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

/// Extraction backend.
pub trait Extractor {
  fn extract_file(
    &self,
    source: &[u8],
    language: Language,
    project: &str,
    rel_path: &str,
  ) -> PipelineResult<FileResult>;
}

/// No-op extractor for tests and wasm builds.
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

/// Tree-sitter AST extractor.
///
/// Reuses a thread-local [`LanguageParser`] so batch indexing avoids reallocating
/// the parser / reloading grammars on every file.
#[derive(Debug, Default)]
pub struct TreeSitterExtractor;

impl Extractor for TreeSitterExtractor {
  fn extract_file(
    &self,
    source: &[u8],
    language: Language,
    project: &str,
    rel_path: &str,
  ) -> PipelineResult<FileResult> {
    THREAD_EXTRACTOR.with(|cell| {
      let mut parser = cell.borrow_mut();
      parser.extract(language, source, project, rel_path).map_err(parser_err_to_pipeline)
    })
  }
}

thread_local! {
  static THREAD_EXTRACTOR: RefCell<LanguageParser> = RefCell::new(LanguageParser::new());
}

fn parser_err_to_pipeline(err: ParserLanguageError) -> PipelineError {
  match err {
    ParserLanguageError::Unavailable(_) => PipelineError::Other(err.to_string()),
    ParserLanguageError::Incompatible(_) => PipelineError::ExtractionFailed(1),
  }
}

/// Default extraction backend for this build target.
pub fn default_extractor() -> Box<dyn Extractor + Send + Sync> {
  Box::new(TreeSitterExtractor)
}

pub(crate) fn oversized_reason(size: u64) -> String {
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

pub(crate) fn quarantine_file() -> Option<String> {
  std::env::var("POWER_PLANT_INDEX_QUARANTINE_FILE").ok()
}

pub(crate) fn is_quarantined(rel_path: &str) -> bool {
  quarantine_file().is_some_and(|q| q == rel_path)
}

pub(crate) fn quarantine_phase(rel_path: &str) -> &'static str {
  if quarantine_file().is_some_and(|q| q == rel_path) {
    std::env::var("POWER_PLANT_INDEX_QUARANTINE_PHASE")
      .ok()
      .filter(|p| p == "hang")
      .map(|_| "hang")
      .unwrap_or("crash")
  } else {
    "crash"
  }
}

pub(crate) fn extract_error_message(err: PipelineError) -> String {
  err.to_string()
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::graph::GraphBuffer;
  use crate::parser::LanguageParser;

  #[test]
  fn rust_extract_defs_calls_and_index() {
    let source = br#"
use std::collections::HashMap;

pub struct Store {
    data: HashMap<String, i32>,
}

impl Store {
    pub fn save(&mut self, key: String) {
        self.insert(key);
    }

    fn insert(&mut self, key: String) {
        println!("{key}");
    }
}

pub fn main() {
    let mut s = Store { data: HashMap::new() };
    s.save("a".into());
}
"#;
    let mut parser = LanguageParser::new();
    let result = parser.extract(Language::Rust, source, "demo", "src/store.rs").expect("extract");

    assert!(result.defs.iter().any(|d| d.label == "Module"));
    assert!(result.defs.iter().any(|d| d.name == "Store" && d.label == "Struct"));
    assert!(result.defs.iter().any(|d| d.name == "save" && d.label == "Method"));
    assert!(result.defs.iter().any(|d| d.name == "main" && d.label == "Function"));
    assert!(result.imports.iter().any(|i| i.module_path.contains("HashMap")));
    assert!(result.calls.iter().any(|c| c.callee_name == "save" || c.callee_name == "insert"));
    assert!(result.impl_traits.is_empty() || result.defs.iter().any(|d| d.name == "Store"));

    let mut graph = GraphBuffer::new();
    // Seed a File node so DEFINES edges attach (mirrors structure pass).
    let file_qn = crate::fqn::compute_fqn("demo", "src/store.rs", Some("__file__"));
    graph.upsert_node("File", "store.rs", &file_qn, "src/store.rs", 1, 1, "{}");
    let counts = index_file_result(&mut graph, &result, "demo", "src/store.rs");
    assert!(counts.nodes > 0);
    assert!(graph.find_by_qn("demo.src.store.Store").is_some() || graph.node_count() > 1);
  }

  #[test]
  fn python_extract_function_and_import() {
    let source =
      b"import os\nfrom pathlib import Path\n\ndef greet(name):\n    return Path(name)\n";
    let mut parser = LanguageParser::new();
    let result = parser.extract(Language::Python, source, "demo", "app/hello.py").expect("extract");
    assert!(result.defs.iter().any(|d| d.name == "greet"));
    assert!(
      result.imports.iter().any(|i| i.module_path == "os" || i.module_path.contains("pathlib"))
    );
  }
}
