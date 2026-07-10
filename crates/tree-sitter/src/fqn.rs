use std::path::Path;

const FQN_MAX_NAME_LEN: usize = 200;

/// Compute qualified name: `project.dir.parts.name`.
pub fn compute_fqn(project: &str, rel_path: &str, name: Option<&str>) -> String {
  let project = if project.is_empty() { "" } else { project };
  let mut segments = vec![project.to_string()];

  let mut path = normalize_slashes(rel_path);
  strip_file_extension(&mut path);
  segments.extend(tokenize_path(&path));

  strip_init_or_index(&mut segments, name.is_some());

  if let Some(name) = name.filter(|n| !n.is_empty()) {
    segments.push(name.to_string());
  }

  join_segments(&segments)
}

/// Module QN: `project.dir.parts` (no symbol name).
pub fn module_fqn(project: &str, rel_path: &str) -> String {
  compute_fqn(project, rel_path, None)
}

/// Language-aware module QN. When `module_is_dir` is true the module is the
/// containing directory (Java/Go package semantics).
pub fn module_dir_fqn(project: &str, rel_path: &str, module_is_dir: bool) -> String {
  if !module_is_dir {
    return module_fqn(project, rel_path);
  }

  let normalized = normalize_slashes(rel_path);
  let dir = normalized.rsplit_once('/').map(|(dir, _)| dir).unwrap_or("");
  folder_fqn(project, dir)
}

/// Folder QN: `project.dir.parts`.
pub fn folder_fqn(project: &str, rel_dir: &str) -> String {
  let project = if project.is_empty() { "" } else { project };
  let mut segments = vec![project.to_string()];
  let dir = normalize_slashes(rel_dir);
  if !dir.is_empty() {
    segments.extend(tokenize_path(&dir));
  }
  join_segments(&segments)
}

/// Resolve a relative import specifier against the importing file path.
pub fn resolve_relative_import(source_rel: &str, module_path: &str) -> Option<String> {
  let kind = classify_relative_import(module_path)?;
  let mut buf = seed_source_dir(source_rel);

  match kind {
    RelativeImportKind::Python => resolve_python_relative(&mut buf, module_path),
    RelativeImportKind::Js => resolve_js_relative(&mut buf, module_path),
  }
}

/// Derive a sanitized project name from an absolute path.
pub fn project_name_from_path(abs_path: &str) -> String {
  if abs_path.is_empty() || path_is_root_syntax(abs_path) {
    return "root".to_string();
  }

  let canonical = std::fs::canonicalize(abs_path)
    .map(|p| p.to_string_lossy().into_owned())
    .unwrap_or_else(|_| normalize_slashes(abs_path));

  let mapped = map_project_chars(&canonical);
  let collapsed = collapse_repeats(&mapped);
  let trimmed = trim_edges(&collapsed);

  if trimmed.is_empty() {
    return "root".to_string();
  }

  bound_name_len(trimmed)
}

/// Validate a project name for DB filename safety.
pub fn validate_project_name(name: &str) -> bool {
  if name.is_empty() || name == ".." || name.contains("..") {
    return false;
  }
  if name.contains('/') || name.contains('\\') || name.starts_with('.') {
    return false;
  }
  name.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.')
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum RelativeImportKind {
  Python,
  Js,
}

fn classify_relative_import(module_path: &str) -> Option<RelativeImportKind> {
  if !module_path.starts_with('.') {
    return None;
  }
  let has_slash = module_path.contains('/');
  let js_like =
    module_path.get(1..).is_some_and(|rest| rest.starts_with('/') || rest.starts_with("./"));
  if has_slash || js_like { Some(RelativeImportKind::Js) } else { Some(RelativeImportKind::Python) }
}

fn normalize_slashes(path: &str) -> String {
  path.replace('\\', "/")
}

fn tokenize_path(path: &str) -> Vec<String> {
  if path.is_empty() {
    return Vec::new();
  }
  path.split('/').filter(|s| !s.is_empty()).map(str::to_string).collect()
}

fn strip_file_extension(path: &mut String) {
  let slash = path.rfind('/');
  let start = slash.map(|i| i + 1).unwrap_or(0);
  if let Some(dot) = path[start..].rfind('.') {
    path.truncate(start + dot);
  }
}

fn strip_init_or_index(segments: &mut Vec<String>, has_name: bool) {
  if segments.len() <= 1 || !has_name {
    return;
  }
  if matches!(segments.last().map(String::as_str), Some("__init__") | Some("index")) {
    segments.pop();
  }
}

fn join_segments(segments: &[String]) -> String {
  segments.join(".")
}

fn seed_source_dir(source_rel: &str) -> String {
  let normalized = normalize_slashes(source_rel);
  normalized.rsplit_once('/').map(|(dir, _)| dir.to_string()).unwrap_or_default()
}

fn path_append_segment(buf: &mut String, seg: &str) {
  if !buf.is_empty() {
    buf.push('/');
  }
  buf.push_str(seg);
}

fn path_pop_segment(buf: &mut String) {
  if let Some((parent, _)) = buf.rsplit_once('/') {
    *buf = parent.to_string();
  } else {
    buf.clear();
  }
}

fn resolve_python_relative(buf: &mut String, module_path: &str) -> Option<String> {
  let mut p = module_path;
  let mut dot_count = 0;
  while p.starts_with('.') {
    dot_count += 1;
    p = &p[1..];
  }
  for _ in 1..dot_count {
    path_pop_segment(buf);
  }
  for segment in p.split('.').filter(|s| !s.is_empty()) {
    path_append_segment(buf, segment);
  }
  Some(buf.clone())
}

fn strip_ext(segment: &str) -> &str {
  segment.rsplit_once('.').map(|(base, _)| base).unwrap_or(segment)
}

fn resolve_js_relative(buf: &mut String, module_path: &str) -> Option<String> {
  let mut parts = module_path.split('/').peekable();
  while let Some(part) = parts.next() {
    if part.is_empty() || part == "." {
      continue;
    }
    if part == ".." {
      path_pop_segment(buf);
      continue;
    }
    let segment = if parts.peek().is_none() { strip_ext(part) } else { part };
    if !segment.is_empty() {
      path_append_segment(buf, segment);
    }
  }
  Some(buf.clone())
}

fn path_is_root_syntax(path: &str) -> bool {
  !path.is_empty() && path.chars().all(|c| matches!(c, '/' | '\\' | ':'))
}

fn map_project_chars(path: &str) -> String {
  let mut mapped = String::with_capacity(path.len() * 2);
  for c in path.chars() {
    if c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-') {
      mapped.push(c);
    } else if !c.is_ascii() {
      for byte in c.to_string().as_bytes() {
        mapped.push_str(&format!("{byte:02x}"));
      }
    } else {
      mapped.push('-');
    }
  }
  mapped
}

fn collapse_repeats(input: &str) -> String {
  let mut out = String::with_capacity(input.len());
  let mut prev = '\0';
  for c in input.chars() {
    if (c == '-' && prev == '-') || (c == '.' && prev == '.') {
      continue;
    }
    out.push(c);
    prev = c;
  }
  out
}

fn trim_edges(input: &str) -> String {
  let start = input.trim_start_matches(['-', '.']);
  let end = start.trim_end_matches('-');
  end.to_string()
}

fn bound_name_len(mut name: String) -> String {
  if name.len() <= FQN_MAX_NAME_LEN {
    return name;
  }
  let mut hash: u32 = 2_166_136_261;
  for byte in name.as_bytes() {
    hash ^= u32::from(*byte);
    hash = hash.wrapping_mul(16_777_619);
  }
  name.truncate(FQN_MAX_NAME_LEN - 9);
  name.push_str(&format!("-{hash:08x}"));
  name
}

/// Normalize a path for FQN derivation using `Path` semantics where helpful.
pub fn project_name_from_path_buf(path: &Path) -> String {
  project_name_from_path(&path.to_string_lossy())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn compute_fqn_strips_extension_and_init() {
    let qn = compute_fqn("myproj", "src/utils/__init__.py", Some("helper"));
    assert_eq!(qn, "myproj.src.utils.helper");
  }

  #[test]
  fn module_dir_fqn_uses_directory_for_java_style() {
    let qn = module_dir_fqn("app", "com/example/Foo.java", true);
    assert_eq!(qn, "app.com.example");
  }

  #[test]
  fn resolve_python_relative_import() {
    let resolved = resolve_relative_import("pkg/mod.py", ".sibling").unwrap();
    assert_eq!(resolved, "pkg/sibling");
  }

  #[test]
  fn resolve_js_relative_import() {
    let resolved = resolve_relative_import("src/a.ts", "../b/helper.ts").unwrap();
    assert_eq!(resolved, "b/helper");
  }

  #[test]
  fn bare_module_name_is_not_relative() {
    assert!(resolve_relative_import("src/a.ts", "lodash").is_none());
  }

  #[test]
  fn validate_project_name_rejects_traversal() {
    assert!(!validate_project_name("../evil"));
    assert!(validate_project_name("my-project_1.0"));
  }

  #[test]
  fn project_name_collapses_unsafe_chars() {
    let name = project_name_from_path("/home/user/my project/src");
    assert!(!name.contains(' '));
    assert!(validate_project_name(&name));
  }

  #[test]
  fn folder_fqn_joins_segments() {
    assert_eq!(folder_fqn("proj", "src/api"), "proj.src.api");
  }

  #[test]
  fn root_path_maps_to_root_name() {
    assert_eq!(project_name_from_path("/"), "root");
  }

  #[test]
  fn path_component_normalization() {
    let path = Path::new("/tmp/example-repo");
    let _ = project_name_from_path_buf(path);
  }
}
