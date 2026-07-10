use std::collections::HashMap;

use crate::FileInfo;
use crate::SequentialPipelineState;
use crate::context::PipelineContext;
use crate::error::PipelineResult;
use crate::extract::{FileResult, module_is_dir, read_file};
use crate::fqn::{compute_fqn, module_dir_fqn};

/// Usage / throw / read-write resolution pass. Mirrors `cbm_pipeline_pass_usages`.
pub fn pass_usages(ctx: &mut PipelineContext<'_>, files: &[FileInfo]) -> PipelineResult<()> {
  let project = ctx.project_name.as_str();
  for (i, file) in files.iter().enumerate() {
    ctx.check_cancel()?;
    let Some(result) = load_result(&ctx.sequential, i, file, project)? else {
      continue;
    };

    if result.usages.is_empty() && result.throws.is_empty() && result.rw.is_empty() {
      continue;
    }

    let import_map = build_import_map(&result);
    let module_qn = module_dir_fqn(project, &file.rel_path, module_is_dir(file.language));
    let rel = file.rel_path.clone();
    let state = &mut ctx.sequential;

    resolve_usage_edges(project, state, &result, &rel, &module_qn, &import_map);
    resolve_throw_edges(project, state, &result, &rel, &module_qn, &import_map);
    resolve_rw_edges(project, state, &result, &rel, &module_qn, &import_map);
  }
  Ok(())
}

fn load_result(
  state: &SequentialPipelineState,
  index: usize,
  file: &FileInfo,
  project: &str,
) -> PipelineResult<Option<FileResult>> {
  if let Some(cached) = state.result_cache.get(index).and_then(|r| r.as_ref()) {
    return Ok(Some(cached.clone()));
  }
  let Ok((data, _)) = read_file(&file.path) else {
    return Ok(None);
  };
  let extracted = state.extractor().extract_file(&data, file.language, project, &file.rel_path)?;
  let _ = extracted;
  Ok(None)
}

fn build_import_map(result: &FileResult) -> HashMap<String, String> {
  result
    .imports
    .iter()
    .filter_map(|imp| {
      let local = imp.local_name.clone().unwrap_or_else(|| imp.module_path.clone());
      Some((local, imp.module_path.clone()))
    })
    .collect()
}

fn resolve_usage_edges(
  project_name: &str,
  state: &mut SequentialPipelineState,
  result: &FileResult,
  rel: &str,
  module_qn: &str,
  import_map: &HashMap<String, String>,
) {
  for usage in &result.usages {
    if usage.type_name.is_empty() {
      continue;
    }
    let resolution = state.registry.resolve(&usage.type_name, module_qn, import_map);
    let Some(src_id) = source_node_id(state, project_name, usage.enclosing_func_qn.as_deref(), rel)
    else {
      continue;
    };
    let Some(tgt) = state.graph.find_by_qn(&resolution.qualified_name) else {
      continue;
    };
    if src_id == tgt.id {
      continue;
    }
    let props = serde_json::json!({
        "strategy": resolution.strategy,
        "confidence": resolution.confidence,
    })
    .to_string();
    state.graph.insert_edge(src_id, tgt.id, "USAGE", &props);
  }
}

fn resolve_throw_edges(
  project_name: &str,
  state: &mut SequentialPipelineState,
  result: &FileResult,
  rel: &str,
  module_qn: &str,
  import_map: &HashMap<String, String>,
) {
  for throw_site in &result.throws {
    if throw_site.exception_type.is_empty() {
      continue;
    }
    let resolution = state.registry.resolve(&throw_site.exception_type, module_qn, import_map);
    let Some(src_id) =
      source_node_id(state, project_name, throw_site.enclosing_func_qn.as_deref(), rel)
    else {
      continue;
    };
    let Some(tgt) = state.graph.find_by_qn(&resolution.qualified_name) else {
      continue;
    };
    state.graph.insert_edge(src_id, tgt.id, "THROWS", "{}");
  }
}

fn resolve_rw_edges(
  project_name: &str,
  state: &mut SequentialPipelineState,
  result: &FileResult,
  rel: &str,
  module_qn: &str,
  import_map: &HashMap<String, String>,
) {
  for rw in &result.rw {
    if rw.var_name.is_empty() {
      continue;
    }
    let resolution = state.registry.resolve(&rw.var_name, module_qn, import_map);
    let Some(src_id) = source_node_id(state, project_name, rw.enclosing_func_qn.as_deref(), rel)
    else {
      continue;
    };
    let Some(tgt) = state.graph.find_by_qn(&resolution.qualified_name) else {
      continue;
    };
    if src_id == tgt.id {
      continue;
    }
    let edge_type = if rw.is_write { "WRITES" } else { "READS" };
    state.graph.insert_edge(src_id, tgt.id, edge_type, "{}");
  }
}

fn source_node_id(
  state: &SequentialPipelineState,
  project_name: &str,
  enclosing: Option<&str>,
  rel: &str,
) -> Option<i64> {
  if let Some(qn) = enclosing.filter(|s| !s.is_empty()) {
    if let Some(node) = state.graph.find_by_qn(qn) {
      if !crate::graph::is_dir_container(node) {
        return Some(node.id);
      }
    }
  }
  let file_qn = compute_fqn(project_name, rel, Some("__file__"));
  state.graph.find_by_qn(&file_qn).map(|node| node.id)
}
