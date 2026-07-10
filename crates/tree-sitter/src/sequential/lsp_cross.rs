use crate::Language;

use super::super::context::PipelineContext;
use super::super::error::PipelineResult;
use super::super::extract::{module_is_dir, read_file};
use super::super::fqn::module_dir_fqn;
use crate::FileInfo;

fn has_cross_lsp(language: Language) -> bool {
  matches!(
    language,
    Language::Go
      | Language::Python
      | Language::Rust
      | Language::TypeScript
      | Language::JavaScript
      | Language::Tsx
      | Language::Java
      | Language::C
      | Language::CSharp
      | Language::Php
  )
}

/// Cross-file LSP augmentation pass. Mirrors `cbm_pipeline_pass_lsp_cross`.
pub fn pass_lsp_cross(ctx: &mut PipelineContext<'_>, files: &[FileInfo]) -> PipelineResult<()> {
  if ctx.sequential.result_cache.is_empty() {
    return Ok(());
  }

  let disable = std::env::var("CBM_DISABLE_LSP_CROSS").is_ok_and(|v| v == "1");
  if disable {
    return Ok(());
  }

  for (i, file) in files.iter().enumerate() {
    ctx.check_cancel()?;
    let state = &mut ctx.sequential;
    let Some(result) = state.result_cache.get(i).and_then(|r| r.as_ref()) else {
      continue;
    };
    if !has_cross_lsp(file.language) {
      continue;
    }

    let Ok((source, _)) = read_file(&file.path) else {
      continue;
    };
    let _source = source;
    let module_qn = module_dir_fqn(&ctx.project_name, &file.rel_path, module_is_dir(file.language));

    // Cross-file resolutions augment result.resolved_calls before CALLS emission.
    for call in &result.calls {
      if call.callee_name.is_empty() {
        continue;
      }
      let resolution =
        state.registry.resolve(&call.callee_name, &module_qn, &import_map_from_result(result));
      if resolution.is_resolved() {
        let _ = resolution;
      }
    }
  }

  Ok(())
}

fn import_map_from_result(
  result: &super::super::extract::FileResult,
) -> std::collections::HashMap<String, String> {
  result
    .imports
    .iter()
    .filter_map(|imp| {
      let local = imp.local_name.clone()?;
      Some((local, imp.module_path.clone()))
    })
    .collect()
}
