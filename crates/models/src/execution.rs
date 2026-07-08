//! Execution models produced by generator runs.
//!
//! Mirrors `packages/base/core/src/types/execution.ts`.

use crate::meta::{GeneratorMeta, InputMeta, OutputMeta, SchemaMeta};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Metadata captured for a single generated source during an execution.
///
/// Mirrors `ExecutionSourceMeta` from `execution.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExecutionSourceMeta {
  /// The options used to generate the source code during the execution.
  pub options: serde_json::Value,
  /// The specification used to generate the source code during the execution.
  pub spec: serde_json::Value,
  /// The metadata of the generator used to generate the source code during the execution.
  pub generator: GeneratorMeta,
  /// The metadata of the schema used to generate the source code during the execution.
  pub schema: SchemaMeta,
  /// The metadata of the input used to generate the source code during the execution.
  pub input: InputMeta,
  /// The metadata of the output used to generate the source code during the execution.
  pub output: OutputMeta,
}

/// A generated source file and its execution metadata.
///
/// Mirrors `ExecutionSource` from `execution.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExecutionSource {
  /// The language of the generated source code.
  pub language: String,
  /// The content of the generated source code.
  pub content: String,
  /// Metadata about how the source code was generated.
  pub meta: ExecutionSourceMeta,
}

/// A document produced by an execution.
///
/// Mirrors `ExecutionDocument` from `execution.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExecutionDocument {
  /// The path of the document.
  pub path: String,
  /// The sources of the document.
  pub source: Vec<ExecutionSource>,
}

/// Metadata about an execution run.
///
/// Mirrors `ExecutionMeta` from `execution.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ExecutionMeta {
  /// The id of the execution.
  pub id: String,
  /// The date and time when the execution was performed.
  #[serde(rename = "executedAt")]
  pub executed_at: DateTime<Utc>,
  /// The user who performed the execution.
  #[serde(rename = "executedBy")]
  pub executed_by: String,
}

/// The result of a generator execution.
///
/// Mirrors `Execution` from `execution.ts`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Execution {
  /// The documents of the execution.
  pub documents: Vec<ExecutionDocument>,
  /// The metadata of the execution.
  pub meta: ExecutionMeta,
}
