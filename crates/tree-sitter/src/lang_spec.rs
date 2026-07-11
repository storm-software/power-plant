//! Per-language AST node-kind tables.
//!
//! Specs drive definition / import / call extraction. Languages without an
//! explicit row fall back to [`GENERIC`], which matches common tree-sitter
//! naming conventions across many grammars.
//!
//! Module-root node kinds are generated from `grammars.json` into
//! [`crate::lang_spec_gen`] (see upstream `generate_specs`).

use crate::Language;
use crate::lang_spec_gen::modules_for;

/// Node-kind sets used while walking a parsed tree.
#[derive(Debug, Clone, Copy)]
pub struct LangSpec {
  pub functions: &'static [&'static str],
  pub classes: &'static [&'static str],
  pub calls: &'static [&'static str],
  pub imports: &'static [&'static str],
  pub import_from: &'static [&'static str],
  pub branches: &'static [&'static str],
  /// Translation-unit / module root node kinds from the grammar manifest.
  pub modules: &'static [&'static str],
}

const EMPTY: &[&str] = &[];

const GENERIC: LangSpec = LangSpec {
  functions: &[
    "function_definition",
    "function_declaration",
    "function_item",
    "method_definition",
    "method_declaration",
    "arrow_function",
  ],
  classes: &[
    "class_definition",
    "class_declaration",
    "struct_item",
    "enum_item",
    "interface_declaration",
    "trait_item",
    "type_item",
  ],
  calls: &["call", "call_expression", "new_expression"],
  imports: &["import_statement", "import_declaration", "use_declaration", "import"],
  import_from: &["import_from_statement"],
  branches: &[
    "if_statement",
    "if_expression",
    "for_statement",
    "for_expression",
    "while_statement",
    "while_expression",
    "match_expression",
    "switch_statement",
    "try_statement",
  ],
  modules: EMPTY,
};

const GO: LangSpec = LangSpec {
  functions: &["function_declaration", "method_declaration", "method_elem", "func_literal"],
  classes: &["type_spec", "type_alias", "type_declaration"],
  calls: &["call_expression"],
  imports: &["import_declaration", "import"],
  import_from: EMPTY,
  branches: &[
    "if_statement",
    "for_statement",
    "expression_switch_statement",
    "type_switch_statement",
    "select_statement",
  ],
  modules: EMPTY,
};

const PYTHON: LangSpec = LangSpec {
  functions: &["function_definition"],
  classes: &["class_definition"],
  calls: &["call"],
  imports: &["import_statement", "import"],
  import_from: &["import_from_statement"],
  branches: &[
    "if_statement",
    "for_statement",
    "while_statement",
    "try_statement",
    "with_statement",
  ],
  modules: EMPTY,
};

const JAVASCRIPT: LangSpec = LangSpec {
  functions: &[
    "function_declaration",
    "generator_function_declaration",
    "function_expression",
    "arrow_function",
    "method_definition",
  ],
  classes: &["class_declaration", "class"],
  calls: &["call_expression", "new_expression"],
  imports: &["import_statement", "import", "export_statement"],
  import_from: EMPTY,
  branches: &[
    "if_statement",
    "for_statement",
    "for_in_statement",
    "while_statement",
    "switch_statement",
    "try_statement",
  ],
  modules: EMPTY,
};

const TYPESCRIPT: LangSpec = LangSpec {
  functions: &[
    "function_declaration",
    "generator_function_declaration",
    "function_expression",
    "arrow_function",
    "method_definition",
    "function_signature",
  ],
  classes: &[
    "class_declaration",
    "class",
    "abstract_class_declaration",
    "enum_declaration",
    "interface_declaration",
    "type_alias_declaration",
  ],
  calls: &["call_expression", "new_expression"],
  imports: &["import_statement", "import", "export_statement"],
  import_from: EMPTY,
  branches: JAVASCRIPT.branches,
  modules: EMPTY,
};

const RUST: LangSpec = LangSpec {
  functions: &["function_item", "function_signature_item", "closure_expression"],
  classes: &["struct_item", "enum_item", "union_item", "trait_item", "type_item", "impl_item"],
  calls: &["call_expression", "macro_invocation"],
  imports: &["use_declaration", "extern_crate_declaration"],
  import_from: &["use_declaration"],
  branches: &[
    "if_expression",
    "for_expression",
    "while_expression",
    "loop_expression",
    "match_expression",
  ],
  modules: EMPTY,
};

const JAVA: LangSpec = LangSpec {
  functions: &["method_declaration", "constructor_declaration", "lambda_expression"],
  classes: &[
    "class_declaration",
    "interface_declaration",
    "enum_declaration",
    "annotation_type_declaration",
    "record_declaration",
  ],
  calls: &["method_invocation", "object_creation_expression"],
  imports: &["import_declaration"],
  import_from: EMPTY,
  branches: &[
    "if_statement",
    "for_statement",
    "while_statement",
    "switch_expression",
    "try_statement",
  ],
  modules: EMPTY,
};

const C_FAMILY: LangSpec = LangSpec {
  functions: &["function_definition", "declaration"],
  classes: &["class_specifier", "struct_specifier", "enum_specifier", "type_definition"],
  calls: &["call_expression"],
  imports: &["preproc_include", "preproc_import"],
  import_from: EMPTY,
  branches: &["if_statement", "for_statement", "while_statement", "switch_statement"],
  modules: EMPTY,
};

const C_SHARP: LangSpec = LangSpec {
  functions: &["method_declaration", "constructor_declaration", "local_function_statement"],
  classes: &[
    "class_declaration",
    "struct_declaration",
    "interface_declaration",
    "enum_declaration",
    "record_declaration",
  ],
  calls: &["invocation_expression", "object_creation_expression"],
  imports: &["using_directive"],
  import_from: EMPTY,
  branches: &[
    "if_statement",
    "for_statement",
    "while_statement",
    "switch_statement",
    "try_statement",
  ],
  modules: EMPTY,
};

const RUBY: LangSpec = LangSpec {
  functions: &["method", "singleton_method", "lambda"],
  classes: &["class", "module", "singleton_class"],
  calls: &["call"],
  imports: &["call"], // require/require_relative are call nodes
  import_from: EMPTY,
  branches: &["if", "unless", "while", "until", "for", "case"],
  modules: EMPTY,
};

const PHP: LangSpec = LangSpec {
  functions: &["function_definition", "method_declaration", "anonymous_function"],
  classes: &["class_declaration", "interface_declaration", "trait_declaration", "enum_declaration"],
  calls: &["function_call_expression", "member_call_expression", "scoped_call_expression"],
  imports: &["namespace_use_declaration", "include_expression", "require_expression"],
  import_from: EMPTY,
  branches: &[
    "if_statement",
    "for_statement",
    "while_statement",
    "switch_statement",
    "try_statement",
  ],
  modules: EMPTY,
};

const KOTLIN: LangSpec = LangSpec {
  functions: &["function_declaration", "anonymous_function", "lambda_literal"],
  classes: &["class_declaration", "object_declaration", "enum_class", "type_alias"],
  calls: &["call_expression"],
  imports: &["import"],
  import_from: EMPTY,
  branches: &[
    "if_expression",
    "when_expression",
    "for_statement",
    "while_statement",
    "try_expression",
  ],
  modules: EMPTY,
};

const SWIFT: LangSpec = LangSpec {
  functions: &["function_declaration", "lambda_literal"],
  classes: &["class_declaration", "struct_declaration", "enum_declaration", "protocol_declaration"],
  calls: &["call_expression"],
  imports: &["import_declaration"],
  import_from: EMPTY,
  branches: &[
    "if_statement",
    "for_statement",
    "while_statement",
    "switch_statement",
    "do_statement",
  ],
  modules: EMPTY,
};

const SCALA: LangSpec = LangSpec {
  functions: &["function_definition", "function_declaration"],
  classes: &["class_definition", "object_definition", "trait_definition", "enum_definition"],
  calls: &["call_expression"],
  imports: &["import_declaration"],
  import_from: EMPTY,
  branches: &["if_expression", "match_expression", "for_expression", "try_expression"],
  modules: EMPTY,
};

const ZIG: LangSpec = LangSpec {
  functions: &["function_declaration", "function_prototype"],
  classes: &["container_declaration", "variable_declaration"],
  calls: &["call_expression"],
  imports: EMPTY,
  import_from: EMPTY,
  branches: &["if_expression", "for_expression", "while_expression", "switch_expression"],
  modules: EMPTY,
};

const ELIXIR: LangSpec = LangSpec {
  functions: &["call"], // def/defp are call nodes
  classes: &["call"],   // defmodule/defprotocol
  calls: &["call"],
  imports: &["unary_operator", "call"],
  import_from: EMPTY,
  branches: &["case", "cond", "if"],
  modules: EMPTY,
};

const LUA: LangSpec = LangSpec {
  functions: &["function_declaration", "function_definition"],
  classes: EMPTY,
  calls: &["function_call"],
  imports: EMPTY,
  import_from: EMPTY,
  branches: &["if_statement", "for_statement", "while_statement"],
  modules: EMPTY,
};

const BASH: LangSpec = LangSpec {
  functions: &["function_definition"],
  classes: EMPTY,
  calls: &["command"],
  imports: &["command"], // source / .
  import_from: EMPTY,
  branches: &["if_statement", "for_statement", "while_statement", "case_statement"],
  modules: EMPTY,
};

/// Look up the extraction spec for `language`.
///
/// Curated node-kind tables win when present; otherwise [`GENERIC`] is used.
/// Module roots always come from the generated manifest (`modules_for`).
#[must_use]
pub fn lang_spec(language: Language) -> LangSpec {
  let base = match language {
    Language::Go => GO,
    Language::Python | Language::Starlark | Language::Mojo => PYTHON,
    Language::JavaScript | Language::JSDoc | Language::Astro | Language::Vue | Language::Svelte => {
      JAVASCRIPT
    }
    Language::TypeScript | Language::Tsx | Language::Qml => TYPESCRIPT,
    Language::Rust | Language::Sway | Language::Move => RUST,
    Language::Java => JAVA,
    Language::C
    | Language::Cpp
    | Language::Cuda
    | Language::Objc
    | Language::GLSL
    | Language::HLSL => C_FAMILY,
    Language::CSharp => C_SHARP,
    Language::Ruby => RUBY,
    Language::Php => PHP,
    Language::Kotlin => KOTLIN,
    Language::Swift => SWIFT,
    Language::Scala => SCALA,
    Language::Zig => ZIG,
    Language::Elixir => ELIXIR,
    Language::Lua | Language::Luau => LUA,
    Language::Bash | Language::Zsh | Language::Fish => BASH,
    _ => GENERIC,
  };

  LangSpec { modules: modules_for(language), ..base }
}

/// Boilerplate spec from the grammar manifest (empty extraction kinds).
///
/// Prefer [`lang_spec`] for extraction; this matches upstream `generate_specs`
/// rows used when adding a language before node kinds are tuned.
pub use crate::lang_spec_gen::manifest_lang_spec;

/// True when `kind` appears in `set`.
#[must_use]
pub fn kind_in(kind: &str, set: &[&str]) -> bool {
  set.iter().any(|k| *k == kind)
}

/// Map a class-like node kind to a graph label.
#[must_use]
pub fn class_label_for_kind(kind: &str) -> &'static str {
  match kind {
    "interface_declaration"
    | "interface_type"
    | "trait_item"
    | "trait_definition"
    | "protocol_declaration" => "Interface",
    "enum_specifier" | "enum_declaration" | "enum_item" | "enum_class" => "Enum",
    "type_alias_declaration" | "type_item" | "type_alias" | "type_definition" => "Type",
    "struct_item" | "struct_specifier" | "struct_declaration" | "union_item" => "Struct",
    "impl_item" => "Class",
    _ => "Class",
  }
}
