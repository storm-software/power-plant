use std::collections::HashMap;

use super::super::context::PipelineContext;
use super::super::error::PipelineResult;
use super::super::extract::{
    label_is_registry_symbol, Channel, ChannelDirection, Definition, EnvAccess, FileResult, Import,
    ReadStatus, is_quarantined, oversized_reason, quarantine_phase, read_file,
};
use super::super::fqn::{self, compute_fqn};
use super::super::graph::build_import_props;
use super::super::types::{FileErrorPhase, FileInfo};
use super::SequentialPipelineState;

pub fn pass_definitions(
    ctx: &mut PipelineContext<'_>,
    files: &[FileInfo],
) -> PipelineResult<()> {
    let project_name = ctx.project_name.clone();
    ctx.sequential.ensure_cache(files.len());
    let owns_local_cache = ctx.sequential.owns_cache;

    let mut total_defs = 0usize;
    let mut total_imports = 0usize;
    let mut errors = 0usize;

    // Phase 1: extract every file and create def-derived nodes before import resolution.
    for (i, file) in files.iter().enumerate() {
        ctx.check_cancel()?;
        let rel = file.rel_path.as_str();

        if is_quarantined(rel) {
            let phase = quarantine_phase(rel);
            let reason = if phase == "hang" {
                "quarantined after hang"
            } else {
                "quarantined after crash"
            };
            ctx.pipeline.add_file_error(rel, reason, FileErrorPhase::Extract);
            errors += 1;
            continue;
        }

        let source = match read_file(&file.path) {
            Ok((data, _)) => data,
            Err(ReadStatus::Oversized) => {
                let size = std::fs::metadata(&file.path).map(|m| m.len()).unwrap_or(0);
                ctx.pipeline.add_file_error(
                    rel,
                    oversized_reason(size),
                    FileErrorPhase::Oversized,
                );
                errors += 1;
                continue;
            }
            Err(ReadStatus::OpenFail | ReadStatus::Oom) => {
                ctx.pipeline
                    .add_file_error(rel, "read failed", FileErrorPhase::Read);
                errors += 1;
                continue;
            }
            Err(ReadStatus::Empty) => continue,
            Err(ReadStatus::Ok) => unreachable!(),
        };

        let language = file.language;
        let result = ctx.sequential.extractor().extract_file(
            &source,
            language,
            &project_name,
            rel,
        )?;

        if result.has_error {
            ctx.pipeline.add_file_error(
                rel,
                result.error_msg.as_deref().unwrap_or("extract failed"),
                FileErrorPhase::Extract,
            );
            errors += 1;
        }

        for def in &result.defs {
            process_def(&mut ctx.sequential, &project_name, def, rel);
            total_defs += 1;
        }

        if owns_local_cache {
            ctx.sequential.result_cache[i] = Some(result);
        } else {
            let namespace_map = HashMap::new();
            total_imports += create_import_edges(
                &mut ctx.sequential,
                &project_name,
                &result,
                rel,
                &namespace_map,
            );
            create_channel_edges(&mut ctx.sequential, &project_name, &result, rel);
            create_env_configures(&mut ctx.sequential, &project_name, &result, rel);
        }
    }

    // Phase 2: all Module nodes exist — resolve imports against full graph.
    if owns_local_cache {
        let namespace_map =
            build_namespace_map(&project_name, &ctx.sequential.result_cache, files);
        for (i, file) in files.iter().enumerate() {
            ctx.check_cancel()?;
            let Some(result) = ctx.sequential.result_cache[i].clone() else {
                continue;
            };
            total_imports += create_import_edges(
                &mut ctx.sequential,
                &project_name,
                &result,
                &file.rel_path,
                &namespace_map,
            );
            create_channel_edges(
                &mut ctx.sequential,
                &project_name,
                &result,
                &file.rel_path,
            );
            create_env_configures(
                &mut ctx.sequential,
                &project_name,
                &result,
                &file.rel_path,
            );
        }
    }

    let _ = (total_defs, total_imports, errors);
    Ok(())
}

fn process_def(
    state: &mut SequentialPipelineState,
    project_name: &str,
    def: &Definition,
    rel: &str,
) {
    if def.qualified_name.is_empty() || def.name.is_empty() {
        return;
    }

    let props = build_def_props(def);
    let file_path = def.file_path.as_deref().unwrap_or(rel);
    let node_id = state.graph.upsert_node(
        if def.label.is_empty() {
            "Function"
        } else {
            &def.label
        },
        &def.name,
        &def.qualified_name,
        file_path,
        def.start_line,
        def.end_line,
        &props,
    );

    if node_id > 0 && label_is_registry_symbol(&def.label) {
        state
            .registry
            .add(&def.name, &def.qualified_name, &def.label);
    }

    let file_qn = compute_fqn(project_name, rel, Some("__file__"));
    if let Some(file_node) = state.graph.find_by_qn(&file_qn) {
        state.graph.insert_edge(file_node.id, node_id, "DEFINES", "{}");
    }

    if def.label == "Method" {
        if let Some(parent_qn) = def.parent_class.as_deref() {
            if let Some(parent) = state.graph.find_by_qn(parent_qn) {
                state
                    .graph
                    .insert_edge(parent.id, node_id, "DEFINES_METHOD", "{}");
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

fn build_namespace_map(
    project: &str,
    cache: &[Option<FileResult>],
    files: &[FileInfo],
) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for (i, file) in files.iter().enumerate() {
        let Some(result) = cache.get(i).and_then(|r| r.as_ref()) else {
            continue;
        };
        for imp in &result.imports {
            if let Some(ns) = imp.namespace.as_deref() {
                let file_qn = compute_fqn(project, &file.rel_path, Some("__file__"));
                map.insert(ns.to_string(), file_qn);
            }
        }
    }
    map
}

fn create_import_edges(
    state: &mut SequentialPipelineState,
    project_name: &str,
    result: &FileResult,
    rel: &str,
    namespace_map: &HashMap<String, String>,
) -> usize {
    let file_qn = compute_fqn(project_name, rel, Some("__file__"));
    let Some(source) = state.graph.find_by_qn(&file_qn).cloned() else {
        return 0;
    };

    let mut count = 0;
    for imp in &result.imports {
        let Some(target) =
            resolve_import_node(state, project_name, rel, &file_qn, imp, namespace_map)
        else {
            continue;
        };
        if target.id != source.id {
            state.graph.insert_edge(
                source.id,
                target.id,
                "IMPORTS",
                &build_import_props(imp.local_name.as_deref()),
            );
            count += 1;
        }
    }
    count
}

fn resolve_import_node(
    state: &SequentialPipelineState,
    project_name: &str,
    source_rel: &str,
    source_file_qn: &str,
    imp: &Import,
    namespace_map: &HashMap<String, String>,
) -> Option<super::super::graph::GraphNode> {
    if let Some(module_qn) = resolve_module(state, project_name, source_rel, &imp.module_path) {
        if let Some(node) = state.graph.find_by_qn(&module_qn) {
            return Some(node.clone());
        }
    }

    if let Some(file_qn) = namespace_map.get(&imp.module_path) {
        if file_qn != source_file_qn {
            return state.graph.find_by_qn(file_qn).cloned();
        }
    }

    let simple = imp
        .module_path
        .rsplit('.')
        .next()
        .unwrap_or(&imp.module_path);
    state.graph.find_by_simple_name(simple, source_file_qn)
}

fn resolve_module(
    state: &SequentialPipelineState,
    project_name: &str,
    source_rel: &str,
    module_path: &str,
) -> Option<String> {
    if let Some(rel) = fqn::resolve_relative_import(source_rel, module_path) {
        return Some(fqn::module_fqn(project_name, &rel));
    }
    if let Some(target) = state.pkgmap.get(module_path) {
        return Some(target.clone());
    }
    Some(fqn::module_fqn(project_name, module_path))
}

fn create_channel_edges(
    state: &mut SequentialPipelineState,
    project_name: &str,
    result: &FileResult,
    rel: &str,
) {
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
        let channel_id = state.graph.upsert_node(
            "Channel",
            &ch.channel_name,
            &channel_qn,
            "",
            0,
            0,
            &channel_props,
        );

        let Some(src_id) = find_channel_source(state, project_name, ch, rel) else {
            continue;
        };
        let edge_type = match ch.direction {
            ChannelDirection::Emit => "EMITS",
            ChannelDirection::Listen => "LISTENS_ON",
        };
        let edge_props = serde_json::json!({ "transport": transport }).to_string();
        state
            .graph
            .insert_edge(src_id, channel_id, edge_type, &edge_props);
    }
}

fn find_channel_source(
    state: &SequentialPipelineState,
    project_name: &str,
    ch: &Channel,
    rel: &str,
) -> Option<i64> {
    if let Some(qn) = ch.enclosing_func_qn.as_deref().filter(|s| !s.is_empty()) {
        if let Some(node) = state.graph.find_by_qn(qn) {
            return Some(node.id);
        }
    }
    let file_qn = compute_fqn(project_name, rel, Some("__file__"));
    state.graph.find_by_qn(&file_qn).map(|node| node.id)
}

fn create_env_configures(
    state: &mut SequentialPipelineState,
    project_name: &str,
    result: &FileResult,
    rel: &str,
) -> usize {
    let mut count = 0;
    let file_qn = compute_fqn(project_name, rel, Some("__file__"));
    for ea in &result.env_accesses {
        if ea.env_key.is_empty() {
            continue;
        }
        let env_qn = format!("__env__{}", ea.env_key);
        let env_props = serde_json::json!({ "env_key": ea.env_key }).to_string();
        let env_id = state.graph.upsert_node(
            "EnvVar",
            &ea.env_key,
            &env_qn,
            "",
            0,
            0,
            &env_props,
        );
        let Some(src_id) = env_source(state, project_name, ea, rel, &file_qn) else {
            continue;
        };
        if src_id != env_id {
            state.graph.insert_edge(
                src_id,
                env_id,
                "CONFIGURES",
                r#"{"strategy":"env_access"}"#,
            );
            count += 1;
        }
    }
    count
}

fn env_source(
    state: &SequentialPipelineState,
    project_name: &str,
    ea: &EnvAccess,
    rel: &str,
    file_qn: &str,
) -> Option<i64> {
    if let Some(qn) = ea.enclosing_func_qn.as_deref().filter(|s| !s.is_empty()) {
        if let Some(node) = state.graph.find_by_qn(qn) {
            return Some(node.id);
        }
    }
    state
        .graph
        .find_by_qn(file_qn)
        .map(|node| node.id)
        .or_else(|| {
            let qn = compute_fqn(project_name, rel, Some("__file__"));
            state.graph.find_by_qn(&qn).map(|node| node.id)
        })
}
