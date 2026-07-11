//! Indexing pipeline orchestrator
//!
//! Coordinates multi-pass repository indexing:
//!   1. Discover files
//!   2. Build structure (Project/Folder/Package/File nodes)
//!   3. Extract definitions + resolve imports/calls/usages/semantic edges
//!   4. Post-passes (tests, communities, config links, git history)
//!   5. Dump graph buffer to SQLite
//!
//! Individual pass implementations plug in through [`GraphIndexer`] and
//! [`FileDiscoverer`] traits so the C extraction/LSP backends can be wired
//! via FFI without rewriting the orchestration layer.

mod error;
mod extract;
mod fqn;
mod graph;
mod lang_spec;
mod lang_spec_gen;
mod parser;
mod registry;

pub use error::{PipelineError, PipelineResult};
pub use extract::{
  EXTRACT_BUDGET, Extractor, FileResult, IndexCounts, StubExtractor, TreeSitterExtractor,
  default_extractor, index_file_result, index_file_result_with_registry, label_is_registry_symbol,
  label_is_type_like, module_is_dir,
};

pub use graph::{GraphBuffer, GraphEdge, GraphNode};
pub use lang_spec::{LangSpec, class_label_for_kind, kind_in, lang_spec, manifest_lang_spec};
pub use lang_spec_gen::modules_for;
pub use parser::{
  LanguageParser, ParserLanguageError, configure_parser, parse_on_thread, parser_for,
};

pub mod languages;
pub mod types;

pub use types::*;
