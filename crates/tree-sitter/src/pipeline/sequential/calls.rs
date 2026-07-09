use std::collections::HashMap;

use super::super::context::PipelineContext;
use super::super::error::PipelineResult;
use super::super::extract::{module_is_dir, FileResult};
use super::super::fqn::compute_fqn;
use super::super::fqn::module_dir_fqn;
use super::super::registry::confidence_band;
use super::super::types::FileInfo;

/// Call resolution pass. Mirrors `cbm_pipeline_pass_calls`.
pub fn pass_calls(ctx: &mut PipelineContext<'_>, files: &[FileInfo]) -> PipelineResult<()> {
    for (i, file) in files.iter().enumerate() {
        ctx.check_cancel()?;
        let state = &mut ctx.sequential;
        let Some(result) = state.result_cache.get(i).and_then(|r| r.as_ref()) else {
            continue;
        };

        if result.calls.is_empty() && result.resolved_calls.is_empty() {
            continue;
        }

        let import_map = build_import_map(result);
        let module_qn = module_dir_fqn(
            &ctx.project_name,
            &file.rel_path,
            module_is_dir(file.language),
        );
        let file_qn = compute_fqn(&ctx.project_name, &file.rel_path, Some("__file__"));

        for call in &result.calls {
            if call.callee_name.is_empty() {
                continue;
            }
            let resolution = state
                .registry
                .resolve(&call.callee_name, &module_qn, &import_map);
            let Some(target) = state.graph.find_by_qn(&resolution.qualified_name) else {
                continue;
            };
            let Some(src) = call
                .enclosing_func_qn
                .as_deref()
                .and_then(|qn| state.graph.find_by_qn(qn))
                .or_else(|| state.graph.find_by_qn(&file_qn))
            else {
                continue;
            };
            let props = serde_json::json!({
                "strategy": resolution.strategy,
                "confidence": resolution.confidence,
                "confidence_band": confidence_band(resolution.confidence),
            })
            .to_string();
            state
                .graph
                .insert_edge(src.id, target.id, "CALLS", &props);
        }

        for resolved in &result.resolved_calls {
            if resolved.qualified_name.is_empty() {
                continue;
            }
            let Some(target) = state.graph.find_by_qn(&resolved.qualified_name) else {
                continue;
            };
            let Some(src) = state.graph.find_by_qn(&file_qn) else {
                continue;
            };
            let props = serde_json::json!({
                "strategy": resolved.strategy,
                "confidence": resolved.confidence,
                "confidence_band": confidence_band(resolved.confidence),
                "source": "lsp",
            })
            .to_string();
            state
                .graph
                .insert_edge(src.id, target.id, "CALLS", &props);
        }
    }

    Ok(())
}

fn build_import_map(result: &FileResult) -> HashMap<String, String> {
    result
        .imports
        .iter()
        .filter_map(|imp| {
            let local = imp
                .local_name
                .clone()
                .unwrap_or_else(|| imp.module_path.clone());
            Some((local, imp.module_path.clone()))
        })
        .collect()
}
