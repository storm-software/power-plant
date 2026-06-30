use std::sync::{Arc, Mutex};

use chrono::{DateTime, Utc};
use lbug::{Connection, Database, SystemConfig, Value as LbugValue};
use power_plant_common::{ExecutionSearchHit, SearchInput};
use power_plant_models::Execution;
use serde_json::Value;

use crate::{
  StorageError,
  execution_metadata::{EMBEDDING_DIMENSIONS, extract_execution_metadata, hash_embedding},
};

const DEFAULT_MAX_DB_SIZE: u64 = 1024 * 1024 * 1024;
const VECTOR_INDEX_NAME: &str = "execution_embedding_idx";

/// Ladybug graph + vector index for execution metadata search.
pub struct LadybugExecutionIndex {
  db: Arc<Database>,
  write_lock: Arc<Mutex<()>>,
  initialized: Mutex<bool>,
}

impl LadybugExecutionIndex {
  /// Open or create a Ladybug database at `db_path`.
  pub fn new(db_path: &str) -> Result<Self, StorageError> {
    let config = SystemConfig::default().max_db_size(read_max_db_size());
    let db = Database::new(db_path, config)
      .map_err(|err| StorageError::Index(format!("failed to create database: {err}")))?;

    Ok(Self {
      db: Arc::new(db),
      write_lock: Arc::new(Mutex::new(())),
      initialized: Mutex::new(false),
    })
  }

  /// Ensure the execution metadata schema and vector index exist.
  pub fn initialize(&self) -> Result<(), StorageError> {
    let mut initialized = self
      .initialized
      .lock()
      .map_err(|_| StorageError::Index("ladybug index lock poisoned".into()))?;
    if *initialized {
      return Ok(());
    }

    let conn = self.connection()?;

    let _ = conn.query("INSTALL vector");
    let _ = conn.query("LOAD vector");

    conn
      .query(
        r"
        CREATE NODE TABLE IF NOT EXISTS Execution(
          id STRING PRIMARY KEY,
          executed_at TIMESTAMP,
          executed_by STRING,
          search_text STRING,
          embedding FLOAT[384]
        )
        ",
      )
      .map_err(|err| StorageError::Index(format!("failed to create Execution table: {err}")))?;

    conn
      .query(
        r"
        CREATE NODE TABLE IF NOT EXISTS Component(
          id STRING PRIMARY KEY,
          name STRING,
          component_type STRING,
          tags STRING
        )
        ",
      )
      .map_err(|err| StorageError::Index(format!("failed to create Component table: {err}")))?;

    conn
      .query(
        r"
        CREATE REL TABLE IF NOT EXISTS EXECUTED_WITH(
          FROM Execution TO Component,
          role STRING
        )
        ",
      )
      .map_err(|err| {
        StorageError::Index(format!("failed to create EXECUTED_WITH relationship: {err}"))
      })?;

    let _ = conn.query(&format!(
      "CALL CREATE_VECTOR_INDEX('Execution', '{VECTOR_INDEX_NAME}', 'embedding', metric := 'cosine')"
    ));

    *initialized = true;
    Ok(())
  }

  /// Index an execution in the Ladybug graph and vector store.
  pub fn index_execution(&self, execution: &Execution) -> Result<(), StorageError> {
    self.initialize()?;

    let _guard = self
      .write_lock
      .lock()
      .map_err(|_| StorageError::Index("ladybug write lock poisoned".into()))?;

    let metadata = extract_execution_metadata(execution);
    let embedding = hash_embedding(&metadata.search_text, EMBEDDING_DIMENSIONS);
    let embedding_literal = format_embedding_literal(&embedding);
    let executed_at = format_timestamp(execution.meta.executed_at);
    let search_text = escape_cypher_string(&metadata.search_text);
    let executed_by = escape_cypher_string(&execution.meta.executed_by);
    let execution_id = escape_cypher_string(&metadata.execution_id);

    let conn = self.connection()?;

    conn
      .query(&format!(
        "MERGE (e:Execution {{id: '{execution_id}'}}) \
         SET e.executed_at = timestamp('{executed_at}'), \
             e.executed_by = '{executed_by}', \
             e.search_text = '{search_text}', \
             e.embedding = {embedding_literal}"
      ))
      .map_err(|err| StorageError::Index(format!("failed to upsert execution node: {err}")))?;

    self.remove_execution_components(&conn, &metadata.execution_id)?;

    for (component_id, component_name, component_type, tags) in collect_components(&metadata) {
      let component_id = escape_cypher_string(&component_id);
      let component_name = escape_cypher_string(&component_name);
      let component_type = escape_cypher_string(&component_type);
      let tags = escape_cypher_string(&tags);

      conn
        .query(&format!(
          "MERGE (c:Component {{id: '{component_id}'}}) \
           SET c.name = '{component_name}', \
               c.component_type = '{component_type}', \
               c.tags = '{tags}'"
        ))
        .map_err(|err| StorageError::Index(format!("failed to upsert component node: {err}")))?;

      conn
        .query(&format!(
          "MATCH (e:Execution {{id: '{execution_id}'}}), (c:Component {{id: '{component_id}'}}) \
           MERGE (e)-[:EXECUTED_WITH {{role: '{component_type}'}}]->(c)"
        ))
        .map_err(|err| StorageError::Index(format!("failed to link execution component: {err}")))?;
    }

    Ok(())
  }

  /// Search indexed execution metadata.
  pub fn search(&self, input: &SearchInput) -> Result<Vec<ExecutionSearchHit>, StorageError> {
    self.initialize()?;

    if let Some(embedding) = &input.embedding {
      return self.search_by_embedding(embedding, input);
    }

    self.search_by_metadata(input)
  }

  fn search_by_metadata(
    &self,
    input: &SearchInput,
  ) -> Result<Vec<ExecutionSearchHit>, StorageError> {
    let limit = input.limit.unwrap_or(50);
    let mut where_clauses = Vec::new();

    if let Some(query) = &input.query {
      let escaped = escape_cypher_string(&query.to_lowercase());
      where_clauses.push(format!("lower(e.search_text) CONTAINS '{escaped}'"));
    }

    if let Some(executed_by) = &input.executed_by {
      where_clauses.push(format!("e.executed_by = '{}'", escape_cypher_string(executed_by)));
    }

    if let Some(schema) = &input.schema {
      let escaped = escape_cypher_string(schema);
      where_clauses.push(format!(
        "EXISTS {{
          MATCH (e)-[:EXECUTED_WITH]->(c:Component)
          WHERE c.component_type = 'schema' AND (c.id = '{escaped}' OR c.name = '{escaped}')
        }}"
      ));
    }

    if let Some(generator) = &input.generator {
      let escaped = escape_cypher_string(generator);
      where_clauses.push(format!(
        "EXISTS {{
          MATCH (e)-[:EXECUTED_WITH]->(c:Component)
          WHERE c.component_type = 'generator' AND (c.id = '{escaped}' OR c.name = '{escaped}')
        }}"
      ));
    }

    if let Some(tags) = &input.tags {
      let tag_checks = tags
        .iter()
        .map(|tag| format!("c.tags CONTAINS '{}'", escape_cypher_string(tag)))
        .collect::<Vec<_>>()
        .join(" OR ");
      where_clauses.push(format!(
        "EXISTS {{
          MATCH (e)-[:EXECUTED_WITH]->(c:Component)
          WHERE {tag_checks}
        }}"
      ));
    }

    let where_clause = if where_clauses.is_empty() {
      String::new()
    } else {
      format!(" WHERE {}", where_clauses.join(" AND "))
    };

    let query =
      format!("MATCH (e:Execution){where_clause} RETURN e.id, e.search_text LIMIT {limit}");

    let rows = self.execute_query(&query)?;
    Ok(
      rows
        .into_iter()
        .filter_map(|row| {
          let execution_id = row.first()?.as_str()?.to_string();
          let snippet = row.get(1).and_then(Value::as_str).map(str::to_string);
          Some(ExecutionSearchHit { execution_id, score: Some(1.0), snippet })
        })
        .collect(),
    )
  }

  fn search_by_embedding(
    &self,
    embedding: &[f32],
    input: &SearchInput,
  ) -> Result<Vec<ExecutionSearchHit>, StorageError> {
    if embedding.len() != EMBEDDING_DIMENSIONS {
      return Err(StorageError::Query(format!(
        "embedding must have {EMBEDDING_DIMENSIONS} dimensions, got {}",
        embedding.len()
      )));
    }

    let limit = input.limit.unwrap_or(50);
    let embedding_literal = format_embedding_literal(embedding);
    let query = format!(
      "CALL QUERY_VECTOR_INDEX('Execution', '{VECTOR_INDEX_NAME}', {embedding_literal}, {limit}) \
       RETURN node.id, distance ORDER BY distance"
    );

    let rows = self.execute_query(&query)?;
    Ok(
      rows
        .into_iter()
        .filter_map(|row| {
          let execution_id = row.first()?.as_str()?.to_string();
          let distance = row.get(1).and_then(Value::as_f64);
          let score = distance.map(|value| 1.0 / (1.0 + value));
          Some(ExecutionSearchHit { execution_id, score, snippet: None })
        })
        .collect(),
    )
  }

  fn remove_execution_components(
    &self,
    conn: &Connection<'_>,
    execution_id: &str,
  ) -> Result<(), StorageError> {
    let execution_id = escape_cypher_string(execution_id);
    conn
      .query(&format!(
        "MATCH (e:Execution {{id: '{execution_id}'}})-[rel:EXECUTED_WITH]->(:Component) DELETE rel"
      ))
      .map_err(|err| StorageError::Index(format!("failed to clear execution components: {err}")))?;
    Ok(())
  }

  fn connection(&self) -> Result<Connection<'_>, StorageError> {
    Connection::new(&self.db)
      .map_err(|err| StorageError::Index(format!("failed to create connection: {err}")))
  }

  fn execute_query(&self, query: &str) -> Result<Vec<Vec<Value>>, StorageError> {
    let conn = self.connection()?;
    let result =
      conn.query(query).map_err(|err| StorageError::Query(format!("query failed: {err}")))?;

    Ok(result.map(|row| row.into_iter().map(lbug_value_to_json).collect()).collect())
  }
}

fn collect_components(
  metadata: &crate::execution_metadata::ExecutionMetadataIndex,
) -> Vec<(String, String, String, String)> {
  let mut components = Vec::new();

  for (index, schema_id) in metadata.schema_ids.iter().enumerate() {
    let name = metadata.schema_names.get(index).cloned().unwrap_or_else(|| schema_id.clone());
    components.push((
      format!("schema:{schema_id}"),
      name,
      "schema".into(),
      serde_json::to_string(&metadata.tags).unwrap_or_else(|_| "[]".into()),
    ));
  }

  for (index, generator_name) in metadata.generator_names.iter().enumerate() {
    let generator_id =
      metadata.generator_ids.get(index).cloned().unwrap_or_else(|| generator_name.clone());
    components.push((
      format!("generator:{generator_id}"),
      generator_name.clone(),
      "generator".into(),
      "[]".into(),
    ));
  }

  components
}

fn read_max_db_size() -> u64 {
  std::env::var("GRAPH_MAX_DB_SIZE")
    .ok()
    .and_then(|value| value.parse().ok())
    .unwrap_or(DEFAULT_MAX_DB_SIZE)
}

fn format_timestamp(timestamp: DateTime<Utc>) -> String {
  timestamp.format("%Y-%m-%d %H:%M:%S%.6f").to_string()
}

fn escape_cypher_string(value: &str) -> String {
  value.replace('\\', "\\\\").replace('\'', "\\'")
}

fn format_embedding_literal(embedding: &[f32]) -> String {
  let values = embedding.iter().map(|value| value.to_string()).collect::<Vec<_>>().join(", ");
  format!("[{values}]")
}

fn lbug_value_to_json(value: LbugValue) -> Value {
  match value {
    LbugValue::Null(_) => Value::Null,
    LbugValue::Bool(value) => Value::Bool(value),
    LbugValue::Int8(value) => Value::from(value),
    LbugValue::Int16(value) => Value::from(value),
    LbugValue::Int32(value) => Value::from(value),
    LbugValue::Int64(value) => Value::from(value),
    LbugValue::UInt8(value) => Value::from(value),
    LbugValue::UInt16(value) => Value::from(value),
    LbugValue::UInt32(value) => Value::from(value),
    LbugValue::UInt64(value) => Value::from(value),
    LbugValue::Float(value) => Value::from(value),
    LbugValue::Double(value) => Value::from(value),
    LbugValue::String(value) => Value::String(value),
    LbugValue::List(_, values) | LbugValue::Array(_, values) => {
      Value::Array(values.into_iter().map(lbug_value_to_json).collect())
    }
    other => Value::String(format!("{other:?}")),
  }
}
