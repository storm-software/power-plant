use crate::source_code::SourceCode;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// A classified document derived from a Data item.
///
/// Mirrors the Python `Document` class hierarchy. In Python, each document type
/// is a separate class (TextDocument, PdfDocument, etc.). In Rust we use a single
/// struct with a `document_type` field and the `base.data_type` discriminator
/// set to the class name (e.g. "TextDocument", "PdfDocument").
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Document {
  /// The path to the document.
  pub path: PathBuf,
  /// The data id of the document.
  pub data_id: String,
  /// The external metadata of the document.
  pub metadata: Option<String>,
  /// The source code of the document.
  pub source: Vec<SourceCode>,
}

impl Document {
  /// Create a new document.
  pub fn new(path: PathBuf, data_id: String, metadata: Option<String>) -> Self {
    Self { path, data_id, metadata, source: vec![] }
  }
}
