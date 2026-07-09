use serde::{Deserialize, Serialize};
use std::{
  collections::{HashMap, HashSet},
  env,
  fmt::Write as _,
  fs::{create_dir_all, read_dir, read_to_string, write},
  path::{Path, PathBuf},
};

// {
//     "name": "typst",
//     "enum": "TYPST",
//     "display": "Typst",
//     "ts_func": "tree_sitter_typst",
//     "repo": "https://github.com/uben0/tree-sitter-typst",
//     "subdir": "",
//     "extensions": [".typ"],
//     "filenames": [],
//     "has_scanner": true,
//     "module_root": "source_file",
//     "node_types": "src/node-types.json"
//   },

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
  println!("cargo::rustc-check-cfg=cfg(cbm_native)");

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

  let mut c_config = cc::Build::new();
  c_config
    .flag_if_supported("-Wno-unused-parameter")
    .flag_if_supported("-Wno-unused-but-set-variable")
    .flag_if_supported("-Wno-trigraphs");
  #[cfg(target_env = "msvc")]
  c_config.flag("-utf-8");

  let grammars_path = PathBuf::from("grammars");
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
    if parser_path.exists() {
      c_config.file(&parser_path);
      println!("cargo:rerun-if-changed={}", parser_path.display());

      let scanner_path = grammar_dir.join("scanner.c");
      if scanner_path.exists() {
        c_config.file(&scanner_path);
        println!("cargo:rerun-if-changed={}", scanner_path.display());
      }
    }

    let queries_dir = grammar_dir.join("queries");
    let queries = if queries_dir.exists() { collect_query_paths(&queries_dir) } else { Vec::new() };
    for query_path in &queries {
      println!("cargo:rerun-if-changed={}", query_path.display());
    }

    let grammar_key = grammar_dir
      .file_name()
      .and_then(|name| name.to_str())
      .expect("Grammar directory must have a valid UTF-8 name");
    let grammar = grammars_manifest
      .get(grammar_key)
      .unwrap_or_else(|| panic!("Missing grammar manifest entry for {grammar_key}"));

    let mut node_types_section = String::new();
    if grammar.node_types.as_ref().is_some() {
      let include_path = normalize_include_path(&grammar_dir.join("node-types.json"));
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
        "pub const NODE_TYPES: &'static str = include_str!(\"../../{include_path}\");"
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
        "pub const {const_name}: &'static str = include_str!(\"../../{include_path}\");"
      )
      .expect("Writing to String cannot fail");
    }

    let language_path = languages_path.join(format!("{}.rs", grammar.ts_function));

    let mut language_source = format!(
      r#"//! This crate provides {} language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][{}] function to add the {} language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language({}::language()).expect("Error loading {} grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {{
    unsafe fn {}() -> Language;
}}

/// Get the tree-sitter [Language][{}] for the {} grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {{
    unsafe {{ {}() }}
}}
"#,
      grammar.display_name,
      grammar.ts_function,
      grammar.display_name,
      grammar.ts_function,
      grammar.display_name,
      grammar.ts_function,
      grammar.ts_function,
      grammar.display_name,
      grammar.ts_function,
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
            .set_language(&super::language())
            .expect("Error loading {} language");
    }}
}}
"#,
      grammar.display_name,
    ));

    let result = write(language_path.clone(), language_source);
    if result.is_err() {
      panic!("Failed to write tree_sitter_{}.rs: {}", grammar.name, result.err().unwrap());
    }

    languages_files.push(
      language_path.file_name().expect("Language file must have a valid UTF-8 name").to_owned(),
    );
    c_config.include(&language_path);
    println!("cargo:rerun-if-changed={}", language_path.display());
  }

  let mut language_module = String::new();
  for language_file in {
    languages_files.sort();
    languages_files
  }
  .iter()
  {
    let file_name = language_file.to_string_lossy();

    let grammar_key = file_name.trim_start_matches("tree_sitter_").trim_end_matches(".rs");
    let grammar = grammars_manifest
      .values()
      .find(|g| g.ts_function == file_name.trim_end_matches(".rs"))
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
    writeln!(
      language_module,
      "pub mod {};",
      language_file.to_string_lossy().trim_end_matches(".rs")
    )
    .expect("Writing to String cannot fail");
  }

  let languages_module_path = languages_path.join("mod.rs");
  let result = write(languages_module_path.clone(), language_module);
  if result.is_err() {
    panic!("Failed to write tree_sitter mod.rs: {}", result.err().unwrap());
  }

  c_config.include(&languages_module_path);
  println!("cargo:rerun-if-changed={}", languages_module_path.to_string_lossy());

  let mut language_enum = r#"/// Source language for extraction.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Language {
    #[default]
    Unknown,
"#
  .to_string();
  let mut sorted_grammars = grammars_manifest.values().collect::<Vec<_>>();
  sorted_grammars.sort_by(|a, b| a.pascal_name.cmp(&b.pascal_name));
  sorted_grammars.iter().for_each(|grammar| {
    writeln!(language_enum, "    {},", grammar.pascal_name).expect("Writing to String cannot fail");
  });
  language_enum.push_str("}\n");

  language_enum.push_str(
    "\nimpl From<&str> for Language {\n    fn from(file_path: &str) -> Self {\n        let path = std::path::Path::new(file_path);\n\n        if let Some(file_name) = path.file_name().and_then(|name| name.to_str()) {\n            let lowered_file_name = file_name.to_ascii_lowercase();\n            match lowered_file_name.as_str() {\n",
  );

  let mut seen_filenames = HashSet::new();
  sorted_grammars.iter().for_each(|grammar| {
    grammar.filenames.iter().filter(|filename| !filename.contains('*')).for_each(|filename| {
      let normalized_filename = filename.to_ascii_lowercase();
      if !seen_filenames.insert(normalized_filename.clone()) {
        return;
      }
      let escaped_filename = escape_rust_string(&normalized_filename);
      writeln!(
        language_enum,
        "                \"{escaped_filename}\" => return Self::{},",
        grammar.pascal_name
      )
      .expect("Writing to String cannot fail");
    });
  });

  language_enum.push_str(
    "                _ => {}\n            }\n        }\n\n        let lowered_file_path = file_path.to_ascii_lowercase();\n\n",
  );

  let mut seen_globs = HashSet::new();
  sorted_grammars.iter().for_each(|grammar| {
    grammar.filenames.iter().filter(|filename| filename.contains('*')).for_each(|glob| {
      let normalized_glob = glob.to_ascii_lowercase();
      if !seen_globs.insert(normalized_glob.clone()) {
        return;
      }
      let escaped_glob = escape_rust_string(&normalized_glob);
      writeln!(
        language_enum,
        "        if glob::Pattern::new(\"{escaped_glob}\").unwrap().matches(&lowered_file_path) {{ return Self::{}; }}",
        grammar.pascal_name
      )
      .expect("Writing to String cannot fail");
    });
  });

  language_enum.push_str("\n");

  let mut seen_extensions = HashSet::new();
  sorted_grammars.iter().for_each(|grammar| {
    grammar.extensions.iter().for_each(|extension| {
      if let Some(normalized_extension) = normalized_extension(extension) {
        if !seen_extensions.insert(normalized_extension.clone()) {
          return;
        }
        writeln!(
          language_enum,
          "        if lowered_file_path.ends_with(\"{}\") {{ return Self::{}; }}",
          escape_rust_string(&normalized_extension),
          grammar.pascal_name,
        )
        .expect("Writing to String cannot fail");
      }
    });
  });

  language_enum.push_str(
    "\n        Self::Unknown\n    }\n}\n\nimpl From<&String> for Language {\n    fn from(file_path: &String) -> Self {\n        Self::from(file_path.as_str())\n    }\n}\n\nimpl From<&std::path::Path> for Language {\n    fn from(file_path: &std::path::Path) -> Self {\n        Self::from(file_path.to_string_lossy().as_ref())\n    }\n}\n\nimpl From<std::path::PathBuf> for Language {\n    fn from(file_path: std::path::PathBuf) -> Self {\n        Self::from(file_path.as_path())\n    }\n}\n",
  );

  let result = write(src_path.join("types/language.rs"), language_enum);
  if result.is_err() {
    panic!("Failed to write types/language.rs: {}", result.err().unwrap());
  }

  // let bindings = bindgen::Builder::default()
  //     .header(ffi.join("bindings.h").to_string_lossy())
  //     .clang_arg(format!("-I{}", vendored.display()))
  //     .clang_arg(format!(
  //         "-I{}",
  //         vendored.join("ts_runtime/include").display()
  //     ))
  //     .clang_arg("-DCBM_BIND_TS_ALLOCATOR=0")
  //     .allowlist_function("cbm_.*")
  //     .allowlist_type("CBM.*")
  //     .allowlist_var("CBM_.*")
  //     .default_enum_style(bindgen::EnumVariation::ModuleConsts)
  //     .allowlist_type("TSTree")
  //     .allowlist_type("TSNode")
  //     .opaque_type("TSTree")
  //     .opaque_type("TSNode")
  //     .opaque_type("CBMExtractCtx")
  //     .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
  //     .generate()
  //     .expect("cbm bindgen failed");

  // let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
  // bindings
  //     .write_to_file(out_dir.join("bindings.rs"))
  //     .expect("write cbm bindings.rs failed");
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
