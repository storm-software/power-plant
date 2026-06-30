//! Metadata types used by execution models.
//!
//! Mirrors `packages/base/core/src/types/meta.ts`, `generator.ts`, `schema.ts`,
//! `input.ts`, and `output.ts`.

use serde::{Deserialize, Serialize};

/// Indicates whether a component is deprecated.
///
/// Mirrors `MetaDeprecated` from `meta.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum MetaDeprecated {
  /// A boolean flag indicating deprecation.
  Flag(bool),
  /// A message explaining the deprecation.
  Message(String),
  /// Detailed deprecation information.
  Details {
    /// A message explaining the deprecation.
    message: Option<String>,
    /// The version since which the component is deprecated.
    since: Option<String>,
    /// An alternative component to use instead.
    alternative: Option<String>,
  },
}

/// A link associated with metadata.
///
/// Mirrors `MetaLink` from `meta.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum MetaLink {
  /// A URL string.
  Url(String),
  /// A link with an optional description.
  Link {
    /// The URL of the link.
    href: String,
    /// An optional description of the link.
    description: Option<String>,
  },
}

/// Common metadata fields shared across generator components.
///
/// Mirrors `Meta` from `meta.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Meta {
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
  #[serde(default, skip_serializing_if = "Option::is_none")]
  pub usage: Option<String>,
  /// Deprecation information for the component.
  #[serde(default, skip_serializing_if = "Option::is_none")]
  pub deprecated: Option<MetaDeprecated>,
  /// Tags associated with the component.
  #[serde(default, skip_serializing_if = "Option::is_none")]
  pub tags: Option<Vec<String>>,
  /// Links associated with the component.
  pub links: Vec<MetaLink>,
}

/// Metadata about a generator.
///
/// Mirrors `GeneratorMeta` from `generator.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GeneratorMeta {
  /// A description of the generator's purpose or behavior.
  #[serde(default, skip_serializing_if = "Option::is_none")]
  pub description: Option<String>,
}

/// An example value for a schema.
///
/// Mirrors `SchemaMetaExample` from `schema.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum SchemaMetaExample {
  /// A raw example value.
  Value(serde_json::Value),
  /// A named example with an optional description.
  Named {
    /// An optional name for the example.
    name: Option<String>,
    /// An optional description of the example.
    description: Option<String>,
    /// The example value.
    value: serde_json::Value,
  },
}

/// Metadata about a schema.
///
/// Mirrors `SchemaMeta` from `schema.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SchemaMeta {
  /// Common metadata fields.
  #[serde(flatten)]
  pub meta: Meta,
  /// Examples of valid data for the schema.
  pub examples: Vec<SchemaMetaExample>,
}

/// Metadata about an input.
///
/// Mirrors `InputMeta` from `input.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct InputMeta {
  /// Common metadata fields.
  #[serde(flatten)]
  pub meta: Meta,
  /// A description of how the specification is extracted or generated.
  #[serde(default, skip_serializing_if = "Option::is_none")]
  pub input: Option<String>,
}

/// Metadata about an output.
///
/// Mirrors `OutputMeta` from `output.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OutputMeta {
  /// Common metadata fields.
  #[serde(flatten)]
  pub meta: Meta,
  /// A description of what the output produces.
  #[serde(default, skip_serializing_if = "Option::is_none")]
  pub produces: Option<String>,
}
