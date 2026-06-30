use crate::data_point::DataPoint;
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
  /// DataPoint base — carries id, timestamps, metadata, data_type discriminator.
  #[serde(flatten)]
  pub base: DataPoint,
  /// The name of the document.
  pub name: String,
  /// The path to the document.
  pub path: PathBuf,
  /// Document type category: "text", "pdf", "csv", "html", "image", "audio", "unstructured", "dlt_row".
  pub extension: String,
  /// The data id of the document.
  pub data_id: String,
  /// The external metadata of the document.
  pub metadata: Option<String>,
  /// The source code of the document.
  pub source_code: Vec<SourceCode>,
}

impl Document {
  /// Create a new document.
  pub fn new(
    base: DataPoint,
    extension: String,
    name: String,
    path: PathBuf,
    data_id: String,
    metadata: Option<String>,
  ) -> Self {
    Self { base, extension, name, path, data_id, metadata, source_code: vec![] }
  }
}
