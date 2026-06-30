use derive_more::Debug;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingStoreSourceCode {
  /// The language of the source code.
  pub language: String,
  /// The content of the source code.
  pub content: String,
  /// The metadata of the source code.
  pub metadata: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingStoreDocument {
  /// The name of the document.
  pub name: String,
  /// The path to the document.
  pub path: String,
  /// The extension of the document.
  pub extension: String,
  /// The source code of the document.
  pub source_code: Vec<BindingStoreSourceCode>,
  /// The metadata of the document.
  pub metadata: Option<String>,
}

impl BindingStoreDocument {
  pub fn new(
    name: String,
    path: String,
    extension: String,
    source_code: Vec<BindingStoreSourceCode>,
    metadata: Option<String>,
  ) -> Self {
    Self { name, path, extension, source_code, metadata }
  }
}

#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingStoreInput {
  /// The execution id.
  pub execution_id: String,
  /// The documents to store.
  pub documents: Vec<BindingStoreDocument>,
  /// The metadata of the input.
  pub metadata: Option<String>,
}

impl BindingStoreInput {
  pub fn new(
    execution_id: String,
    documents: Vec<BindingStoreDocument>,
    metadata: Option<String>,
  ) -> Self {
    Self { execution_id, documents, metadata }
  }
}

impl Default for BindingStoreInput {
  fn default() -> Self {
    Self { execution_id: String::new(), documents: vec![], metadata: None }
  }
}
