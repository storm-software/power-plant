//! Generated lang-spec tables from `tools/tree-sitter/grammars.json`.
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

/// Module / translation-unit node kinds for AWK.
pub(crate) const AWK_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Ada.
pub(crate) const ADA_MODULE_TYPES: &[&str] = &["compilation"];
/// Module / translation-unit node kinds for Agda.
pub(crate) const AGDA_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Apex.
pub(crate) const APEX_MODULE_TYPES: &[&str] = &["parser_output"];
/// Module / translation-unit node kinds for Assembly.
pub(crate) const ASSEMBLY_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Astro.
pub(crate) const ASTRO_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Bash.
pub(crate) const BASH_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Beancount.
pub(crate) const BEANCOUNT_MODULE_TYPES: &[&str] = &["file"];
/// Module / translation-unit node kinds for BibTeX.
pub(crate) const BIBTEX_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Bicep.
pub(crate) const BICEP_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for BitBake.
pub(crate) const BITBAKE_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Blade.
pub(crate) const BLADE_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for C.
pub(crate) const C_MODULE_TYPES: &[&str] = &["translation_unit"];
/// Module / translation-unit node kinds for CFML.
pub(crate) const CFML_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for CFScript.
pub(crate) const CFSCRIPT_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for CMake.
pub(crate) const CMAKE_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for COBOL.
pub(crate) const COBOL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for CSS.
pub(crate) const CSS_MODULE_TYPES: &[&str] = &["stylesheet"];
/// Module / translation-unit node kinds for CSV.
pub(crate) const CSV_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for C#.
pub(crate) const C_SHARP_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Cairo.
pub(crate) const CAIRO_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Cap'n Proto.
pub(crate) const CAPNP_MODULE_TYPES: &[&str] = &["source"];
/// Module / translation-unit node kinds for Clojure.
pub(crate) const CLOJURE_MODULE_TYPES: &[&str] = &["source"];
/// Module / translation-unit node kinds for Common Lisp.
pub(crate) const COMMONLISP_MODULE_TYPES: &[&str] = &["source"];
/// Module / translation-unit node kinds for C++.
pub(crate) const CPP_MODULE_TYPES: &[&str] = &["translation_unit"];
/// Module / translation-unit node kinds for Crystal.
pub(crate) const CRYSTAL_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Cuda.
pub(crate) const CUDA_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for D.
pub(crate) const D_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Dart.
pub(crate) const DART_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for DeviceTree.
pub(crate) const DEVICETREE_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Diff.
pub(crate) const DIFF_MODULE_TYPES: &[&str] = &["source"];
/// Module / translation-unit node kinds for Dockerfile.
pub(crate) const DOCKERFILE_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for DotEnv.
pub(crate) const DOTENV_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Elixir.
pub(crate) const ELIXIR_MODULE_TYPES: &[&str] = &["source"];
/// Module / translation-unit node kinds for Elm.
pub(crate) const ELM_MODULE_TYPES: &[&str] = &["file"];
/// Module / translation-unit node kinds for Emacs Lisp.
pub(crate) const ELISP_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Erlang.
pub(crate) const ERLANG_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Fennel.
pub(crate) const FENNEL_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Fish.
pub(crate) const FISH_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Form.
pub(crate) const FORM_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Fortran.
pub(crate) const FORTRAN_MODULE_TYPES: &[&str] = &["translation_unit"];
/// Module / translation-unit node kinds for F#.
pub(crate) const FSHARP_MODULE_TYPES: &[&str] = &["file"];
/// Module / translation-unit node kinds for FunC.
pub(crate) const FUNC_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for GDScript.
pub(crate) const GDSCRIPT_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for GLSL.
pub(crate) const GLSL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for GN.
pub(crate) const GN_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for gitattributes.
pub(crate) const GITATTRIBUTES_MODULE_TYPES: &[&str] = &["source"];
/// Module / translation-unit node kinds for gitignore.
pub(crate) const GITIGNORE_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Gleam.
pub(crate) const GLEAM_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Go.
pub(crate) const GO_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Go Template.
pub(crate) const GOTEMPLATE_MODULE_TYPES: &[&str] = &["template"];
/// Module / translation-unit node kinds for Go Mod.
pub(crate) const GOMOD_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for GraphQL.
pub(crate) const GRAPHQL_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Groovy.
pub(crate) const GROOVY_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for HCL.
pub(crate) const HCL_MODULE_TYPES: &[&str] = &["config_file"];
/// Module / translation-unit node kinds for HLSL.
pub(crate) const HLSL_MODULE_TYPES: &[&str] = &["translation_unit"];
/// Module / translation-unit node kinds for HTML.
pub(crate) const HTML_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Hare.
pub(crate) const HARE_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Haskell.
pub(crate) const HASKELL_MODULE_TYPES: &[&str] = &["haskell"];
/// Module / translation-unit node kinds for Hyprlang.
pub(crate) const HYPRLANG_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for INI.
pub(crate) const INI_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for ISPC.
pub(crate) const ISPC_MODULE_TYPES: &[&str] = &["translation_unit"];
/// Module / translation-unit node kinds for JSDoc.
pub(crate) const JSDOC_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for JSON.
pub(crate) const JSON_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for JSON5.
pub(crate) const JSON5_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Janet.
pub(crate) const JANET_MODULE_TYPES: &[&str] = &["source"];
/// Module / translation-unit node kinds for Java.
pub(crate) const JAVA_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for JavaScript.
pub(crate) const JAVASCRIPT_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Jinja2.
pub(crate) const JINJA2_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Jsonnet.
pub(crate) const JSONNET_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Julia.
pub(crate) const JULIA_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Just.
pub(crate) const JUST_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for KDL.
pub(crate) const KDL_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Kconfig.
pub(crate) const KCONFIG_MODULE_TYPES: &[&str] = &["source"];
/// Module / translation-unit node kinds for Kotlin.
pub(crate) const KOTLIN_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for LLVM IR.
pub(crate) const LLVM_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Lean.
pub(crate) const LEAN_MODULE_TYPES: &[&str] = &["module"];
/// Module / translation-unit node kinds for Linker Script.
pub(crate) const LINKERSCRIPT_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Liquid.
pub(crate) const LIQUID_MODULE_TYPES: &[&str] = &["template"];
/// Module / translation-unit node kinds for Lua.
pub(crate) const LUA_MODULE_TYPES: &[&str] = &["chunk"];
/// Module / translation-unit node kinds for Luau.
pub(crate) const LUAU_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Magma.
pub(crate) const MAGMA_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Make.
pub(crate) const MAKE_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Markdown.
pub(crate) const MARKDOWN_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Matlab.
pub(crate) const MATLAB_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Mermaid.
pub(crate) const MERMAID_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Meson.
pub(crate) const MESON_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Mojo.
pub(crate) const MOJO_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Move.
pub(crate) const MOVE_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for NASM.
pub(crate) const NASM_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Nickel.
pub(crate) const NICKEL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Nix.
pub(crate) const NIX_MODULE_TYPES: &[&str] = &["source_expression"];
/// Module / translation-unit node kinds for OCaml.
pub(crate) const OCAML_MODULE_TYPES: &[&str] = &["compilation_unit"];
/// Module / translation-unit node kinds for Objective-C.
pub(crate) const OBJC_MODULE_TYPES: &[&str] = &["translation_unit"];
/// Module / translation-unit node kinds for ObjectScript Routine.
pub(crate) const OBJECTSCRIPT_ROUTINE_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for ObjectScript UDL.
pub(crate) const OBJECTSCRIPT_UDL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Odin.
pub(crate) const ODIN_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for PO.
pub(crate) const PO_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Pascal.
pub(crate) const PASCAL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Perl.
pub(crate) const PERL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for PHP.
pub(crate) const PHP_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for PineScript.
pub(crate) const PINE_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Pkl.
pub(crate) const PKL_MODULE_TYPES: &[&str] = &["module"];
/// Module / translation-unit node kinds for Pony.
pub(crate) const PONY_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for PowerShell.
pub(crate) const POWERSHELL_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Prisma.
pub(crate) const PRISMA_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Properties.
pub(crate) const PROPERTIES_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Protocol Buffers.
pub(crate) const PROTOBUF_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Puppet.
pub(crate) const PUPPET_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for PureScript.
pub(crate) const PURESCRIPT_MODULE_TYPES: &[&str] = &["module"];
/// Module / translation-unit node kinds for Python.
pub(crate) const PYTHON_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for QML.
pub(crate) const QML_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for R.
pub(crate) const R_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for RON.
pub(crate) const RON_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Racket.
pub(crate) const RACKET_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for ReScript.
pub(crate) const RESCRIPT_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for reStructuredText.
pub(crate) const RST_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Regex.
pub(crate) const REGEX_MODULE_TYPES: &[&str] = &["pattern"];
/// Module / translation-unit node kinds for Requirements.
pub(crate) const REQUIREMENTS_MODULE_TYPES: &[&str] = &["file"];
/// Module / translation-unit node kinds for Ruby.
pub(crate) const RUBY_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Rust.
pub(crate) const RUST_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for SCSS.
pub(crate) const SCSS_MODULE_TYPES: &[&str] = &["stylesheet"];
/// Module / translation-unit node kinds for SOQL.
pub(crate) const SOQL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for SOSL.
pub(crate) const SOSL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for SSH Config.
pub(crate) const SSHCONFIG_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Scala.
pub(crate) const SCALA_MODULE_TYPES: &[&str] = &["compilation_unit"];
/// Module / translation-unit node kinds for Scheme.
pub(crate) const SCHEME_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Slang.
pub(crate) const SLANG_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Smali.
pub(crate) const SMALI_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Smithy.
pub(crate) const SMITHY_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Solidity.
pub(crate) const SOLIDITY_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for SQL.
pub(crate) const SQL_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Squirrel.
pub(crate) const SQUIRREL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Starlark.
pub(crate) const STARLARK_MODULE_TYPES: &[&str] = &["module"];
/// Module / translation-unit node kinds for Svelte.
pub(crate) const SVELTE_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for Sway.
pub(crate) const SWAY_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Swift.
pub(crate) const SWIFT_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for SystemVerilog.
pub(crate) const SYSTEMVERILOG_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for TableGen.
pub(crate) const TABLEGEN_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Tcl.
pub(crate) const TCL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Teal.
pub(crate) const TEAL_MODULE_TYPES: &[&str] = &["program"];
/// Module / translation-unit node kinds for Templ.
pub(crate) const TEMPL_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Thrift.
pub(crate) const THRIFT_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for TLA+.
pub(crate) const TLAPLUS_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for TOML.
pub(crate) const TOML_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for TSX.
pub(crate) const TSX_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for TypeScript.
pub(crate) const TYPESCRIPT_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Typst.
pub(crate) const TYPST_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for VHDL.
pub(crate) const VHDL_MODULE_TYPES: &[&str] = &["design_file"];
/// Module / translation-unit node kinds for Verilog.
pub(crate) const VERILOG_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Vim.
pub(crate) const VIM_MODULE_TYPES: &[&str] = &["script_file"];
/// Module / translation-unit node kinds for Vue.
pub(crate) const VUE_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for WGSL.
pub(crate) const WGSL_MODULE_TYPES: &[&str] = &["translation_unit"];
/// Module / translation-unit node kinds for WIT.
pub(crate) const WIT_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Wolfram.
pub(crate) const WOLFRAM_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for XML.
pub(crate) const XML_MODULE_TYPES: &[&str] = &["document"];
/// Module / translation-unit node kinds for YAML.
pub(crate) const YAML_MODULE_TYPES: &[&str] = &["stream"];
/// Module / translation-unit node kinds for Zig.
pub(crate) const ZIG_MODULE_TYPES: &[&str] = &["source_file"];
/// Module / translation-unit node kinds for Zsh.
pub(crate) const ZSH_MODULE_TYPES: &[&str] = &["program"];

/// Root AST node kinds for `language` (empty for [`Language::Unknown`]).
#[must_use]
pub const fn modules_for(language: Language) -> &'static [&'static str] {
    match language {
        Language::AWK => AWK_MODULE_TYPES,
        Language::Ada => ADA_MODULE_TYPES,
        Language::Agda => AGDA_MODULE_TYPES,
        Language::Apex => APEX_MODULE_TYPES,
        Language::Assembly => ASSEMBLY_MODULE_TYPES,
        Language::Astro => ASTRO_MODULE_TYPES,
        Language::Bash => BASH_MODULE_TYPES,
        Language::Beancount => BEANCOUNT_MODULE_TYPES,
        Language::BibTeX => BIBTEX_MODULE_TYPES,
        Language::Bicep => BICEP_MODULE_TYPES,
        Language::BitBake => BITBAKE_MODULE_TYPES,
        Language::Blade => BLADE_MODULE_TYPES,
        Language::C => C_MODULE_TYPES,
        Language::CFML => CFML_MODULE_TYPES,
        Language::CFScript => CFSCRIPT_MODULE_TYPES,
        Language::CMake => CMAKE_MODULE_TYPES,
        Language::COBOL => COBOL_MODULE_TYPES,
        Language::CSS => CSS_MODULE_TYPES,
        Language::CSV => CSV_MODULE_TYPES,
        Language::CSharp => C_SHARP_MODULE_TYPES,
        Language::Cairo => CAIRO_MODULE_TYPES,
        Language::Capnp => CAPNP_MODULE_TYPES,
        Language::Clojure => CLOJURE_MODULE_TYPES,
        Language::CommonLisp => COMMONLISP_MODULE_TYPES,
        Language::Cpp => CPP_MODULE_TYPES,
        Language::Crystal => CRYSTAL_MODULE_TYPES,
        Language::Cuda => CUDA_MODULE_TYPES,
        Language::D => D_MODULE_TYPES,
        Language::Dart => DART_MODULE_TYPES,
        Language::DeviceTree => DEVICETREE_MODULE_TYPES,
        Language::Diff => DIFF_MODULE_TYPES,
        Language::Dockerfile => DOCKERFILE_MODULE_TYPES,
        Language::DotEnv => DOTENV_MODULE_TYPES,
        Language::Elixir => ELIXIR_MODULE_TYPES,
        Language::Elm => ELM_MODULE_TYPES,
        Language::EmacsLisp => ELISP_MODULE_TYPES,
        Language::Erlang => ERLANG_MODULE_TYPES,
        Language::Fennel => FENNEL_MODULE_TYPES,
        Language::Fish => FISH_MODULE_TYPES,
        Language::Form => FORM_MODULE_TYPES,
        Language::Fortran => FORTRAN_MODULE_TYPES,
        Language::Fsharp => FSHARP_MODULE_TYPES,
        Language::FunC => FUNC_MODULE_TYPES,
        Language::GDScript => GDSCRIPT_MODULE_TYPES,
        Language::GLSL => GLSL_MODULE_TYPES,
        Language::GN => GN_MODULE_TYPES,
        Language::GitAttributes => GITATTRIBUTES_MODULE_TYPES,
        Language::Gitignore => GITIGNORE_MODULE_TYPES,
        Language::Gleam => GLEAM_MODULE_TYPES,
        Language::Go => GO_MODULE_TYPES,
        Language::GoTemplate => GOTEMPLATE_MODULE_TYPES,
        Language::Gomod => GOMOD_MODULE_TYPES,
        Language::GraphQL => GRAPHQL_MODULE_TYPES,
        Language::Groovy => GROOVY_MODULE_TYPES,
        Language::HCL => HCL_MODULE_TYPES,
        Language::HLSL => HLSL_MODULE_TYPES,
        Language::HTML => HTML_MODULE_TYPES,
        Language::Hare => HARE_MODULE_TYPES,
        Language::Haskell => HASKELL_MODULE_TYPES,
        Language::Hyprlang => HYPRLANG_MODULE_TYPES,
        Language::INI => INI_MODULE_TYPES,
        Language::ISPC => ISPC_MODULE_TYPES,
        Language::JSDoc => JSDOC_MODULE_TYPES,
        Language::JSON => JSON_MODULE_TYPES,
        Language::JSON5 => JSON5_MODULE_TYPES,
        Language::Janet => JANET_MODULE_TYPES,
        Language::Java => JAVA_MODULE_TYPES,
        Language::JavaScript => JAVASCRIPT_MODULE_TYPES,
        Language::Jinja2 => JINJA2_MODULE_TYPES,
        Language::Jsonnet => JSONNET_MODULE_TYPES,
        Language::Julia => JULIA_MODULE_TYPES,
        Language::Just => JUST_MODULE_TYPES,
        Language::KDL => KDL_MODULE_TYPES,
        Language::Kconfig => KCONFIG_MODULE_TYPES,
        Language::Kotlin => KOTLIN_MODULE_TYPES,
        Language::LLVMIR => LLVM_MODULE_TYPES,
        Language::Lean => LEAN_MODULE_TYPES,
        Language::LinkerScript => LINKERSCRIPT_MODULE_TYPES,
        Language::Liquid => LIQUID_MODULE_TYPES,
        Language::Lua => LUA_MODULE_TYPES,
        Language::Luau => LUAU_MODULE_TYPES,
        Language::Magma => MAGMA_MODULE_TYPES,
        Language::Make => MAKE_MODULE_TYPES,
        Language::Markdown => MARKDOWN_MODULE_TYPES,
        Language::Matlab => MATLAB_MODULE_TYPES,
        Language::Mermaid => MERMAID_MODULE_TYPES,
        Language::Meson => MESON_MODULE_TYPES,
        Language::Mojo => MOJO_MODULE_TYPES,
        Language::Move => MOVE_MODULE_TYPES,
        Language::NASM => NASM_MODULE_TYPES,
        Language::Nickel => NICKEL_MODULE_TYPES,
        Language::Nix => NIX_MODULE_TYPES,
        Language::OCaml => OCAML_MODULE_TYPES,
        Language::Objc => OBJC_MODULE_TYPES,
        Language::ObjectScriptRoutine => OBJECTSCRIPT_ROUTINE_MODULE_TYPES,
        Language::ObjectScriptUDL => OBJECTSCRIPT_UDL_MODULE_TYPES,
        Language::Odin => ODIN_MODULE_TYPES,
        Language::PO => PO_MODULE_TYPES,
        Language::Pascal => PASCAL_MODULE_TYPES,
        Language::Perl => PERL_MODULE_TYPES,
        Language::Php => PHP_MODULE_TYPES,
        Language::PineScript => PINE_MODULE_TYPES,
        Language::Pkl => PKL_MODULE_TYPES,
        Language::Pony => PONY_MODULE_TYPES,
        Language::PowerShell => POWERSHELL_MODULE_TYPES,
        Language::Prisma => PRISMA_MODULE_TYPES,
        Language::Properties => PROPERTIES_MODULE_TYPES,
        Language::Protobuf => PROTOBUF_MODULE_TYPES,
        Language::Puppet => PUPPET_MODULE_TYPES,
        Language::PureScript => PURESCRIPT_MODULE_TYPES,
        Language::Python => PYTHON_MODULE_TYPES,
        Language::Qml => QML_MODULE_TYPES,
        Language::R => R_MODULE_TYPES,
        Language::RON => RON_MODULE_TYPES,
        Language::Racket => RACKET_MODULE_TYPES,
        Language::ReScript => RESCRIPT_MODULE_TYPES,
        Language::ReStructuredText => RST_MODULE_TYPES,
        Language::Regex => REGEX_MODULE_TYPES,
        Language::Requirements => REQUIREMENTS_MODULE_TYPES,
        Language::Ruby => RUBY_MODULE_TYPES,
        Language::Rust => RUST_MODULE_TYPES,
        Language::SCSS => SCSS_MODULE_TYPES,
        Language::SOQL => SOQL_MODULE_TYPES,
        Language::SOSL => SOSL_MODULE_TYPES,
        Language::SSHConfig => SSHCONFIG_MODULE_TYPES,
        Language::Scala => SCALA_MODULE_TYPES,
        Language::Scheme => SCHEME_MODULE_TYPES,
        Language::Slang => SLANG_MODULE_TYPES,
        Language::Smali => SMALI_MODULE_TYPES,
        Language::Smithy => SMITHY_MODULE_TYPES,
        Language::Solidity => SOLIDITY_MODULE_TYPES,
        Language::Sql => SQL_MODULE_TYPES,
        Language::Squirrel => SQUIRREL_MODULE_TYPES,
        Language::Starlark => STARLARK_MODULE_TYPES,
        Language::Svelte => SVELTE_MODULE_TYPES,
        Language::Sway => SWAY_MODULE_TYPES,
        Language::Swift => SWIFT_MODULE_TYPES,
        Language::SystemVerilog => SYSTEMVERILOG_MODULE_TYPES,
        Language::TableGen => TABLEGEN_MODULE_TYPES,
        Language::Tcl => TCL_MODULE_TYPES,
        Language::Teal => TEAL_MODULE_TYPES,
        Language::Templ => TEMPL_MODULE_TYPES,
        Language::Thrift => THRIFT_MODULE_TYPES,
        Language::Tlaplus => TLAPLUS_MODULE_TYPES,
        Language::Toml => TOML_MODULE_TYPES,
        Language::Tsx => TSX_MODULE_TYPES,
        Language::TypeScript => TYPESCRIPT_MODULE_TYPES,
        Language::Typst => TYPST_MODULE_TYPES,
        Language::VHDL => VHDL_MODULE_TYPES,
        Language::Verilog => VERILOG_MODULE_TYPES,
        Language::Vim => VIM_MODULE_TYPES,
        Language::Vue => VUE_MODULE_TYPES,
        Language::WGSL => WGSL_MODULE_TYPES,
        Language::WIT => WIT_MODULE_TYPES,
        Language::Wolfram => WOLFRAM_MODULE_TYPES,
        Language::Xml => XML_MODULE_TYPES,
        Language::Yaml => YAML_MODULE_TYPES,
        Language::Zig => ZIG_MODULE_TYPES,
        Language::Zsh => ZSH_MODULE_TYPES,
        Language::Unknown => EMPTY,
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
