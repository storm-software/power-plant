//! Turn a [`FileResult`] into searchable graph nodes / edges.

use crate::extract::{
  Channel, ChannelDirection, Definition, EnvAccess, FileResult, label_is_registry_symbol,
};
use crate::fqn::compute_fqn;
use crate::graph::{GraphBuffer, build_import_props};
use crate::registry::Registry;

/// Counts of nodes / edges written by [`index_file_result`].
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct IndexCounts {
  pub nodes: usize,
  pub edges: usize,
}

/// Upsert definitions and local edges from `result` into `graph`.
///
/// Module/Function/Class
/// nodes, `DEFINES` / `DEFINES_METHOD` / `IMPLEMENTS` edges. Call / import
/// resolution that needs a full registry still runs in sequential passes.
pub fn index_file_result(
  graph: &mut GraphBuffer,
  result: &FileResult,
  project: &str,
  rel_path: &str,
) -> IndexCounts {
  let mut registry = Registry::new();
  index_file_result_with_registry(graph, &mut registry, result, project, rel_path)
}

/// Same as [`index_file_result`] but also populates `registry` for later call resolution.
pub fn index_file_result_with_registry(
  graph: &mut GraphBuffer,
  registry: &mut Registry,
  result: &FileResult,
  project: &str,
  rel_path: &str,
) -> IndexCounts {
  let before_nodes = graph.node_count() as usize;
  let before_edges = graph.edge_count() as usize;

  for def in &result.defs {
    process_def(graph, registry, project, def, rel_path);
  }

  for it in &result.impl_traits {
    if let (Some(trait_node), Some(type_node)) =
      (graph.find_by_qn(&it.trait_qn), graph.find_by_qn(&it.type_qn))
    {
      let trait_id = trait_node.id;
      let type_id = type_node.id;
      graph.insert_edge(type_id, trait_id, "IMPLEMENTS", "{}");
    } else {
      // Ensure both endpoints exist as stubs so IMPLEMENTS is searchable.
      let trait_id = graph.upsert_node(
        "Trait",
        it.trait_qn.rsplit('.').next().unwrap_or(&it.trait_qn),
        &it.trait_qn,
        rel_path,
        0,
        0,
        "{}",
      );
      let type_id = graph.upsert_node(
        "Struct",
        it.type_qn.rsplit('.').next().unwrap_or(&it.type_qn),
        &it.type_qn,
        rel_path,
        0,
        0,
        "{}",
      );
      graph.insert_edge(type_id, trait_id, "IMPLEMENTS", "{}");
    }
  }

  // Best-effort local import edges (full resolution needs package map).
  create_import_edges(graph, project, result, rel_path);
  create_channel_edges(graph, project, result, rel_path);
  create_env_edges(graph, project, result, rel_path);

  IndexCounts {
    nodes: (graph.node_count() as usize).saturating_sub(before_nodes),
    edges: (graph.edge_count() as usize).saturating_sub(before_edges),
  }
}

fn process_def(
  graph: &mut GraphBuffer,
  registry: &mut Registry,
  project: &str,
  def: &Definition,
  rel: &str,
) {
  if def.qualified_name.is_empty() || def.name.is_empty() {
    return;
  }

  let props = build_def_props(def);
  let file_path = def.file_path.as_deref().unwrap_or(rel);
  let node_id = graph.upsert_node(
    if def.label.is_empty() { "Function" } else { &def.label },
    &def.name,
    &def.qualified_name,
    file_path,
    def.start_line,
    def.end_line,
    &props,
  );

  if label_is_registry_symbol(&def.label) {
    registry.add(&def.name, &def.qualified_name, &def.label);
  }

  let file_qn = compute_fqn(project, rel, Some("__file__"));
  if let Some(file_node) = graph.find_by_qn(&file_qn) {
    let file_id = file_node.id;
    graph.insert_edge(file_id, node_id, "DEFINES", "{}");
  }

  if def.label == "Method" {
    if let Some(parent_qn) = def.parent_class.as_deref() {
      if let Some(parent) = graph.find_by_qn(parent_qn) {
        let parent_id = parent.id;
        graph.insert_edge(parent_id, node_id, "DEFINES_METHOD", "{}");
      }
    }
  }
}

fn build_def_props(def: &Definition) -> String {
  let is_fn = matches!(def.label.as_str(), "Function" | "Method");
  if is_fn {
    serde_json::json!({
        "complexity": def.complexity,
        "lines": def.lines,
        "is_exported": def.is_exported,
        "is_test": def.is_test,
        "is_entry_point": def.is_entry_point,
        "signature": def.signature,
        "return_type": def.return_type,
        "parent_class": def.parent_class,
        "decorators": def.decorators,
        "base_classes": def.base_classes,
    })
    .to_string()
  } else {
    serde_json::json!({
        "complexity": def.complexity,
        "lines": def.lines,
        "is_exported": def.is_exported,
        "is_test": def.is_test,
        "is_entry_point": def.is_entry_point,
    })
    .to_string()
  }
}

fn create_import_edges(graph: &mut GraphBuffer, project: &str, result: &FileResult, rel: &str) {
  let file_qn = compute_fqn(project, rel, Some("__file__"));
  let Some(source) = graph.find_by_qn(&file_qn).cloned() else {
    return;
  };

  for imp in &result.imports {
    let target_qn = crate::fqn::module_fqn(project, &imp.module_path);
    let target_id = graph.upsert_node(
      "Module",
      imp.module_path.rsplit(['.', '/', ':']).next().unwrap_or(&imp.module_path),
      &target_qn,
      "",
      0,
      0,
      "{}",
    );
    graph.insert_edge(
      source.id,
      target_id,
      "IMPORTS",
      &build_import_props(imp.local_name.as_deref()),
    );
  }
}

fn create_channel_edges(graph: &mut GraphBuffer, project: &str, result: &FileResult, rel: &str) {
  for ch in &result.channels {
    if ch.channel_name.is_empty() {
      continue;
    }
    let transport = ch.transport.as_deref().unwrap_or("unknown");
    let channel_qn = format!("__channel__{transport}__{}", ch.channel_name);
    let channel_props = serde_json::json!({
        "transport": transport,
        "name": ch.channel_name,
    })
    .to_string();
    let channel_id =
      graph.upsert_node("Channel", &ch.channel_name, &channel_qn, "", 0, 0, &channel_props);

    let Some(src_id) = channel_source(graph, project, ch, rel) else {
      continue;
    };
    let edge_type = match ch.direction {
      ChannelDirection::Emit => "EMITS",
      ChannelDirection::Listen => "LISTENS_ON",
    };
    let edge_props = serde_json::json!({ "transport": transport }).to_string();
    graph.insert_edge(src_id, channel_id, edge_type, &edge_props);
  }
}

fn channel_source(graph: &GraphBuffer, project: &str, ch: &Channel, rel: &str) -> Option<i64> {
  if let Some(qn) = ch.enclosing_func_qn.as_deref().filter(|s| !s.is_empty()) {
    if let Some(node) = graph.find_by_qn(qn) {
      return Some(node.id);
    }
  }
  let file_qn = compute_fqn(project, rel, Some("__file__"));
  graph.find_by_qn(&file_qn).map(|n| n.id)
}

fn create_env_edges(graph: &mut GraphBuffer, project: &str, result: &FileResult, rel: &str) {
  let file_qn = compute_fqn(project, rel, Some("__file__"));
  for ea in &result.env_accesses {
    if ea.env_key.is_empty() {
      continue;
    }
    let env_qn = format!("__env__{}", ea.env_key);
    let env_props = serde_json::json!({ "env_key": ea.env_key }).to_string();
    let env_id = graph.upsert_node("EnvVar", &ea.env_key, &env_qn, "", 0, 0, &env_props);
    let Some(src_id) = env_source(graph, project, ea, &file_qn) else {
      continue;
    };
    if src_id != env_id {
      graph.insert_edge(src_id, env_id, "CONFIGURES", r#"{"strategy":"env_access"}"#);
    }
  }
}

fn env_source(graph: &GraphBuffer, _project: &str, ea: &EnvAccess, file_qn: &str) -> Option<i64> {
  if let Some(qn) = ea.enclosing_func_qn.as_deref().filter(|s| !s.is_empty()) {
    if let Some(node) = graph.find_by_qn(qn) {
      return Some(node.id);
    }
  }
  graph.find_by_qn(file_qn).map(|n| n.id)
}
