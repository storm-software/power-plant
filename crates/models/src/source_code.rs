use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum SourceCodeLanguage {
  #[default]
  TypeScript,
  JavaScript,
  Python,
  Rust,
  Java,
  Cpp,
  CSharp,
  Go,
}

impl SourceCodeLanguage {
  pub fn as_str(&self) -> &str {
    match self {
      SourceCodeLanguage::Python => "python",
      SourceCodeLanguage::Rust => "rust",
      SourceCodeLanguage::JavaScript => "javascript",
      SourceCodeLanguage::TypeScript => "typescript",
      SourceCodeLanguage::Java => "java",
      SourceCodeLanguage::Cpp => "cpp",
      SourceCodeLanguage::CSharp => "csharp",
      SourceCodeLanguage::Go => "go",
    }
  }
}

/// A source code item.
#[derive(Debug, Clone, Default, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct SourceCode {
  /// The language of the source code.
  pub language: SourceCodeLanguage,
  /// The content of the source code.
  pub content: String,
}

impl SourceCode {
  /// Create a new source code.
  pub fn new(language: SourceCodeLanguage, content: String) -> Self {
    Self { language, content }
  }
}
