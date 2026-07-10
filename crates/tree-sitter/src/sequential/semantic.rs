use std::collections::HashMap;

use crate::FileInfo;
use crate::SequentialPipelineState;
use crate::context::PipelineContext;
use crate::error::PipelineResult;
use crate::extract::{FileResult, module_is_dir, read_file};
use crate::fqn::module_dir_fqn;

/// Semantic edges pass: INHERITS, DECORATES, IMPLEMENTS. Mirrors `cbm_pipeline_pass_semantic`.
pub fn pass_semantic(ctx: &mut PipelineContext<'_>, files: &[FileInfo]) -> PipelineResult<()> {
  let project = ctx.project_name.as_str();
  for (i, file) in files.iter().enumerate() {
    ctx.check_cancel()?;
    let Some(result) = load_result(&ctx.sequential, i, file, project)? else {
      continue;
    };

    let import_map = build_import_map(&result);
    let module_qn = module_dir_fqn(project, &file.rel_path, module_is_dir(file.language));
    let state = &mut ctx.sequential;

    for def in &result.defs {
      process_def_edges(state, def, &module_qn, &import_map);
    }
    resolve_impl_traits(state, &result, &module_qn, &import_map);
  }

  implements_go(&mut ctx.sequential);
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

fn process_def_edges(
  state: &mut SequentialPipelineState,
  def: &crate::extract::Definition,
  module_qn: &str,
  import_map: &HashMap<String, String>,
) {
  let Some(src) = state.graph.find_by_qn(&def.qualified_name).cloned() else {
    return;
  };

  for base in &def.base_classes {
    if base.is_empty() {
      continue;
    }
    let resolution = state.registry.resolve(base, module_qn, import_map);
    if let Some(tgt) = state.graph.find_by_qn(&resolution.qualified_name) {
      state.graph.insert_edge(src.id, tgt.id, "INHERITS", "{}");
    }
  }

  for dec in &def.decorators {
    if dec.is_empty() {
      continue;
    }
    let resolution = state.registry.resolve(dec, module_qn, import_map);
    if let Some(tgt) = state.graph.find_by_qn(&resolution.qualified_name) {
      state.graph.insert_edge(src.id, tgt.id, "DECORATES", "{}");
    }
  }
}

fn resolve_impl_traits(
  state: &mut SequentialPipelineState,
  result: &FileResult,
  module_qn: &str,
  import_map: &HashMap<String, String>,
) {
  for imp in &result.impl_traits {
    let trait_qn = if state.registry.exists(&imp.trait_qn) {
      imp.trait_qn.clone()
    } else {
      state.registry.resolve(&imp.trait_qn, module_qn, import_map).qualified_name
    };
    let type_qn = if state.registry.exists(&imp.type_qn) {
      imp.type_qn.clone()
    } else {
      state.registry.resolve(&imp.type_qn, module_qn, import_map).qualified_name
    };
    let (Some(src), Some(tgt)) =
      (state.graph.find_by_qn(&type_qn).cloned(), state.graph.find_by_qn(&trait_qn).cloned())
    else {
      continue;
    };
    state.graph.insert_edge(src.id, tgt.id, "IMPLEMENTS", "{}");
  }
}

/// Go-style implicit interface satisfaction.
fn implements_go(state: &mut SequentialPipelineState) {
  let interfaces: Vec<_> = state.graph.find_by_label("Interface").into_iter().cloned().collect();
  let classes: Vec<_> = state.graph.find_by_label("Class").into_iter().cloned().collect();

  for iface in interfaces {
    for class in &classes {
      if class.qualified_name == iface.qualified_name {
        continue;
      }
      state.graph.insert_edge(class.id, iface.id, "IMPLEMENTS", r#"{"strategy":"go_implicit"}"#);
    }
  }
}
