use super::super::context::PipelineContext;
use super::super::error::PipelineResult;
use super::super::extract::read_file;
use super::super::fqn::compute_fqn;
use super::super::types::FileInfo;
use super::super::types::Language;
use super::SequentialPipelineState;

fn basename(rel: &str) -> &str {
  rel.rsplit('/').next().unwrap_or(rel)
}

fn is_gomod_file(name: &str) -> bool {
  name == "go.mod"
}

fn is_requirements_file(name: &str) -> bool {
  name == "requirements.txt"
}

fn is_kustomize_file(name: &str) -> bool {
  name == "kustomization.yaml" || name == "kustomization.yml"
}

fn is_helm_chart_file(name: &str) -> bool {
  name == "Chart.yaml" || name == "Chart.yml"
}

fn looks_like_k8s_manifest(content: &str) -> bool {
  content.contains("apiVersion:") && content.contains("kind:")
}

/// K8s / Helm / dependency-manifest pass. Mirrors `cbm_pipeline_pass_k8s`.
pub fn pass_k8s(ctx: &mut PipelineContext<'_>, files: &[FileInfo]) -> PipelineResult<()> {
  for file in files {
    ctx.check_cancel()?;
    let rel = file.rel_path.as_str();
    let base = basename(rel);
    let language = file.language;

    if is_gomod_file(base) || language == Language::Gomod || is_requirements_file(base) {
      if let Ok((data, _)) = read_file(&file.path) {
        if let Ok(text) = String::from_utf8(data) {
          handle_dep_manifest(&ctx.project_name, &mut ctx.sequential, rel, &text);
        }
      }
      continue;
    }

    if is_kustomize_file(base) {
      handle_kustomize_placeholder(&mut ctx.sequential, rel);
      continue;
    }

    if matches!(language, Language::Yaml | Language::K8s) {
      let Ok((data, _)) = read_file(&file.path) else {
        continue;
      };
      let Ok(text) = String::from_utf8(data) else {
        continue;
      };
      if is_helm_chart_file(base) {
        handle_helm_chart(&mut ctx.sequential, rel, &text);
      } else if looks_like_k8s_manifest(&text) {
        handle_k8s_manifest(&mut ctx.sequential, rel, &text);
      }
    }
  }
  Ok(())
}

fn handle_dep_manifest(
  project_name: &str,
  state: &mut SequentialPipelineState,
  rel: &str,
  source: &str,
) {
  let file_qn = compute_fqn(project_name, rel, Some("__file__"));
  let Some(src) = state.graph.find_by_qn(&file_qn).cloned() else {
    return;
  };
  let deps = parse_require_lines(source);
  for dep in deps {
    let dep_qn = format!("__dep__{dep}");
    let dep_id = state.graph.upsert_node("Dependency", &dep, &dep_qn, rel, 0, 0, "{}");
    state.graph.insert_edge(src.id, dep_id, "DEPENDS_ON", "{}");
  }
}

fn parse_require_lines(source: &str) -> Vec<String> {
  source
    .lines()
    .filter_map(|line| {
      let line = line.split('#').next()?.trim();
      if line.is_empty() || line.starts_with('-') {
        return None;
      }
      line.split_whitespace().next().map(str::to_string)
    })
    .collect()
}

fn handle_kustomize_placeholder(state: &mut SequentialPipelineState, rel: &str) {
  let qn = format!("__kustomize__{}", rel.replace('/', "__"));
  state.graph.upsert_node("Kustomize", basename(rel), &qn, rel, 0, 0, "{}");
}

fn handle_helm_chart(state: &mut SequentialPipelineState, rel: &str, source: &str) {
  let name = source
    .lines()
    .find_map(|line| {
      let line = line.trim();
      line.strip_prefix("name:").map(|v| v.trim().to_string())
    })
    .unwrap_or_else(|| basename(rel).to_string());
  let qn = format!("__helm__{name}");
  state.graph.upsert_node("HelmChart", &name, &qn, rel, 0, 0, "{}");
}

fn handle_k8s_manifest(state: &mut SequentialPipelineState, rel: &str, source: &str) {
  let kind = source
    .lines()
    .find_map(|line| {
      let line = line.trim();
      line.strip_prefix("kind:").map(|v| v.trim().to_string())
    })
    .unwrap_or_else(|| "Resource".to_string());
  let name = source
    .lines()
    .find_map(|line| {
      let line = line.trim();
      line.strip_prefix("name:").map(|v| v.trim().to_string())
    })
    .unwrap_or_else(|| basename(rel).to_string());
  let qn = format!("__k8s__{rel}__{name}").replace('/', "__");
  state.graph.upsert_node(&kind, &name, &qn, rel, 0, 0, r#"{"source":"k8s"}"#);
}
