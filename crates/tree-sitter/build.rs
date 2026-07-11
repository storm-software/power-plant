use serde::{Deserialize, Serialize};
use std::{
  collections::{HashMap, HashSet},
  env,
  fmt::Write as _,
  fs::{create_dir_all, read_dir, read_to_string, remove_file, write},
  path::{Path, PathBuf},
};

#[derive(Serialize, Deserialize, Debug)]
struct Grammar {
  name: String,
  enum_name: String,
  display_name: String,
  pascal_name: String,
  ts_function: String,
  repository: String,
  sub_directory: String,
  extensions: Vec<String>,
  filenames: Vec<String>,
  has_scanner: bool,
  module_root: String,
  node_types: Option<String>,
  queries: Option<String>,
}

fn main() {
  let crate_path = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
  let src_path = crate_path.join("src");

  let mut workspace_path = crate_path.clone();
  while !workspace_path.join(".git").exists()
    && !workspace_path.join(".github").exists()
    && workspace_path.parent().is_some()
  {
    workspace_path = workspace_path.parent().unwrap().to_path_buf();
  }

  let grammars_json_path = workspace_path.join("tools/tree-sitter/grammars.json");
  println!("cargo:rerun-if-changed={}", grammars_json_path.display());

  let grammars_json = read_to_string(&grammars_json_path).unwrap();

  let grammars_manifest = serde_json::from_str::<HashMap<String, Grammar>>(&grammars_json)
    .expect("Failed to parse grammars.json");

  let mut languages_files = Vec::new();
  let mut compiled_grammars: Vec<&Grammar> = Vec::new();

  let grammars_path = PathBuf::from("grammars");
  println!("cargo:rerun-if-changed={}", grammars_path.display());
  let languages_path = src_path.join("languages");
  create_dir_all(&languages_path).expect("Must be able to create generated languages directory");

  // Iterate over all immediate directories in the grammars directory
  for grammar_path in {
    let mut paths = grammars_path
      .read_dir()
      .expect("Must be able to read grammars directory")
      .filter_map(Result::ok)
      .collect::<Vec<_>>();
    paths.sort_by_key(|entry| entry.path());
    paths
  }
  .iter()
  {
    let grammar_dir = grammar_path.path();
    if !grammar_dir.is_dir() {
      continue;
    }

    let parser_path = grammar_dir.join("parser.c");
    if !parser_path.exists() {
      continue;
    }

    let grammar_key = grammar_dir
      .file_name()
      .and_then(|name| name.to_str())
      .expect("Grammar directory must have a valid UTF-8 name");
    let grammar = grammars_manifest
      .get(grammar_key)
      .unwrap_or_else(|| panic!("Missing grammar manifest entry for {grammar_key}"));

    // Compile each grammar as its own static library so `#include "tree_sitter/parser.h"`
    // resolves to that grammar's vendored headers (ABI versions differ across grammars).
    let mut c_config = cc::Build::new();
    c_config
      .std("c11")
      .include(&grammar_dir)
      .flag_if_supported("-Wno-unused-parameter")
      .flag_if_supported("-Wno-unused-but-set-variable")
      .flag_if_supported("-Wno-trigraphs")
      .flag_if_supported("-Wno-unused-variable")
      .flag_if_supported("-Wno-unused-function");
    #[cfg(target_env = "msvc")]
    c_config.flag("-utf-8");

    c_config.file(&parser_path);
    println!("cargo:rerun-if-changed={}", parser_path.display());

    let scanner_path = grammar_dir.join("scanner.c");
    let has_scanner = scanner_path.is_file();
    if has_scanner != grammar.has_scanner {
      println!(
        "cargo:warning=grammar {grammar_key}: manifest has_scanner={} but scanner.c {}",
        grammar.has_scanner,
        if has_scanner { "exists" } else { "is missing" }
      );
    }
    if has_scanner {
      c_config.file(&scanner_path);
      println!("cargo:rerun-if-changed={}", scanner_path.display());
    }

    c_config.compile(&format!("tree-sitter-{grammar_key}"));

    let queries_dir = grammar_dir.join("queries");
    let queries = if queries_dir.exists() { collect_query_paths(&queries_dir) } else { Vec::new() };
    for query_path in &queries {
      println!("cargo:rerun-if-changed={}", query_path.display());
    }

    let ts_c_function = discover_language_symbol(&parser_path)
      .unwrap_or_else(|| grammar.ts_function.clone());
    if ts_c_function != grammar.ts_function {
      println!(
        "cargo:warning=grammar {grammar_key}: manifest ts_function={} but parser.c defines {}",
        grammar.ts_function, ts_c_function
      );
    }

    let node_types_path = grammar_dir.join("node-types.json");
    let mut node_types_section = String::new();
    if grammar.node_types.as_ref().is_some() || node_types_path.is_file() {
      let include_path = normalize_include_path(&node_types_path);
      writeln!(
        node_types_section,
        "/// The content of the [`node-types.json`][] file for this grammar."
      )
      .expect("Writing to String cannot fail");
      writeln!(node_types_section, "///").expect("Writing to String cannot fail");
      writeln!(
        node_types_section,
        "/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types"
      )
      .expect("Writing to String cannot fail");
      writeln!(
        node_types_section,
        "pub const NODE_TYPES: &str = include_str!(\"../../{include_path}\");"
      )
      .expect("Writing to String cannot fail");
    }

    let mut query_constants = String::new();
    for query_path in &queries {
      let relative_query_path = query_path
        .strip_prefix(&queries_dir)
        .expect("Query path must be within the grammar queries directory");
      let const_name = query_constant_name(relative_query_path);
      let include_path = normalize_include_path(query_path);

      writeln!(
        query_constants,
        "pub const {const_name}: &str = include_str!(\"../../{include_path}\");"
      )
      .expect("Writing to String cannot fail");
    }

    let language_path = languages_path.join(format!("{}.rs", grammar.ts_function));

    let mut language_source = format!(
      r#"//! {display} language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add the {display} language to a
//! tree-sitter [`Parser`][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser
//!     .set_language(&{module}::LANGUAGE.into())
//!     .expect("Error loading {display} grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {{
    fn {ts_c_fn}() -> *const ();
}}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe {{ LanguageFn::from_raw({ts_c_fn}) }};
"#,
      display = grammar.display_name,
      module = grammar.ts_function,
      ts_c_fn = ts_c_function,
    );

    if !node_types_section.is_empty() {
      language_source.push('\n');
      language_source.push_str(&node_types_section);
    }

    if !query_constants.is_empty() {
      language_source.push('\n');
      language_source.push_str(&query_constants);
    }

    language_source.push_str(&format!(
      r#"
#[cfg(test)]
mod tests {{
    #[test]
    fn test_can_load_grammar() {{
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading {} language");
    }}
}}
"#,
      grammar.display_name,
    ));

    write_if_changed(&language_path, &language_source);

    languages_files.push(
      language_path.file_name().expect("Language file must have a valid UTF-8 name").to_owned(),
    );
    compiled_grammars.push(grammar);
  }

  let mut language_module = String::new();
  languages_files.sort();
  for language_file in &languages_files {
    let file_name = language_file.to_string_lossy();
    let module_name = file_name.trim_end_matches(".rs");

    let grammar_key = file_name.trim_start_matches("tree_sitter_").trim_end_matches(".rs");
    let grammar = grammars_manifest
      .values()
      .find(|g| g.ts_function == module_name)
      .unwrap_or_else(|| {
        grammars_manifest
          .get(grammar_key)
          .unwrap_or_else(|| panic!("Missing grammar manifest entry for {grammar_key}"))
      });

    writeln!(
      language_module,
      "/// {} language support for the [tree-sitter][] parsing library.",
      grammar.display_name
    )
    .expect("Writing to String cannot fail");
    writeln!(language_module, "pub mod {module_name};").expect("Writing to String cannot fail");
  }

  let languages_module_path = languages_path.join("mod.rs");
  write_if_changed(&languages_module_path, &language_module);

  cleanup_stale_language_modules(&languages_path, &languages_files);

  write_language_enum(&src_path, &grammars_manifest, &compiled_grammars);
  write_lang_specs(&src_path, &grammars_manifest);
}

fn write_language_enum(
  src_path: &Path,
  grammars_manifest: &HashMap<String, Grammar>,
  compiled_grammars: &[&Grammar],
) {
  let mut language_enum = r#"use tree_sitter_language::LanguageFn;

use crate::languages;

/// Source language for extraction.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub enum Language {
    #[default]
    Unknown,
"#
  .to_string();

  let mut sorted_grammars = grammars_manifest.values().collect::<Vec<_>>();
  sorted_grammars.sort_by(|a, b| a.pascal_name.cmp(&b.pascal_name));
  for grammar in &sorted_grammars {
    writeln!(language_enum, "    {},", grammar.pascal_name).expect("Writing to String cannot fail");
  }
  language_enum.push_str("}\n");

  language_enum.push_str(
    "\nimpl From<&str> for Language {\n    fn from(file_path: &str) -> Self {\n        let path = std::path::Path::new(file_path);\n\n        if let Some(file_name) = path.file_name().and_then(|name| name.to_str()) {\n            let lowered_file_name = file_name.to_ascii_lowercase();\n            match lowered_file_name.as_str() {\n",
  );

  let mut seen_filenames = HashSet::new();
  for grammar in &sorted_grammars {
    for filename in grammar.filenames.iter().filter(|filename| !filename.contains('*')) {
      let normalized_filename = filename.to_ascii_lowercase();
      if !seen_filenames.insert(normalized_filename.clone()) {
        continue;
      }
      let escaped_filename = escape_rust_string(&normalized_filename);
      writeln!(
        language_enum,
        "                \"{escaped_filename}\" => return Self::{},",
        grammar.pascal_name
      )
      .expect("Writing to String cannot fail");
    }
  }

  language_enum.push_str(
    "                _ => {}\n            }\n        }\n\n        let lowered_file_path = file_path.to_ascii_lowercase();\n\n",
  );

  let mut seen_globs = HashSet::new();
  for grammar in &sorted_grammars {
    for glob in grammar.filenames.iter().filter(|filename| filename.contains('*')) {
      let normalized_glob = glob.to_ascii_lowercase();
      if !seen_globs.insert(normalized_glob.clone()) {
        continue;
      }
      let escaped_glob = escape_rust_string(&normalized_glob);
      writeln!(
        language_enum,
        "        if glob::Pattern::new(\"{escaped_glob}\").unwrap().matches(&lowered_file_path) {{ return Self::{}; }}",
        grammar.pascal_name
      )
      .expect("Writing to String cannot fail");
    }
  }

  language_enum.push_str("\n");

  let mut extension_entries = Vec::new();
  let mut seen_extensions = HashSet::new();
  for grammar in &sorted_grammars {
    for extension in &grammar.extensions {
      if let Some(normalized_extension) = normalized_extension(extension) {
        if seen_extensions.insert(normalized_extension.clone()) {
          extension_entries.push((
            normalized_extension,
            grammar.pascal_name.clone(),
            grammar.display_name.clone(),
          ));
        }
      }
    }
  }
  extension_entries.sort_by(|a, b| b.0.len().cmp(&a.0.len()).then_with(|| a.0.cmp(&b.0)));
  for (normalized_extension, pascal_name, display_name) in &extension_entries {
    writeln!(
      language_enum,
      "        // {display_name}\n        if lowered_file_path.ends_with(\"{}\") {{ return Self::{pascal_name}; }}",
      escape_rust_string(normalized_extension),
    )
    .expect("Writing to String cannot fail");
  }

  language_enum.push_str(
    "\n        Self::Unknown\n    }\n}\n\nimpl From<&String> for Language {\n    fn from(file_path: &String) -> Self {\n        Self::from(file_path.as_str())\n    }\n}\n\nimpl From<&std::path::Path> for Language {\n    fn from(file_path: &std::path::Path) -> Self {\n        Self::from(file_path.to_string_lossy().as_ref())\n    }\n}\n\nimpl From<std::path::PathBuf> for Language {\n    fn from(file_path: std::path::PathBuf) -> Self {\n        Self::from(file_path.as_path())\n    }\n}\n",
  );

  // Map Language enum → LanguageFn for compiled grammars only.
  let mut compiled_by_pascal: HashMap<&str, &Grammar> = HashMap::new();
  for grammar in compiled_grammars {
    compiled_by_pascal.insert(grammar.pascal_name.as_str(), grammar);
  }

  language_enum.push_str(
    r#"
impl Language {
    /// Returns the tree-sitter [`LanguageFn`] for this source language, if a
    /// grammar was compiled into this crate.
    ///
    /// [`LanguageFn`] is a zero-cost function pointer to the grammar's static
    /// `TSLanguage`; convert with [`tree_sitter::Language::from`] when loading
    /// a [`tree_sitter::Parser`].
    #[must_use]
    pub const fn language_fn(self) -> Option<LanguageFn> {
        match self {
"#,
  );

  for grammar in &sorted_grammars {
    if compiled_by_pascal.contains_key(grammar.pascal_name.as_str()) {
      writeln!(
        language_enum,
        "            Self::{} => Some(languages::{}::LANGUAGE),",
        grammar.pascal_name, grammar.ts_function
      )
      .expect("Writing to String cannot fail");
    }
  }

  language_enum.push_str(
    r#"            Self::Unknown => None,
        }
    }

    /// Human-readable language label (e.g. `"TypeScript"`).
    #[must_use]
    pub const fn display_name(self) -> &'static str {
        match self {
"#,
  );

  for grammar in &sorted_grammars {
    writeln!(
      language_enum,
      "            Self::{} => \"{}\",",
      grammar.pascal_name,
      escape_rust_string(&grammar.display_name),
    )
    .expect("Writing to String cannot fail");
  }
  language_enum.push_str(
    r#"            Self::Unknown => "Unknown",
        }
    }

    /// Stable enum identifier from the grammar manifest (e.g. `"TYPESCRIPT"`).
    #[must_use]
    pub const fn enum_name(self) -> &'static str {
        match self {
"#,
  );

  for grammar in &sorted_grammars {
    writeln!(
      language_enum,
      "            Self::{} => \"{}\",",
      grammar.pascal_name,
      escape_rust_string(&grammar.enum_name),
    )
    .expect("Writing to String cannot fail");
  }

  language_enum.push_str(
    r#"            Self::Unknown => "UNKNOWN",
        }
    }

    /// Root tree-sitter node kind for this language's translation unit.
    #[must_use]
    pub const fn module_root(self) -> &'static str {
        match self {
"#,
  );

  for grammar in &sorted_grammars {
    writeln!(
      language_enum,
      "            Self::{} => \"{}\",",
      grammar.pascal_name,
      escape_rust_string(&grammar.module_root),
    )
    .expect("Writing to String cannot fail");
  }

  language_enum.push_str(
    r#"            Self::Unknown => "",
        }
    }

    /// Build a [`tree_sitter::Language`] handle for this source language.
    ///
    /// Prefer [`crate::parser::LanguageParser`] when parsing many files so the
    /// underlying [`tree_sitter::Parser`] and language assignment are reused.
    #[must_use]
    pub fn tree_sitter_language(self) -> Option<tree_sitter::Language> {
        self.language_fn().map(tree_sitter::Language::from)
    }
}

impl std::fmt::Display for Language {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.display_name())
    }
}
"#,
  );

  write_if_changed(&src_path.join("types/language.rs"), &language_enum);
}

/// Generate lang-spec boilerplate from `grammars.json`.
///
/// Mirrors `generate_specs` in
/// https://github.com/DeusData/codebase-memory-mcp/blob/main/scripts/generate-lang-code.py:
/// module-root arrays plus empty node-kind specs keyed by [`Language`].
fn write_lang_specs(src_path: &Path, grammars_manifest: &HashMap<String, Grammar>) {
  let mut sorted_grammars = grammars_manifest.values().collect::<Vec<_>>();
  sorted_grammars.sort_by(|a, b| a.pascal_name.cmp(&b.pascal_name));

  let mut source = String::from(
    r#"//! Generated lang-spec tables from `tools/tree-sitter/grammars.json`.
//!
//! Equivalent to `generate_specs` in upstream `generate-lang-code.py`:
//! - per-language module-root node-kind arrays
//! - boilerplate [`LangSpec`] rows with empty extraction kinds
//!
//! Hand-tuned node-kind tables live in [`crate::lang_spec`]; that module
//! overlays curated kinds on top of [`modules_for`].

use crate::Language;
use crate::lang_spec::LangSpec;

const EMPTY: &[&str] = &[];

"#,
  );

  // Module type arrays (paste-equivalent of `{name}_module_types` in lang_specs.c).
  for grammar in &sorted_grammars {
    let const_name = module_types_const_name(&grammar.name);
    let module_root = escape_rust_string(&grammar.module_root);
    writeln!(
      source,
      "/// Module / translation-unit node kinds for {}.",
      grammar.display_name
    )
    .expect("Writing to String cannot fail");
    writeln!(
      source,
      "pub(crate) const {const_name}: &[&str] = &[\"{module_root}\"];"
    )
    .expect("Writing to String cannot fail");
  }

  source.push_str(
    r#"
/// Root AST node kinds for `language` (empty for [`Language::Unknown`]).
#[must_use]
pub const fn modules_for(language: Language) -> &'static [&'static str] {
    match language {
"#,
  );

  for grammar in &sorted_grammars {
    let const_name = module_types_const_name(&grammar.name);
    writeln!(
      source,
      "        Language::{} => {const_name},",
      grammar.pascal_name
    )
    .expect("Writing to String cannot fail");
  }

  source.push_str(
    r#"        Language::Unknown => EMPTY,
    }
}

/// Boilerplate lang spec: empty extraction kinds + manifest `module_root`.
///
/// Matches upstream `generate_specs` table rows that fill only module types
/// and the tree-sitter factory (factory is [`Language::language_fn`] here).
#[must_use]
pub const fn manifest_lang_spec(language: Language) -> LangSpec {
    LangSpec {
        functions: EMPTY,
        classes: EMPTY,
        calls: EMPTY,
        imports: EMPTY,
        import_from: EMPTY,
        branches: EMPTY,
        modules: modules_for(language),
    }
}
"#,
  );

  write_if_changed(&src_path.join("lang_spec_gen.rs"), &source);
}

fn module_types_const_name(grammar_name: &str) -> String {
  let mut name = grammar_name.to_ascii_uppercase();
  name.push_str("_MODULE_TYPES");
  name
}

fn cleanup_stale_language_modules(languages_path: &Path, active_files: &[std::ffi::OsString]) {
  let active: HashSet<&str> =
    active_files.iter().filter_map(|name| name.to_str()).collect();

  let entries = read_dir(languages_path).expect("Must be able to read languages directory");
  for entry in entries.filter_map(Result::ok) {
    let path = entry.path();
    if path.extension().is_none_or(|ext| ext != "rs") {
      continue;
    }
    let file_name = entry.file_name();
    if file_name == "mod.rs" {
      continue;
    }
    if file_name.to_str().is_some_and(|name| active.contains(name)) {
      continue;
    }
    remove_file(&path).unwrap_or_else(|err| {
      panic!("Failed to remove stale language module {}: {err}", path.display());
    });
  }
}

fn discover_language_symbol(parser_path: &Path) -> Option<String> {
  let contents = read_to_string(parser_path).ok()?;
  let mut last = None;
  for line in contents.lines().rev() {
    let trimmed = line.trim();
    if !trimmed.contains("TSLanguage") || !trimmed.contains("tree_sitter_") {
      continue;
    }
    if let Some(name) = extract_tree_sitter_symbol(trimmed) {
      last = Some(name);
      break;
    }
  }
  last
}

fn extract_tree_sitter_symbol(line: &str) -> Option<String> {
  let start = line.find("tree_sitter_")?;
  let rest = &line[start..];
  let end = rest.find('(')?;
  let name = &rest[..end];
  if name.chars().all(|ch| ch.is_ascii_alphanumeric() || ch == '_') {
    Some(name.to_owned())
  } else {
    None
  }
}

fn write_if_changed(path: &Path, contents: &str) {
  let existing = read_to_string(path).ok();
  if existing.as_deref() == Some(contents) {
    return;
  }
  write(path, contents).unwrap_or_else(|err| {
    panic!("Failed to write {}: {err}", path.display());
  });
}

fn collect_query_paths(queries_dir: &Path) -> Vec<PathBuf> {
  let mut query_paths = Vec::new();

  for entry in read_dir(queries_dir).expect("Must be able to read grammar queries directory") {
    let entry = entry.expect("Must be able to read query directory entry");
    let entry_path = entry.path();

    if entry_path.is_dir() {
      query_paths.extend(collect_query_paths(&entry_path));
      continue;
    }

    if entry_path.extension().is_some_and(|ext| ext == "scm") {
      query_paths.push(entry_path);
    }
  }

  query_paths.sort();
  query_paths
}

fn normalize_include_path(path: &Path) -> String {
  path.to_string_lossy().replace('\\', "/")
}

fn escape_rust_string(value: &str) -> String {
  value.replace('\\', "\\\\").replace('"', "\\\"")
}

fn normalized_extension(extension: &str) -> Option<String> {
  let trimmed = extension.trim();
  if trimmed.is_empty() {
    return None;
  }

  if trimmed.starts_with('.') {
    Some(trimmed.to_ascii_lowercase())
  } else {
    Some(format!(".{}", trimmed.to_ascii_lowercase()))
  }
}

fn query_constant_name(relative_query_path: &Path) -> String {
  let mut constant = String::new();
  let mut last_was_separator = false;

  for ch in relative_query_path.to_string_lossy().chars() {
    match ch {
      'a'..='z' | 'A'..='Z' | '0'..='9' => {
        constant.push(ch.to_ascii_uppercase());
        last_was_separator = false;
      }
      _ => {
        if !last_was_separator {
          constant.push('_');
          last_was_separator = true;
        }
      }
    }
  }

  while constant.ends_with('_') {
    constant.pop();
  }

  constant.push_str("_QUERY");
  constant
}
