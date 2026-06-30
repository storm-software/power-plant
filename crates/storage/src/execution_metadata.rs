use power_plant_common::SearchInput;
use power_plant_models::Execution;

/// Fixed embedding dimension used by the Ladybug vector index.
pub(crate) const EMBEDDING_DIMENSIONS: usize = 384;

/// Metadata extracted from an execution for indexing and search.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ExecutionMetadataIndex {
  pub execution_id: String,
  pub executed_by: String,
  pub search_text: String,
  pub schema_ids: Vec<String>,
  pub schema_names: Vec<String>,
  pub generator_ids: Vec<String>,
  pub generator_names: Vec<String>,
  pub tags: Vec<String>,
}

/// Extract searchable metadata from an execution record.
pub(crate) fn extract_execution_metadata(execution: &Execution) -> ExecutionMetadataIndex {
  let mut schema_ids = Vec::new();
  let mut schema_names = Vec::new();
  let mut generator_ids = Vec::new();
  let mut generator_names = Vec::new();
  let mut tags = Vec::new();
  let mut text_parts = vec![
    execution.meta.id.clone(),
    execution.meta.executed_by.clone(),
  ];

  for document in &execution.documents {
    text_parts.push(document.name.clone());
    text_parts.push(document.path.clone());

    for source in &document.source {
      text_parts.push(source.language.clone());
      push_meta(&source.meta.schema.meta, &mut schema_ids, &mut schema_names, &mut tags, &mut text_parts);
      push_meta(&source.meta.input.meta, &mut schema_ids, &mut schema_names, &mut tags, &mut text_parts);
      push_meta(&source.meta.output.meta, &mut schema_ids, &mut schema_names, &mut tags, &mut text_parts);

      let generator_name = source.meta.generator.description.clone().unwrap_or_default();
      if !generator_name.is_empty() {
        generator_names.push(generator_name.clone());
        text_parts.push(generator_name);
      }
    }
  }

  dedupe(&mut schema_ids);
  dedupe(&mut schema_names);
  dedupe(&mut generator_ids);
  dedupe(&mut generator_names);
  dedupe(&mut tags);

  ExecutionMetadataIndex {
    execution_id: execution.meta.id.clone(),
    executed_by: execution.meta.executed_by.clone(),
    search_text: text_parts.join(" "),
    schema_ids,
    schema_names,
    generator_ids,
    generator_names,
    tags,
  }
}

/// Score an execution against a search input for filesystem and in-memory backends.
pub(crate) fn score_execution_metadata(metadata: &ExecutionMetadataIndex, input: &SearchInput) -> Option<f64> {
  if let Some(executed_by) = &input.executed_by
    && metadata.executed_by != *executed_by
  {
    return None;
  }

  if let Some(schema) = &input.schema {
    let schema_matches = metadata.schema_ids.iter().any(|id| id == schema)
      || metadata.schema_names.iter().any(|name| name == schema);
    if !schema_matches {
      return None;
    }
  }

  if let Some(generator) = &input.generator {
    let generator_matches = metadata.generator_ids.iter().any(|id| id == generator)
      || metadata.generator_names.iter().any(|name| name == generator);
    if !generator_matches {
      return None;
    }
  }

  if let Some(tags) = &input.tags {
    let tag_matches = tags.iter().any(|tag| metadata.tags.iter().any(|candidate| candidate == tag));
    if !tag_matches {
      return None;
    }
  }

  let mut score = 1.0_f64;

  if let Some(query) = input.query.as_ref().map(|value| value.to_lowercase())
    && !query.is_empty()
  {
    let haystack = metadata.search_text.to_lowercase();
    if !haystack.contains(&query) {
      return None;
    }
    score += query.len() as f64 / haystack.len().max(1) as f64;
  }

  Some(score)
}

/// Build a deterministic embedding from searchable text for vector indexing.
pub(crate) fn hash_embedding(text: &str, dimensions: usize) -> Vec<f32> {
  let mut embedding = vec![0.0_f32; dimensions];
  let mut hasher = blake3::Hasher::new();
  hasher.update(text.as_bytes());

  for chunk_index in 0..dimensions {
    let mut chunk_hasher = hasher.clone();
    chunk_hasher.update(&(chunk_index as u32).to_le_bytes());
    let hash = chunk_hasher.finalize();
    let bytes = hash.as_bytes();
    let value = f32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]);
    embedding[chunk_index] = value;
  }

  let magnitude = embedding.iter().map(|value| f64::from(*value).powi(2)).sum::<f64>().sqrt();
  if magnitude > 0.0 {
    for value in &mut embedding {
      *value /= magnitude as f32;
    }
  }

  embedding
}

fn push_meta(
  meta: &power_plant_models::Meta,
  schema_ids: &mut Vec<String>,
  schema_names: &mut Vec<String>,
  tags: &mut Vec<String>,
  text_parts: &mut Vec<String>,
) {
  schema_ids.push(meta.id.clone());
  schema_names.push(meta.name.clone());
  text_parts.push(meta.id.clone());
  text_parts.push(meta.name.clone());
  text_parts.push(meta.description.clone());
  text_parts.push(meta.title.clone());

  if let Some(meta_tags) = &meta.tags {
    tags.extend(meta_tags.iter().cloned());
    text_parts.extend(meta_tags.iter().cloned());
  }
}

fn dedupe(values: &mut Vec<String>) {
  values.sort();
  values.dedup();
}

#[cfg(test)]
#[allow(
  clippy::unwrap_used,
  clippy::expect_used,
  reason = "test code — panics are acceptable failures"
)]
mod tests {
  use super::*;
  use chrono::Utc;
  use power_plant_models::{
    Execution, ExecutionDocument, ExecutionMeta, ExecutionSource, ExecutionSourceMeta, GeneratorMeta,
    InputMeta, Meta, OutputMeta, SchemaMeta,
  };

  fn sample_execution() -> Execution {
    let meta = Meta {
      id: "schema-id".into(),
      name: "UserSchema".into(),
      version: serde_json::json!("1.0.0"),
      description: "Generates user records".into(),
      title: "User".into(),
      usage: None,
      deprecated: None,
      tags: Some(vec!["users".into(), "api".into()]),
      links: vec![],
    };

    Execution {
      documents: vec![ExecutionDocument {
        name: "user.ts".into(),
        path: "src/user.ts".into(),
        extension: "ts".into(),
        source: vec![ExecutionSource {
          language: "typescript".into(),
          content: "export {}".into(),
          meta: ExecutionSourceMeta {
            options: serde_json::json!({}),
            spec: serde_json::json!({}),
            generator: GeneratorMeta { description: Some("typescript-generator".into()) },
            schema: SchemaMeta { meta: meta.clone(), examples: vec![] },
            input: InputMeta { meta: meta.clone(), input: None },
            output: OutputMeta { meta, produces: None },
          },
        }],
      }],
      meta: ExecutionMeta {
        id: "exec-1".into(),
        executed_at: Utc::now(),
        executed_by: "alice".into(),
      },
    }
  }

  #[test]
  fn extract_execution_metadata_collects_tags_and_names() {
    let metadata = extract_execution_metadata(&sample_execution());
    assert_eq!(metadata.execution_id, "exec-1");
    assert!(metadata.tags.contains(&"users".into()));
    assert!(metadata.schema_names.contains(&"UserSchema".into()));
    assert!(metadata.search_text.contains("Generates user records"));
  }

  #[test]
  fn score_execution_metadata_matches_query_and_filters() {
    let metadata = extract_execution_metadata(&sample_execution());
    let input = SearchInput {
      query: Some("user records".into()),
      executed_by: Some("alice".into()),
      schema: Some("UserSchema".into()),
      generator: None,
      tags: Some(vec!["api".into()]),
      embedding: None,
      limit: None,
    };

    assert!(score_execution_metadata(&metadata, &input).is_some());
  }
}
