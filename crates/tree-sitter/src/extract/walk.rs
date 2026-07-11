//! AST walk that turns a parsed tree into [`FileResult`].

use tree_sitter::{Node, Tree};

use crate::Language;
use crate::fqn::{compute_fqn, module_dir_fqn};
use crate::lang_spec::{self, LangSpec, class_label_for_kind, kind_in};

use super::{CallSite, Definition, FileResult, ImplTrait, Import, Usage, module_is_dir};

const MAX_NODES: usize = 5_000_000;

#[derive(Clone, Copy)]
enum ScopeKind {
  Func,
  Class,
}

struct Scope {
  kind: ScopeKind,
  depth: u32,
  qn: String,
}

struct WalkState {
  scopes: Vec<Scope>,
  enclosing_func_qn: String,
  enclosing_class_qn: Option<String>,
}

impl WalkState {
  fn new(module_qn: &str) -> Self {
    Self { scopes: Vec::new(), enclosing_func_qn: module_qn.to_string(), enclosing_class_qn: None }
  }

  fn pop_expired(&mut self, depth: u32) {
    while self.scopes.last().is_some_and(|s| s.depth >= depth) {
      self.scopes.pop();
    }
  }

  fn recompute(&mut self, module_qn: &str) {
    self.enclosing_func_qn = module_qn.to_string();
    self.enclosing_class_qn = None;
    for scope in &self.scopes {
      match scope.kind {
        ScopeKind::Func => self.enclosing_func_qn = scope.qn.clone(),
        ScopeKind::Class => self.enclosing_class_qn = Some(scope.qn.clone()),
      }
    }
  }
}

/// Extract definitions, imports, and calls from a parsed tree.
pub fn extract_from_tree(
  tree: &Tree,
  source: &[u8],
  language: Language,
  project: &str,
  rel_path: &str,
) -> FileResult {
  let mut result = FileResult::default();
  let root = tree.root_node();
  let module_qn = module_dir_fqn(project, rel_path, module_is_dir(language));
  let is_test = is_test_file(rel_path, language);
  let spec = lang_spec::lang_spec(language);

  result.defs.push(Definition {
    name: rel_path.to_string(),
    qualified_name: module_qn.clone(),
    label: "Module".to_string(),
    file_path: Some(rel_path.to_string()),
    start_line: 1,
    end_line: root.end_position().row as u32 + 1,
    is_exported: true,
    is_test,
    ..Definition::default()
  });

  let mut state = WalkState::new(&module_qn);
  let mut cursor = root.walk();
  let mut depth = 0u32;
  let mut visited = 0usize;

  loop {
    if visited >= MAX_NODES {
      result.has_error = true;
      result.error_msg = Some("extract budget exceeded".into());
      break;
    }
    visited += 1;

    let node = cursor.node();
    state.pop_expired(depth);
    state.recompute(&module_qn);

    if node.is_named() {
      extract_definition(
        &mut result,
        node,
        source,
        language,
        project,
        rel_path,
        &spec,
        &state,
        is_test,
      );
      extract_import(&mut result, node, source, language, &spec);
      extract_call(&mut result, node, source, &spec, &state);
      extract_impl_trait(&mut result, node, source, language, project, rel_path);
      push_scopes(&mut state, node, source, language, project, rel_path, &spec, depth);
    }

    if cursor.goto_first_child() {
      depth += 1;
      continue;
    }
    if cursor.goto_next_sibling() {
      continue;
    }
    let mut found = false;
    while cursor.goto_parent() {
      depth = depth.saturating_sub(1);
      if cursor.goto_next_sibling() {
        found = true;
        break;
      }
    }
    if !found {
      break;
    }
  }

  if root.has_error() {
    result.has_error = true;
    if result.error_msg.is_none() {
      result.error_msg = Some("parse tree contains ERROR/MISSING nodes".into());
    }
  }

  let _ = cursor;
  result
}

fn push_scopes(
  state: &mut WalkState,
  node: Node<'_>,
  source: &[u8],
  language: Language,
  project: &str,
  rel_path: &str,
  spec: &LangSpec,
  depth: u32,
) {
  let kind = node.kind();

  if kind_in(kind, spec.functions) {
    if let Some(name) = resolve_func_name(node, source) {
      let qn = match &state.enclosing_class_qn {
        Some(class_qn) => format!("{class_qn}.{name}"),
        None => compute_fqn(project, rel_path, Some(&name)),
      };
      state.scopes.push(Scope { kind: ScopeKind::Func, depth, qn });
    }
    return;
  }

  if kind_in(kind, spec.classes) {
    if let Some(qn) = class_qn(node, source, language, project, rel_path) {
      state.scopes.push(Scope { kind: ScopeKind::Class, depth, qn });
    }
    return;
  }

  if language == Language::Rust && kind == "impl_item" {
    if let Some(type_node) = node.child_by_field_name("type") {
      if let Some(type_name) = node_text(type_node, source) {
        let qn = compute_fqn(project, rel_path, Some(&type_name));
        state.scopes.push(Scope { kind: ScopeKind::Class, depth, qn });
      }
    }
  }
}

fn extract_definition(
  result: &mut FileResult,
  node: Node<'_>,
  source: &[u8],
  language: Language,
  project: &str,
  rel_path: &str,
  spec: &LangSpec,
  state: &WalkState,
  is_test: bool,
) {
  let kind = node.kind();

  if kind_in(kind, spec.functions) {
    let Some(name) = resolve_func_name(node, source) else {
      return;
    };
    // Skip anonymous closures / lambdas without a bindable name.
    if name.is_empty() || name == "|" || name.starts_with('|') {
      return;
    }

    let parent_class = state.enclosing_class_qn.clone();
    let label =
      if parent_class.is_some() || kind.contains("method") || kind == "constructor_declaration" {
        "Method"
      } else {
        "Function"
      };
    let qn = match &parent_class {
      Some(class_qn) => format!("{class_qn}.{name}"),
      None => compute_fqn(project, rel_path, Some(&name)),
    };

    let start_line = node.start_position().row as u32 + 1;
    let end_line = node.end_position().row as u32 + 1;
    let lines = (end_line.saturating_sub(start_line) + 1) as i32;
    let complexity = count_complexity(node, spec);
    let signature = node_text(node, source).map(|s| truncate(&s, 512));
    let is_entry = matches!(name.as_str(), "main" | "Main" | "_start");
    let is_test_fn = is_test || name.starts_with("test_") || name.starts_with("Test");

    result.defs.push(Definition {
      name,
      qualified_name: qn,
      label: label.to_string(),
      file_path: Some(rel_path.to_string()),
      start_line,
      end_line,
      signature,
      parent_class,
      complexity,
      lines,
      is_exported: looks_exported(node, language),
      is_test: is_test_fn,
      is_entry_point: is_entry,
      ..Definition::default()
    });
    return;
  }

  if kind_in(kind, spec.classes) {
    // Rust impl blocks are scopes, not standalone Class nodes (unless bare impl Type).
    if kind == "impl_item" {
      return;
    }
    let Some(name) = resolve_name(node, source) else {
      return;
    };
    let label = class_label_for_kind(kind);

    let label = if kind == "trait_item" { "Trait" } else { label };
    let qn = compute_fqn(project, rel_path, Some(&name));
    let start_line = node.start_position().row as u32 + 1;
    let end_line = node.end_position().row as u32 + 1;

    result.defs.push(Definition {
      name,
      qualified_name: qn,
      label: label.to_string(),
      file_path: Some(rel_path.to_string()),
      start_line,
      end_line,
      lines: (end_line.saturating_sub(start_line) + 1) as i32,
      is_exported: looks_exported(node, language),
      is_test,
      ..Definition::default()
    });
  }
}

fn extract_import(
  result: &mut FileResult,
  node: Node<'_>,
  source: &[u8],
  language: Language,
  spec: &LangSpec,
) {
  let kind = node.kind();
  let is_from = kind_in(kind, spec.import_from);
  let is_import = is_from || kind_in(kind, spec.imports);
  if !is_import {
    return;
  }

  match language {
    Language::Python | Language::Starlark | Language::Mojo => {
      extract_python_import(result, node, source, is_from);
    }
    Language::Rust | Language::Sway | Language::Move => {
      if let Some(path) = rust_use_path(node, source) {
        result.imports.push(Import { module_path: path, local_name: None, namespace: None });
      }
    }
    Language::Go => extract_go_import(result, node, source),
    Language::JavaScript
    | Language::TypeScript
    | Language::Tsx
    | Language::JSDoc
    | Language::Astro
    | Language::Vue
    | Language::Svelte
    | Language::Qml => {
      extract_js_import(result, node, source);
    }
    Language::Java | Language::Kotlin => {
      if let Some(path) = first_string_or_ident_path(node, source) {
        result.imports.push(Import { module_path: path, local_name: None, namespace: None });
      }
    }
    Language::CSharp => {
      if let Some(path) = first_string_or_ident_path(node, source) {
        result.imports.push(Import { module_path: path, local_name: None, namespace: None });
      }
    }
    _ => {
      if let Some(path) = first_string_or_ident_path(node, source) {
        result.imports.push(Import { module_path: path, local_name: None, namespace: None });
      }
    }
  }
}

fn extract_python_import(result: &mut FileResult, node: Node<'_>, source: &[u8], is_from: bool) {
  if is_from {
    let module = node
      .child_by_field_name("module_name")
      .and_then(|n| node_text(n, source))
      .unwrap_or_default();
    let mut saw_name = false;
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
      if child.kind() == "dotted_name" || child.kind() == "aliased_import" {
        let local = node_text(child, source);
        result.imports.push(Import {
          module_path: module.clone(),
          local_name: local,
          namespace: None,
        });
        saw_name = true;
      }
    }
    if !saw_name && !module.is_empty() {
      result.imports.push(Import { module_path: module, local_name: None, namespace: None });
    }
    return;
  }

  let mut cursor = node.walk();
  for child in node.children(&mut cursor) {
    if child.kind() == "dotted_name" || child.kind() == "aliased_import" {
      if let Some(path) = node_text(child, source) {
        let local = path.rsplit('.').next().map(str::to_string);
        result.imports.push(Import { module_path: path, local_name: local, namespace: None });
      }
    }
  }
}

fn extract_go_import(result: &mut FileResult, node: Node<'_>, source: &[u8]) {
  let mut cursor = node.walk();
  for child in node.children(&mut cursor) {
    if child.kind() == "import_spec" || child.kind() == "interpreted_string_literal" {
      if let Some(raw) = node_text(child, source) {
        let path = raw.trim_matches('"').trim_matches('`').to_string();
        if !path.is_empty() {
          let local = path.rsplit('/').next().map(str::to_string);
          result.imports.push(Import { module_path: path, local_name: local, namespace: None });
        }
      }
    }
  }
}

fn extract_js_import(result: &mut FileResult, node: Node<'_>, source: &[u8]) {
  if node.kind() == "export_statement" {
    // Only treat `export ... from "..."` as an import edge.
    let mut has_from = false;
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
      if child.kind() == "string" {
        has_from = true;
        if let Some(raw) = node_text(child, source) {
          let path = strip_quotes(&raw);
          result.imports.push(Import { module_path: path, local_name: None, namespace: None });
        }
      }
    }
    let _ = has_from;
    return;
  }

  if let Some(source_node) = node.child_by_field_name("source") {
    if let Some(raw) = node_text(source_node, source) {
      result.imports.push(Import {
        module_path: strip_quotes(&raw),
        local_name: None,
        namespace: None,
      });
      return;
    }
  }

  // require("...")
  if node.kind() == "call_expression" {
    if let Some(func) = node.child_by_field_name("function") {
      if node_text(func, source).as_deref() == Some("require") {
        if let Some(args) = node.child_by_field_name("arguments") {
          if let Some(path) = first_string_child(args, source) {
            result.imports.push(Import { module_path: path, local_name: None, namespace: None });
          }
        }
      }
    }
  }
}

fn rust_use_path(node: Node<'_>, source: &[u8]) -> Option<String> {
  // Prefer the full use tree text, trimmed.
  let text = node_text(node, source)?;
  let trimmed =
    text.trim().trim_start_matches("use").trim().trim_end_matches(';').trim().replace("::", ".");
  if trimmed.is_empty() {
    return None;
  }
  Some(trimmed)
}

fn extract_call(
  result: &mut FileResult,
  node: Node<'_>,
  source: &[u8],
  spec: &LangSpec,
  state: &WalkState,
) {
  if !kind_in(node.kind(), spec.calls) {
    return;
  }
  let Some(callee) = resolve_callee(node, source) else {
    return;
  };
  if callee.is_empty() {
    return;
  }
  let is_method = callee.contains('.') || node.kind().contains("member");
  let simple = callee.rsplit(['.', ':']).next().unwrap_or(&callee).to_string();

  // Also record type-ish usages when the callee looks like a constructor.
  if node.kind() == "new_expression" || node.kind() == "object_creation_expression" {
    result.usages.push(Usage {
      type_name: simple.clone(),
      enclosing_func_qn: Some(state.enclosing_func_qn.clone()),
    });
  }

  result.calls.push(CallSite {
    callee_name: simple,
    enclosing_func_qn: Some(state.enclosing_func_qn.clone()),
    is_method,
  });
}

fn extract_impl_trait(
  result: &mut FileResult,
  node: Node<'_>,
  source: &[u8],
  language: Language,
  project: &str,
  rel_path: &str,
) {
  if language != Language::Rust || node.kind() != "impl_item" {
    return;
  }
  let Some(trait_node) = node.child_by_field_name("trait") else {
    return;
  };
  let Some(type_node) = node.child_by_field_name("type") else {
    return;
  };
  let Some(trait_name) = node_text(trait_node, source) else {
    return;
  };
  let Some(type_name) = node_text(type_node, source) else {
    return;
  };
  result.impl_traits.push(ImplTrait {
    trait_qn: compute_fqn(project, rel_path, Some(&trait_name)),
    type_qn: compute_fqn(project, rel_path, Some(&type_name)),
  });
}

fn resolve_callee(node: Node<'_>, source: &[u8]) -> Option<String> {
  let target = node
    .child_by_field_name("function")
    .or_else(|| node.child_by_field_name("constructor"))
    .or_else(|| node.child_by_field_name("method"))
    .or_else(|| node.named_child(0))?;
  callee_from_expr(target, source)
}

fn callee_from_expr(node: Node<'_>, source: &[u8]) -> Option<String> {
  match node.kind() {
    "identifier"
    | "field_identifier"
    | "property_identifier"
    | "type_identifier"
    | "constant"
    | "simple_identifier" => node_text(node, source),
    "member_expression" | "field_expression" | "attribute" | "scoped_identifier" => {
      if let Some(prop) = node
        .child_by_field_name("property")
        .or_else(|| node.child_by_field_name("field"))
        .or_else(|| node.child_by_field_name("name"))
      {
        return node_text(prop, source);
      }
      let text = node_text(node, source)?;
      Some(text.rsplit(['.', ':']).next()?.to_string())
    }
    "macro_invocation" => node
      .child_by_field_name("macro")
      .and_then(|n| node_text(n, source))
      .or_else(|| node.named_child(0).and_then(|n| node_text(n, source))),
    _ => find_last_ident(node, source),
  }
}

fn find_last_ident(node: Node<'_>, source: &[u8]) -> Option<String> {
  let mut last = None;
  let mut stack = vec![node];
  while let Some(n) = stack.pop() {
    if matches!(
      n.kind(),
      "identifier"
        | "field_identifier"
        | "property_identifier"
        | "type_identifier"
        | "simple_identifier"
    ) {
      last = node_text(n, source);
    }
    for i in (0..n.named_child_count()).rev() {
      if let Some(child) = n.named_child(i as u32) {
        stack.push(child);
      }
    }
  }
  last
}

fn resolve_func_name(node: Node<'_>, source: &[u8]) -> Option<String> {
  if let Some(name) = node.child_by_field_name("name").and_then(|n| node_text(n, source)) {
    return Some(name);
  }

  // Arrow function bound to a variable: `const foo = () => {}`
  if node.kind() == "arrow_function" {
    if let Some(parent) = node.parent() {
      if parent.kind() == "variable_declarator" {
        return parent.child_by_field_name("name").and_then(|n| node_text(n, source));
      }
    }
  }

  // Kotlin-style: simple_identifier child
  if node.kind() == "function_declaration" {
    return find_child_kind(node, "simple_identifier", source)
      .or_else(|| find_child_kind(node, "identifier", source));
  }

  None
}

fn resolve_name(node: Node<'_>, source: &[u8]) -> Option<String> {
  node
    .child_by_field_name("name")
    .and_then(|n| node_text(n, source))
    .or_else(|| find_child_kind(node, "type_identifier", source))
    .or_else(|| find_child_kind(node, "identifier", source))
    .or_else(|| find_child_kind(node, "simple_identifier", source))
}

fn class_qn(
  node: Node<'_>,
  source: &[u8],
  language: Language,
  project: &str,
  rel_path: &str,
) -> Option<String> {
  if language == Language::Rust && node.kind() == "impl_item" {
    let type_node = node.child_by_field_name("type")?;
    let type_name = node_text(type_node, source)?;
    return Some(compute_fqn(project, rel_path, Some(&type_name)));
  }
  let name = resolve_name(node, source)?;
  Some(compute_fqn(project, rel_path, Some(&name)))
}

fn count_complexity(node: Node<'_>, spec: &LangSpec) -> i32 {
  let mut score = 1i32;
  let mut cursor = node.walk();
  let mut stack = vec![node];
  while let Some(n) = stack.pop() {
    if kind_in(n.kind(), spec.branches) {
      score += 1;
    }
    for i in 0..n.named_child_count() {
      if let Some(child) = n.named_child(i as u32) {
        stack.push(child);
      }
    }
  }
  let _ = cursor;
  score
}

fn looks_exported(node: Node<'_>, language: Language) -> bool {
  match language {
    Language::Rust => {
      // `pub` keyword sibling / child
      let mut cursor = node.walk();
      for child in node.children(&mut cursor) {
        if child.kind() == "visibility_modifier" {
          return true;
        }
      }
      false
    }
    Language::JavaScript | Language::TypeScript | Language::Tsx => {
      node.parent().is_some_and(|p| p.kind() == "export_statement")
    }
    Language::Python => true,
    _ => true,
  }
}

fn is_test_file(rel_path: &str, language: Language) -> bool {
  let lower = rel_path.to_ascii_lowercase();
  if lower.contains("test") || lower.contains("spec") || lower.contains("__tests__") {
    return true;
  }
  match language {
    Language::Go => lower.ends_with("_test.go"),
    Language::Rust => lower.contains("/tests/") || lower.ends_with("_test.rs"),
    Language::Python => lower.starts_with("test_") || lower.ends_with("_test.py"),
    _ => false,
  }
}

fn node_text(node: Node<'_>, source: &[u8]) -> Option<String> {
  node.utf8_text(source).ok().map(|s| s.to_string())
}

fn find_child_kind(node: Node<'_>, kind: &str, source: &[u8]) -> Option<String> {
  let mut cursor = node.walk();
  for child in node.named_children(&mut cursor) {
    if child.kind() == kind {
      return node_text(child, source);
    }
  }
  None
}

fn first_string_or_ident_path(node: Node<'_>, source: &[u8]) -> Option<String> {
  if let Some(s) = first_string_child(node, source) {
    return Some(s);
  }
  let mut cursor = node.walk();
  for child in node.named_children(&mut cursor) {
    if matches!(
      child.kind(),
      "identifier"
        | "dotted_name"
        | "scoped_identifier"
        | "type_identifier"
        | "namespace_name"
        | "qualified_name"
    ) {
      if let Some(t) = node_text(child, source) {
        return Some(t.replace("::", "."));
      }
    }
  }
  None
}

fn first_string_child(node: Node<'_>, source: &[u8]) -> Option<String> {
  let mut cursor = node.walk();
  for child in node.named_children(&mut cursor) {
    if child.kind() == "string"
      || child.kind() == "string_literal"
      || child.kind() == "interpreted_string_literal"
    {
      return node_text(child, source).map(|s| strip_quotes(&s));
    }
  }
  None
}

fn strip_quotes(s: &str) -> String {
  s.trim_matches(|c| c == '"' || c == '\'' || c == '`').to_string()
}

fn truncate(s: &str, max: usize) -> String {
  if s.len() <= max { s.to_string() } else { format!("{}…", &s[..max]) }
}
