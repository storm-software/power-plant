use derive_more::Debug;
use power_plant_common::StoreInput;
use power_plant_models::{
  Execution, ExecutionDocument, ExecutionMeta, ExecutionSource, ExecutionSourceMeta, GeneratorMeta,
  InputMeta, Meta, OutputMeta, SchemaMeta, SchemaMetaExample,
};

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingGeneratorMeta {
  /// A description of the generator's purpose or behavior.
  pub description: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingSchemaMeta {
  /// A unique identifier for the component.
  pub id: String,
  /// A human-readable name for the component.
  pub name: String,
  /// The version of the component.
  pub version: serde_json::Value,
  /// A description of the component.
  pub description: String,
  /// A human-readable title for the component.
  pub title: String,
  /// A description of when the component is used.
  pub usage: Option<String>,
  /// Deprecation information for the component.
  pub deprecated: Option<serde_json::Value>,
  /// Tags associated with the component.
  pub tags: Option<Vec<String>>,
  /// Links associated with the component.
  pub links: Vec<serde_json::Value>,
  /// Examples of valid data for the schema.
  pub examples: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, PartialEq)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingInputMeta {
  /// A unique identifier for the component.
  pub id: String,
  /// A human-readable name for the component.
  pub name: String,
  /// The version of the component.
  pub version: serde_json::Value,
  /// A description of the component.
  pub description: String,
  /// A human-readable title for the component.
  pub title: String,
  /// A description of when the component is used.
  pub usage: Option<String>,
  /// Deprecation information for the component.
  pub deprecated: Option<serde_json::Value>,
  /// Tags associated with the component.
  pub tags: Option<Vec<String>>,
  /// Links associated with the component.
  pub links: Vec<serde_json::Value>,
  /// A description of how the specification is extracted or generated.
  pub input: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingOutputMeta {
  /// A unique identifier for the component.
  pub id: String,
  /// A human-readable name for the component.
  pub name: String,
  /// The version of the component.
  pub version: serde_json::Value,
  /// A description of the component.
  pub description: String,
  /// A human-readable title for the component.
  pub title: String,
  /// A description of when the component is used.
  pub usage: Option<String>,
  /// Deprecation information for the component.
  pub deprecated: Option<serde_json::Value>,
  /// Tags associated with the component.
  pub tags: Option<Vec<String>>,
  /// Links associated with the component.
  pub links: Vec<serde_json::Value>,
  /// A description of what the output produces.
  pub produces: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingExecutionSourceMeta {
  /// The options used to generate the source code during the execution.
  pub options: serde_json::Value,
  /// The specification used to generate the source code during the execution.
  pub spec: serde_json::Value,
  /// The metadata of the generator used to generate the source code during the execution.
  pub generator: BindingGeneratorMeta,
  /// The metadata of the schema used to generate the source code during the execution.
  pub schema: BindingSchemaMeta,
  /// The metadata of the input used to generate the source code during the execution.
  pub input: BindingInputMeta,
  /// The metadata of the output used to generate the source code during the execution.
  pub output: BindingOutputMeta,
}

#[derive(Debug, Clone, PartialEq)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingExecutionSource {
  /// The language of the generated source code.
  pub language: String,
  /// The content of the generated source code.
  pub content: String,
  /// Metadata about how the source code was generated.
  pub meta: BindingExecutionSourceMeta,
}

#[derive(Debug, Clone, PartialEq)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingExecutionDocument {
  /// The name of the document.
  pub name: String,
  /// The path of the document.
  pub path: String,
  /// The extension of the document.
  pub extension: String,
  /// The sources of the document.
  pub source: Vec<BindingExecutionSource>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingExecutionMeta {
  /// The id of the execution.
  pub id: String,
  /// The date and time when the execution was performed.
  pub executed_at: String,
  /// The user who performed the execution.
  pub executed_by: String,
}

#[derive(Debug, Clone, PartialEq)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingExecution {
  /// The documents of the execution.
  pub documents: Vec<BindingExecutionDocument>,
  /// The metadata of the execution.
  pub meta: BindingExecutionMeta,
}

#[derive(Clone, PartialEq, Debug)]
#[napi_derive::napi(object, object_to_js = false)]
pub struct BindingStoreInput {
  /// The execution that produced the input.
  pub execution: BindingExecution,
}

impl BindingStoreInput {
  pub fn new(execution: BindingExecution) -> Self {
    Self { execution }
  }
}

impl Default for BindingStoreInput {
  fn default() -> Self {
    Self {
      execution: BindingExecution {
        documents: vec![],
        meta: BindingExecutionMeta {
          id: String::new(),
          executed_at: String::new(),
          executed_by: String::new(),
        },
      },
    }
  }
}

impl From<BindingGeneratorMeta> for GeneratorMeta {
  fn from(value: BindingGeneratorMeta) -> Self {
    Self { description: value.description }
  }
}

impl From<BindingSchemaMeta> for SchemaMeta {
  fn from(value: BindingSchemaMeta) -> Self {
    let BindingSchemaMeta {
      id,
      name,
      version,
      description,
      title,
      usage,
      deprecated,
      tags,
      links,
      examples,
    } = value;

    Self {
      meta: Meta {
        id,
        name,
        version,
        description,
        title,
        usage,
        deprecated: deprecated.and_then(|deprecated| serde_json::from_value(deprecated).ok()),
        tags,
        links: links.into_iter().filter_map(|link| serde_json::from_value(link).ok()).collect(),
      },
      examples: examples
        .into_iter()
        .map(|example| {
          serde_json::from_value(example.clone()).unwrap_or(SchemaMetaExample::Value(example))
        })
        .collect(),
    }
  }
}

impl From<BindingInputMeta> for InputMeta {
  fn from(value: BindingInputMeta) -> Self {
    let BindingInputMeta {
      id,
      name,
      version,
      description,
      title,
      usage,
      deprecated,
      tags,
      links,
      input,
    } = value;

    Self {
      meta: Meta {
        id,
        name,
        version,
        description,
        title,
        usage,
        deprecated: deprecated.and_then(|deprecated| serde_json::from_value(deprecated).ok()),
        tags,
        links: links.into_iter().filter_map(|link| serde_json::from_value(link).ok()).collect(),
      },
      input,
    }
  }
}

impl From<BindingOutputMeta> for OutputMeta {
  fn from(value: BindingOutputMeta) -> Self {
    let BindingOutputMeta {
      id,
      name,
      version,
      description,
      title,
      usage,
      deprecated,
      tags,
      links,
      produces,
    } = value;

    Self {
      meta: Meta {
        id,
        name,
        version,
        description,
        title,
        usage,
        deprecated: deprecated.and_then(|deprecated| serde_json::from_value(deprecated).ok()),
        tags,
        links: links.into_iter().filter_map(|link| serde_json::from_value(link).ok()).collect(),
      },
      produces,
    }
  }
}

impl From<BindingExecutionSourceMeta> for ExecutionSourceMeta {
  fn from(value: BindingExecutionSourceMeta) -> Self {
    Self {
      options: value.options,
      spec: value.spec,
      generator: value.generator.into(),
      schema: value.schema.into(),
      input: value.input.into(),
      output: value.output.into(),
    }
  }
}

impl From<BindingExecutionSource> for ExecutionSource {
  fn from(value: BindingExecutionSource) -> Self {
    Self { language: value.language, content: value.content, meta: value.meta.into() }
  }
}

impl From<BindingExecutionDocument> for ExecutionDocument {
  fn from(value: BindingExecutionDocument) -> Self {
    Self {
      name: value.name,
      path: value.path,
      extension: value.extension,
      source: value.source.into_iter().map(Into::into).collect(),
    }
  }
}

impl From<BindingExecutionMeta> for ExecutionMeta {
  fn from(value: BindingExecutionMeta) -> Self {
    Self {
      id: value.id,
      executed_at: value.executed_at.parse().unwrap_or_else(|_| chrono::Utc::now()),
      executed_by: value.executed_by,
    }
  }
}

impl From<BindingExecution> for Execution {
  fn from(value: BindingExecution) -> Self {
    Self {
      documents: value.documents.into_iter().map(Into::into).collect(),
      meta: value.meta.into(),
    }
  }
}

impl From<BindingStoreInput> for StoreInput {
  fn from(value: BindingStoreInput) -> Self {
    Self { execution: value.execution.into() }
  }
}
