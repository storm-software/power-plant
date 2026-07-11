use tree_sitter_language::LanguageFn;

use crate::languages;

/// Source language for extraction.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default)]
pub enum Language {
    #[default]
    Unknown,
    AWK,
    Ada,
    Agda,
    Apex,
    Assembly,
    Astro,
    Bash,
    Beancount,
    BibTeX,
    Bicep,
    BitBake,
    Blade,
    C,
    CFML,
    CFScript,
    CMake,
    COBOL,
    CSS,
    CSV,
    CSharp,
    Cairo,
    Capnp,
    Clojure,
    CommonLisp,
    Cpp,
    Crystal,
    Cuda,
    D,
    Dart,
    DeviceTree,
    Diff,
    Dockerfile,
    DotEnv,
    Elixir,
    Elm,
    EmacsLisp,
    Erlang,
    Fennel,
    Fish,
    Form,
    Fortran,
    Fsharp,
    FunC,
    GDScript,
    GLSL,
    GN,
    GitAttributes,
    Gitignore,
    Gleam,
    Go,
    GoTemplate,
    Gomod,
    GraphQL,
    Groovy,
    HCL,
    HLSL,
    HTML,
    Hare,
    Haskell,
    Hyprlang,
    INI,
    ISPC,
    JSDoc,
    JSON,
    JSON5,
    Janet,
    Java,
    JavaScript,
    Jinja2,
    Jsonnet,
    Julia,
    Just,
    KDL,
    Kconfig,
    Kotlin,
    LLVMIR,
    Lean,
    LinkerScript,
    Liquid,
    Lua,
    Luau,
    Magma,
    Make,
    Markdown,
    Matlab,
    Mermaid,
    Meson,
    Mojo,
    Move,
    NASM,
    Nickel,
    Nix,
    OCaml,
    Objc,
    ObjectScriptRoutine,
    ObjectScriptUDL,
    Odin,
    PO,
    Pascal,
    Perl,
    Php,
    PineScript,
    Pkl,
    Pony,
    PowerShell,
    Prisma,
    Properties,
    Protobuf,
    Puppet,
    PureScript,
    Python,
    Qml,
    R,
    RON,
    Racket,
    ReScript,
    ReStructuredText,
    Regex,
    Requirements,
    Ruby,
    Rust,
    SCSS,
    SOQL,
    SOSL,
    SSHConfig,
    Scala,
    Scheme,
    Slang,
    Smali,
    Smithy,
    Solidity,
    Sql,
    Squirrel,
    Starlark,
    Svelte,
    Sway,
    Swift,
    SystemVerilog,
    TableGen,
    Tcl,
    Teal,
    Templ,
    Thrift,
    Tlaplus,
    Toml,
    Tsx,
    TypeScript,
    Typst,
    VHDL,
    Verilog,
    Vim,
    Vue,
    WGSL,
    WIT,
    Wolfram,
    Xml,
    Yaml,
    Zig,
    Zsh,
}

impl From<&str> for Language {
    fn from(file_path: &str) -> Self {
        let path = std::path::Path::new(file_path);

        if let Some(file_name) = path.file_name().and_then(|name| name.to_str()) {
            let lowered_file_name = file_name.to_ascii_lowercase();
            match lowered_file_name.as_str() {
                "cmakelists.txt" => return Self::CMake,
                "containerfile" => return Self::Dockerfile,
                "dockerfile" => return Self::Dockerfile,
                ".env" => return Self::DotEnv,
                ".env.local" => return Self::DotEnv,
                ".env.development" => return Self::DotEnv,
                ".env.production" => return Self::DotEnv,
                ".gitattributes" => return Self::GitAttributes,
                ".gitignore" => return Self::Gitignore,
                ".dockerignore" => return Self::Gitignore,
                ".npmignore" => return Self::Gitignore,
                ".nxignore" => return Self::Gitignore,
                "go.mod" => return Self::Gomod,
                "hyprland.conf" => return Self::Hyprlang,
                ".all-contributorsrc" => return Self::JSON,
                ".babelrc" => return Self::JSON,
                ".eslintrc" => return Self::JSON,
                ".stylelintrc" => return Self::JSON,
                ".prettierrc" => return Self::JSON,
                ".whitesource" => return Self::JSON,
                "justfile" => return Self::Just,
                ".justfile" => return Self::Just,
                "kconfig" => return Self::Kconfig,
                "makefile" => return Self::Make,
                "cls.xml" => return Self::ObjectScriptUDL,
                "requirements.txt" => return Self::Requirements,
                "requirements-dev.txt" => return Self::Requirements,
                "requirements-test.txt" => return Self::Requirements,
                "ssh_config" => return Self::SSHConfig,
                "sshd_config" => return Self::SSHConfig,
                ".ssh/config" => return Self::SSHConfig,
                "build" => return Self::Starlark,
                "build.bazel" => return Self::Starlark,
                "workspace" => return Self::Starlark,
                "workspace.bazel" => return Self::Starlark,
                ".zshrc" => return Self::Zsh,
                ".zshenv" => return Self::Zsh,
                ".zprofile" => return Self::Zsh,
                _ => {}
            }
        }

        let lowered_file_path = file_path.to_ascii_lowercase();

        if glob::Pattern::new("makefile.*").unwrap().matches(&lowered_file_path) { return Self::Make; }

        // Properties
        if lowered_file_path.ends_with(".properties") { return Self::Properties; }
        // Beancount
        if lowered_file_path.ends_with(".beancount") { return Self::Beancount; }
        // Blade
        if lowered_file_path.ends_with(".blade.php") { return Self::Blade; }
        // Jsonnet
        if lowered_file_path.ends_with(".libsonnet") { return Self::Jsonnet; }
        // BitBake
        if lowered_file_path.ends_with(".bbappend") { return Self::BitBake; }
        // Markdown
        if lowered_file_path.ends_with(".markdown") { return Self::Markdown; }
        // BitBake
        if lowered_file_path.ends_with(".bbclass") { return Self::BitBake; }
        // GraphQL
        if lowered_file_path.ends_with(".graphql") { return Self::GraphQL; }
        // Jsonnet
        if lowered_file_path.ends_with(".jsonnet") { return Self::Jsonnet; }
        // Mermaid
        if lowered_file_path.ends_with(".mermaid") { return Self::Mermaid; }
        // DeviceTree
        if lowered_file_path.ends_with(".overlay") { return Self::DeviceTree; }
        // Apex
        if lowered_file_path.ends_with(".trigger") { return Self::Apex; }
        // Go Template
        if lowered_file_path.ends_with(".gotmpl") { return Self::GoTemplate; }
        // Groovy
        if lowered_file_path.ends_with(".gradle") { return Self::Groovy; }
        // Groovy
        if lowered_file_path.ends_with(".groovy") { return Self::Groovy; }
        // Jinja2
        if lowered_file_path.ends_with(".jinja2") { return Self::Jinja2; }
        // Liquid
        if lowered_file_path.ends_with(".liquid") { return Self::Liquid; }
        // Prisma
        if lowered_file_path.ends_with(".prisma") { return Self::Prisma; }
        // Smithy
        if lowered_file_path.ends_with(".smithy") { return Self::Smithy; }
        // Svelte
        if lowered_file_path.ends_with(".svelte") { return Self::Svelte; }
        // HCL
        if lowered_file_path.ends_with(".tfvars") { return Self::HCL; }
        // Thrift
        if lowered_file_path.ends_with(".thrift") { return Self::Thrift; }
        // Astro
        if lowered_file_path.ends_with(".astro") { return Self::Astro; }
        // Bicep
        if lowered_file_path.ends_with(".bicep") { return Self::Bicep; }
        // Cairo
        if lowered_file_path.ends_with(".cairo") { return Self::Cairo; }
        // Cap'n Proto
        if lowered_file_path.ends_with(".capnp") { return Self::Capnp; }
        // CMake
        if lowered_file_path.ends_with(".cmake") { return Self::CMake; }
        // Gleam
        if lowered_file_path.ends_with(".gleam") { return Self::Gleam; }
        // HLSL
        if lowered_file_path.ends_with(".hlsli") { return Self::HLSL; }
        // Janet
        if lowered_file_path.ends_with(".janet") { return Self::Janet; }
        // Jinja2
        if lowered_file_path.ends_with(".jinja") { return Self::Jinja2; }
        // JSON5
        if lowered_file_path.ends_with(".json5") { return Self::JSON5; }
        // Meson
        if lowered_file_path.ends_with(".meson") { return Self::Meson; }
        // Diff
        if lowered_file_path.ends_with(".patch") { return Self::Diff; }
        // Protocol Buffers
        if lowered_file_path.ends_with(".proto") { return Self::Protobuf; }
        // Scala
        if lowered_file_path.ends_with(".scala") { return Self::Scala; }
        // Slang
        if lowered_file_path.ends_with(".slang") { return Self::Slang; }
        // Smali
        if lowered_file_path.ends_with(".smali") { return Self::Smali; }
        // Swift
        if lowered_file_path.ends_with(".swift") { return Self::Swift; }
        // Templ
        if lowered_file_path.ends_with(".templ") { return Self::Templ; }
        // Agda
        if lowered_file_path.ends_with(".agda") { return Self::Agda; }
        // Bash
        if lowered_file_path.ends_with(".bash") { return Self::Bash; }
        // Clojure
        if lowered_file_path.ends_with(".cljc") { return Self::Clojure; }
        // Clojure
        if lowered_file_path.ends_with(".cljs") { return Self::Clojure; }
        // Dart
        if lowered_file_path.ends_with(".dart") { return Self::Dart; }
        // Diff
        if lowered_file_path.ends_with(".diff") { return Self::Diff; }
        // DeviceTree
        if lowered_file_path.ends_with(".dtsi") { return Self::DeviceTree; }
        // Fish
        if lowered_file_path.ends_with(".fish") { return Self::Fish; }
        // Form
        if lowered_file_path.ends_with(".form") { return Self::Form; }
        // GLSL
        if lowered_file_path.ends_with(".frag") { return Self::GLSL; }
        // GLSL
        if lowered_file_path.ends_with(".glsl") { return Self::GLSL; }
        // HLSL
        if lowered_file_path.ends_with(".hlsl") { return Self::HLSL; }
        // HTML
        if lowered_file_path.ends_with(".html") { return Self::HTML; }
        // ISPC
        if lowered_file_path.ends_with(".ispc") { return Self::ISPC; }
        // Java
        if lowered_file_path.ends_with(".java") { return Self::Java; }
        // JSON
        if lowered_file_path.ends_with(".json") { return Self::JSON; }
        // Lean
        if lowered_file_path.ends_with(".lean") { return Self::Lean; }
        // Common Lisp
        if lowered_file_path.ends_with(".lisp") { return Self::CommonLisp; }
        // Luau
        if lowered_file_path.ends_with(".luau") { return Self::Luau; }
        // Mojo
        if lowered_file_path.ends_with(".mojo") { return Self::Mojo; }
        // Move
        if lowered_file_path.ends_with(".move") { return Self::Move; }
        // NASM
        if lowered_file_path.ends_with(".nasm") { return Self::NASM; }
        // Odin
        if lowered_file_path.ends_with(".odin") { return Self::Odin; }
        // PineScript
        if lowered_file_path.ends_with(".pine") { return Self::PineScript; }
        // Pony
        if lowered_file_path.ends_with(".pony") { return Self::Pony; }
        // PowerShell
        if lowered_file_path.ends_with(".psd1") { return Self::PowerShell; }
        // PowerShell
        if lowered_file_path.ends_with(".psm1") { return Self::PowerShell; }
        // PureScript
        if lowered_file_path.ends_with(".purs") { return Self::PureScript; }
        // ReScript
        if lowered_file_path.ends_with(".resi") { return Self::ReScript; }
        // SCSS
        if lowered_file_path.ends_with(".scss") { return Self::SCSS; }
        // SOQL
        if lowered_file_path.ends_with(".soql") { return Self::SOQL; }
        // SOSL
        if lowered_file_path.ends_with(".sosl") { return Self::SOSL; }
        // Starlark
        if lowered_file_path.ends_with(".star") { return Self::Starlark; }
        // Go Template
        if lowered_file_path.ends_with(".tmpl") { return Self::GoTemplate; }
        // TOML
        if lowered_file_path.ends_with(".toml") { return Self::Toml; }
        // GLSL
        if lowered_file_path.ends_with(".vert") { return Self::GLSL; }
        // VHDL
        if lowered_file_path.ends_with(".vhdl") { return Self::VHDL; }
        // WGSL
        if lowered_file_path.ends_with(".wgsl") { return Self::WGSL; }
        // YAML
        if lowered_file_path.ends_with(".yaml") { return Self::Yaml; }
        // Ada
        if lowered_file_path.ends_with(".adb") { return Self::Ada; }
        // Ada
        if lowered_file_path.ends_with(".ads") { return Self::Ada; }
        // AWK
        if lowered_file_path.ends_with(".awk") { return Self::AWK; }
        // BibTeX
        if lowered_file_path.ends_with(".bib") { return Self::BibTeX; }
        // Starlark
        if lowered_file_path.ends_with(".bzl") { return Self::Starlark; }
        // COBOL
        if lowered_file_path.ends_with(".cbl") { return Self::COBOL; }
        // CFScript
        if lowered_file_path.ends_with(".cfc") { return Self::CFScript; }
        // CFML
        if lowered_file_path.ends_with(".cfm") { return Self::CFML; }
        // JavaScript
        if lowered_file_path.ends_with(".cjs") { return Self::JavaScript; }
        // Clojure
        if lowered_file_path.ends_with(".clj") { return Self::Clojure; }
        // Apex
        if lowered_file_path.ends_with(".cls") { return Self::Apex; }
        // COBOL
        if lowered_file_path.ends_with(".cob") { return Self::COBOL; }
        // C++
        if lowered_file_path.ends_with(".cpp") { return Self::Cpp; }
        // CSS
        if lowered_file_path.ends_with(".css") { return Self::CSS; }
        // CSV
        if lowered_file_path.ends_with(".csv") { return Self::CSV; }
        // Cuda
        if lowered_file_path.ends_with(".cuh") { return Self::Cuda; }
        // C++
        if lowered_file_path.ends_with(".cxx") { return Self::Cpp; }
        // Pascal
        if lowered_file_path.ends_with(".dpr") { return Self::Pascal; }
        // DeviceTree
        if lowered_file_path.ends_with(".dts") { return Self::DeviceTree; }
        // Elm
        if lowered_file_path.ends_with(".elm") { return Self::Elm; }
        // DotEnv
        if lowered_file_path.ends_with(".env") { return Self::DotEnv; }
        // Erlang
        if lowered_file_path.ends_with(".erl") { return Self::Erlang; }
        // Elixir
        if lowered_file_path.ends_with(".exs") { return Self::Elixir; }
        // Fortran
        if lowered_file_path.ends_with(".f90") { return Self::Fortran; }
        // Fortran
        if lowered_file_path.ends_with(".f95") { return Self::Fortran; }
        // Fennel
        if lowered_file_path.ends_with(".fnl") { return Self::Fennel; }
        // F#
        if lowered_file_path.ends_with(".fsi") { return Self::Fsharp; }
        // F#
        if lowered_file_path.ends_with(".fsx") { return Self::Fsharp; }
        // GN
        if lowered_file_path.ends_with(".gni") { return Self::GN; }
        // GraphQL
        if lowered_file_path.ends_with(".gql") { return Self::GraphQL; }
        // HCL
        if lowered_file_path.ends_with(".hcl") { return Self::HCL; }
        // C++
        if lowered_file_path.ends_with(".hpp") { return Self::Cpp; }
        // Erlang
        if lowered_file_path.ends_with(".hrl") { return Self::Erlang; }
        // HTML
        if lowered_file_path.ends_with(".htm") { return Self::HTML; }
        // C++
        if lowered_file_path.ends_with(".hxx") { return Self::Cpp; }
        // INI
        if lowered_file_path.ends_with(".ini") { return Self::INI; }
        // KDL
        if lowered_file_path.ends_with(".kdl") { return Self::KDL; }
        // Kotlin
        if lowered_file_path.ends_with(".kts") { return Self::Kotlin; }
        // Linker Script
        if lowered_file_path.ends_with(".lds") { return Self::LinkerScript; }
        // Pascal
        if lowered_file_path.ends_with(".lpr") { return Self::Pascal; }
        // Common Lisp
        if lowered_file_path.ends_with(".lsp") { return Self::CommonLisp; }
        // Lua
        if lowered_file_path.ends_with(".lua") { return Self::Lua; }
        // ObjectScript Routine
        if lowered_file_path.ends_with(".mac") { return Self::ObjectScriptRoutine; }
        // Matlab
        if lowered_file_path.ends_with(".mat") { return Self::Matlab; }
        // Markdown
        if lowered_file_path.ends_with(".mdx") { return Self::Markdown; }
        // JavaScript
        if lowered_file_path.ends_with(".mjs") { return Self::JavaScript; }
        // OCaml
        if lowered_file_path.ends_with(".mli") { return Self::OCaml; }
        // Mermaid
        if lowered_file_path.ends_with(".mmd") { return Self::Mermaid; }
        // Nickel
        if lowered_file_path.ends_with(".ncl") { return Self::Nickel; }
        // Nix
        if lowered_file_path.ends_with(".nix") { return Self::Nix; }
        // Squirrel
        if lowered_file_path.ends_with(".nut") { return Self::Squirrel; }
        // Pascal
        if lowered_file_path.ends_with(".pas") { return Self::Pascal; }
        // PHP
        if lowered_file_path.ends_with(".php") { return Self::Php; }
        // Pkl
        if lowered_file_path.ends_with(".pkl") { return Self::Pkl; }
        // PO
        if lowered_file_path.ends_with(".pot") { return Self::PO; }
        // PowerShell
        if lowered_file_path.ends_with(".ps1") { return Self::PowerShell; }
        // QML
        if lowered_file_path.ends_with(".qml") { return Self::Qml; }
        // ReScript
        if lowered_file_path.ends_with(".res") { return Self::ReScript; }
        // Racket
        if lowered_file_path.ends_with(".rkt") { return Self::Racket; }
        // RON
        if lowered_file_path.ends_with(".ron") { return Self::RON; }
        // reStructuredText
        if lowered_file_path.ends_with(".rst") { return Self::ReStructuredText; }
        // Scheme
        if lowered_file_path.ends_with(".scm") { return Self::Scheme; }
        // Solidity
        if lowered_file_path.ends_with(".sol") { return Self::Solidity; }
        // SQL
        if lowered_file_path.ends_with(".sql") { return Self::Sql; }
        // SystemVerilog
        if lowered_file_path.ends_with(".svh") { return Self::SystemVerilog; }
        // Tcl
        if lowered_file_path.ends_with(".tcl") { return Self::Tcl; }
        // TLA+
        if lowered_file_path.ends_with(".tla") { return Self::Tlaplus; }
        // TSX
        if lowered_file_path.ends_with(".tsx") { return Self::Tsx; }
        // Typst
        if lowered_file_path.ends_with(".typ") { return Self::Typst; }
        // VHDL
        if lowered_file_path.ends_with(".vhd") { return Self::VHDL; }
        // Vim
        if lowered_file_path.ends_with(".vim") { return Self::Vim; }
        // Vue
        if lowered_file_path.ends_with(".vue") { return Self::Vue; }
        // WIT
        if lowered_file_path.ends_with(".wit") { return Self::WIT; }
        // Wolfram
        if lowered_file_path.ends_with(".wls") { return Self::Wolfram; }
        // XML
        if lowered_file_path.ends_with(".xml") { return Self::Xml; }
        // YAML
        if lowered_file_path.ends_with(".yml") { return Self::Yaml; }
        // Zig
        if lowered_file_path.ends_with(".zig") { return Self::Zig; }
        // Zsh
        if lowered_file_path.ends_with(".zsh") { return Self::Zsh; }
        // BitBake
        if lowered_file_path.ends_with(".bb") { return Self::BitBake; }
        // C++
        if lowered_file_path.ends_with(".cc") { return Self::Cpp; }
        // C++
        if lowered_file_path.ends_with(".cp") { return Self::Cpp; }
        // Crystal
        if lowered_file_path.ends_with(".cr") { return Self::Crystal; }
        // C#
        if lowered_file_path.ends_with(".cs") { return Self::CSharp; }
        // Cuda
        if lowered_file_path.ends_with(".cu") { return Self::Cuda; }
        // Emacs Lisp
        if lowered_file_path.ends_with(".el") { return Self::EmacsLisp; }
        // Elixir
        if lowered_file_path.ends_with(".ex") { return Self::Elixir; }
        // FunC
        if lowered_file_path.ends_with(".fc") { return Self::FunC; }
        // F#
        if lowered_file_path.ends_with(".fs") { return Self::Fsharp; }
        // HLSL
        if lowered_file_path.ends_with(".fx") { return Self::HLSL; }
        // GDScript
        if lowered_file_path.ends_with(".gd") { return Self::GDScript; }
        // GN
        if lowered_file_path.ends_with(".gn") { return Self::GN; }
        // Go
        if lowered_file_path.ends_with(".go") { return Self::Go; }
        // Hare
        if lowered_file_path.ends_with(".ha") { return Self::Hare; }
        // Hyprlang
        if lowered_file_path.ends_with(".hl") { return Self::Hyprlang; }
        // Haskell
        if lowered_file_path.ends_with(".hs") { return Self::Haskell; }
        // Jinja2
        if lowered_file_path.ends_with(".j2") { return Self::Jinja2; }
        // Julia
        if lowered_file_path.ends_with(".jl") { return Self::Julia; }
        // JavaScript
        if lowered_file_path.ends_with(".js") { return Self::JavaScript; }
        // Kotlin
        if lowered_file_path.ends_with(".kt") { return Self::Kotlin; }
        // Linker Script
        if lowered_file_path.ends_with(".ld") { return Self::LinkerScript; }
        // LLVM IR
        if lowered_file_path.ends_with(".ll") { return Self::LLVMIR; }
        // Markdown
        if lowered_file_path.ends_with(".md") { return Self::Markdown; }
        // OCaml
        if lowered_file_path.ends_with(".ml") { return Self::OCaml; }
        // Perl
        if lowered_file_path.ends_with(".pl") { return Self::Perl; }
        // Perl
        if lowered_file_path.ends_with(".pm") { return Self::Perl; }
        // PO
        if lowered_file_path.ends_with(".po") { return Self::PO; }
        // Puppet
        if lowered_file_path.ends_with(".pp") { return Self::Puppet; }
        // Python
        if lowered_file_path.ends_with(".py") { return Self::Python; }
        // Ruby
        if lowered_file_path.ends_with(".rb") { return Self::Ruby; }
        // Rust
        if lowered_file_path.ends_with(".rs") { return Self::Rust; }
        // Bash
        if lowered_file_path.ends_with(".sh") { return Self::Bash; }
        // Scheme
        if lowered_file_path.ends_with(".ss") { return Self::Scheme; }
        // SystemVerilog
        if lowered_file_path.ends_with(".sv") { return Self::SystemVerilog; }
        // Sway
        if lowered_file_path.ends_with(".sw") { return Self::Sway; }
        // TableGen
        if lowered_file_path.ends_with(".td") { return Self::TableGen; }
        // HCL
        if lowered_file_path.ends_with(".tf") { return Self::HCL; }
        // Teal
        if lowered_file_path.ends_with(".tl") { return Self::Teal; }
        // TypeScript
        if lowered_file_path.ends_with(".ts") { return Self::TypeScript; }
        // Wolfram
        if lowered_file_path.ends_with(".wl") { return Self::Wolfram; }
        // C
        if lowered_file_path.ends_with(".c") { return Self::C; }
        // D
        if lowered_file_path.ends_with(".d") { return Self::D; }
        // Fortran
        if lowered_file_path.ends_with(".f") { return Self::Fortran; }
        // C
        if lowered_file_path.ends_with(".h") { return Self::C; }
        // Objective-C
        if lowered_file_path.ends_with(".m") { return Self::Objc; }
        // R
        if lowered_file_path.ends_with(".r") { return Self::R; }
        // Assembly
        if lowered_file_path.ends_with(".s") { return Self::Assembly; }
        // Verilog
        if lowered_file_path.ends_with(".v") { return Self::Verilog; }

        Self::Unknown
    }
}

impl From<&String> for Language {
    fn from(file_path: &String) -> Self {
        Self::from(file_path.as_str())
    }
}

impl From<&std::path::Path> for Language {
    fn from(file_path: &std::path::Path) -> Self {
        Self::from(file_path.to_string_lossy().as_ref())
    }
}

impl From<std::path::PathBuf> for Language {
    fn from(file_path: std::path::PathBuf) -> Self {
        Self::from(file_path.as_path())
    }
}

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
            Self::AWK => Some(languages::tree_sitter_awk::LANGUAGE),
            Self::Ada => Some(languages::tree_sitter_ada::LANGUAGE),
            Self::Agda => Some(languages::tree_sitter_agda::LANGUAGE),
            Self::Apex => Some(languages::tree_sitter_apex::LANGUAGE),
            Self::Assembly => Some(languages::tree_sitter_asm::LANGUAGE),
            Self::Astro => Some(languages::tree_sitter_astro::LANGUAGE),
            Self::Bash => Some(languages::tree_sitter_bash::LANGUAGE),
            Self::Beancount => Some(languages::tree_sitter_beancount::LANGUAGE),
            Self::BibTeX => Some(languages::tree_sitter_bibtex::LANGUAGE),
            Self::Bicep => Some(languages::tree_sitter_bicep::LANGUAGE),
            Self::BitBake => Some(languages::tree_sitter_bitbake::LANGUAGE),
            Self::Blade => Some(languages::tree_sitter_blade::LANGUAGE),
            Self::C => Some(languages::tree_sitter_c::LANGUAGE),
            Self::CFML => Some(languages::tree_sitter_cfml::LANGUAGE),
            Self::CFScript => Some(languages::tree_sitter_cfscript::LANGUAGE),
            Self::CMake => Some(languages::tree_sitter_cmake::LANGUAGE),
            Self::COBOL => Some(languages::tree_sitter_cobol::LANGUAGE),
            Self::CSS => Some(languages::tree_sitter_css::LANGUAGE),
            Self::CSV => Some(languages::tree_sitter_csv::LANGUAGE),
            Self::CSharp => Some(languages::tree_sitter_c_sharp::LANGUAGE),
            Self::Cairo => Some(languages::tree_sitter_cairo::LANGUAGE),
            Self::Capnp => Some(languages::tree_sitter_capnp::LANGUAGE),
            Self::Clojure => Some(languages::tree_sitter_clojure::LANGUAGE),
            Self::CommonLisp => Some(languages::tree_sitter_commonlisp::LANGUAGE),
            Self::Cpp => Some(languages::tree_sitter_cpp::LANGUAGE),
            Self::Crystal => Some(languages::tree_sitter_crystal::LANGUAGE),
            Self::Cuda => Some(languages::tree_sitter_cuda::LANGUAGE),
            Self::D => Some(languages::tree_sitter_d::LANGUAGE),
            Self::Dart => Some(languages::tree_sitter_dart::LANGUAGE),
            Self::DeviceTree => Some(languages::tree_sitter_devicetree::LANGUAGE),
            Self::Diff => Some(languages::tree_sitter_diff::LANGUAGE),
            Self::Dockerfile => Some(languages::tree_sitter_dockerfile::LANGUAGE),
            Self::DotEnv => Some(languages::tree_sitter_dotenv::LANGUAGE),
            Self::Elixir => Some(languages::tree_sitter_elixir::LANGUAGE),
            Self::Elm => Some(languages::tree_sitter_elm::LANGUAGE),
            Self::EmacsLisp => Some(languages::tree_sitter_elisp::LANGUAGE),
            Self::Erlang => Some(languages::tree_sitter_erlang::LANGUAGE),
            Self::Fennel => Some(languages::tree_sitter_fennel::LANGUAGE),
            Self::Fish => Some(languages::tree_sitter_fish::LANGUAGE),
            Self::Form => Some(languages::tree_sitter_form::LANGUAGE),
            Self::Fortran => Some(languages::tree_sitter_fortran::LANGUAGE),
            Self::Fsharp => Some(languages::tree_sitter_fsharp::LANGUAGE),
            Self::FunC => Some(languages::tree_sitter_func::LANGUAGE),
            Self::GDScript => Some(languages::tree_sitter_gdscript::LANGUAGE),
            Self::GLSL => Some(languages::tree_sitter_glsl::LANGUAGE),
            Self::GN => Some(languages::tree_sitter_gn::LANGUAGE),
            Self::GitAttributes => Some(languages::tree_sitter_gitattributes::LANGUAGE),
            Self::Gitignore => Some(languages::tree_sitter_gitignore::LANGUAGE),
            Self::Gleam => Some(languages::tree_sitter_gleam::LANGUAGE),
            Self::Go => Some(languages::tree_sitter_go::LANGUAGE),
            Self::GoTemplate => Some(languages::tree_sitter_gotmpl::LANGUAGE),
            Self::Gomod => Some(languages::tree_sitter_gomod::LANGUAGE),
            Self::GraphQL => Some(languages::tree_sitter_graphql::LANGUAGE),
            Self::Groovy => Some(languages::tree_sitter_groovy::LANGUAGE),
            Self::HCL => Some(languages::tree_sitter_hcl::LANGUAGE),
            Self::HLSL => Some(languages::tree_sitter_hlsl::LANGUAGE),
            Self::HTML => Some(languages::tree_sitter_html::LANGUAGE),
            Self::Hare => Some(languages::tree_sitter_hare::LANGUAGE),
            Self::Haskell => Some(languages::tree_sitter_haskell::LANGUAGE),
            Self::Hyprlang => Some(languages::tree_sitter_hyprlang::LANGUAGE),
            Self::INI => Some(languages::tree_sitter_ini::LANGUAGE),
            Self::ISPC => Some(languages::tree_sitter_ispc::LANGUAGE),
            Self::JSDoc => Some(languages::tree_sitter_jsdoc::LANGUAGE),
            Self::JSON => Some(languages::tree_sitter_json::LANGUAGE),
            Self::JSON5 => Some(languages::tree_sitter_json5::LANGUAGE),
            Self::Janet => Some(languages::tree_sitter_janet_simple::LANGUAGE),
            Self::Java => Some(languages::tree_sitter_java::LANGUAGE),
            Self::JavaScript => Some(languages::tree_sitter_javascript::LANGUAGE),
            Self::Jinja2 => Some(languages::tree_sitter_jinja2::LANGUAGE),
            Self::Jsonnet => Some(languages::tree_sitter_jsonnet::LANGUAGE),
            Self::Julia => Some(languages::tree_sitter_julia::LANGUAGE),
            Self::Just => Some(languages::tree_sitter_just::LANGUAGE),
            Self::KDL => Some(languages::tree_sitter_kdl::LANGUAGE),
            Self::Kconfig => Some(languages::tree_sitter_kconfig::LANGUAGE),
            Self::Kotlin => Some(languages::tree_sitter_kotlin::LANGUAGE),
            Self::LLVMIR => Some(languages::tree_sitter_llvm::LANGUAGE),
            Self::Lean => Some(languages::tree_sitter_lean::LANGUAGE),
            Self::LinkerScript => Some(languages::tree_sitter_linkerscript::LANGUAGE),
            Self::Liquid => Some(languages::tree_sitter_liquid::LANGUAGE),
            Self::Lua => Some(languages::tree_sitter_lua::LANGUAGE),
            Self::Luau => Some(languages::tree_sitter_luau::LANGUAGE),
            Self::Magma => Some(languages::tree_sitter_magma::LANGUAGE),
            Self::Make => Some(languages::tree_sitter_make::LANGUAGE),
            Self::Markdown => Some(languages::tree_sitter_markdown::LANGUAGE),
            Self::Matlab => Some(languages::tree_sitter_matlab::LANGUAGE),
            Self::Mermaid => Some(languages::tree_sitter_mermaid::LANGUAGE),
            Self::Meson => Some(languages::tree_sitter_meson::LANGUAGE),
            Self::Mojo => Some(languages::tree_sitter_mojo::LANGUAGE),
            Self::Move => Some(languages::tree_sitter_move::LANGUAGE),
            Self::NASM => Some(languages::tree_sitter_nasm::LANGUAGE),
            Self::Nickel => Some(languages::tree_sitter_nickel::LANGUAGE),
            Self::Nix => Some(languages::tree_sitter_nix::LANGUAGE),
            Self::OCaml => Some(languages::tree_sitter_ocaml::LANGUAGE),
            Self::Objc => Some(languages::tree_sitter_objc::LANGUAGE),
            Self::ObjectScriptRoutine => Some(languages::tree_sitter_objectscript_routine::LANGUAGE),
            Self::ObjectScriptUDL => Some(languages::tree_sitter_objectscript_udl::LANGUAGE),
            Self::Odin => Some(languages::tree_sitter_odin::LANGUAGE),
            Self::PO => Some(languages::tree_sitter_po::LANGUAGE),
            Self::Pascal => Some(languages::tree_sitter_pascal::LANGUAGE),
            Self::Perl => Some(languages::tree_sitter_perl::LANGUAGE),
            Self::Php => Some(languages::tree_sitter_php_only::LANGUAGE),
            Self::PineScript => Some(languages::tree_sitter_pine::LANGUAGE),
            Self::Pkl => Some(languages::tree_sitter_pkl::LANGUAGE),
            Self::Pony => Some(languages::tree_sitter_pony::LANGUAGE),
            Self::PowerShell => Some(languages::tree_sitter_powershell::LANGUAGE),
            Self::Prisma => Some(languages::tree_sitter_prisma::LANGUAGE),
            Self::Properties => Some(languages::tree_sitter_properties::LANGUAGE),
            Self::Protobuf => Some(languages::tree_sitter_proto::LANGUAGE),
            Self::Puppet => Some(languages::tree_sitter_puppet::LANGUAGE),
            Self::PureScript => Some(languages::tree_sitter_purescript::LANGUAGE),
            Self::Python => Some(languages::tree_sitter_python::LANGUAGE),
            Self::Qml => Some(languages::tree_sitter_qmljs::LANGUAGE),
            Self::R => Some(languages::tree_sitter_r::LANGUAGE),
            Self::RON => Some(languages::tree_sitter_ron::LANGUAGE),
            Self::Racket => Some(languages::tree_sitter_racket::LANGUAGE),
            Self::ReScript => Some(languages::tree_sitter_rescript::LANGUAGE),
            Self::ReStructuredText => Some(languages::tree_sitter_rst::LANGUAGE),
            Self::Regex => Some(languages::tree_sitter_regex::LANGUAGE),
            Self::Requirements => Some(languages::tree_sitter_requirements::LANGUAGE),
            Self::Ruby => Some(languages::tree_sitter_ruby::LANGUAGE),
            Self::Rust => Some(languages::tree_sitter_rust::LANGUAGE),
            Self::SCSS => Some(languages::tree_sitter_scss::LANGUAGE),
            Self::SOQL => Some(languages::tree_sitter_soql::LANGUAGE),
            Self::SOSL => Some(languages::tree_sitter_sosl::LANGUAGE),
            Self::SSHConfig => Some(languages::tree_sitter_ssh_config::LANGUAGE),
            Self::Scala => Some(languages::tree_sitter_scala::LANGUAGE),
            Self::Scheme => Some(languages::tree_sitter_scheme::LANGUAGE),
            Self::Slang => Some(languages::tree_sitter_slang::LANGUAGE),
            Self::Smali => Some(languages::tree_sitter_smali::LANGUAGE),
            Self::Smithy => Some(languages::tree_sitter_smithy::LANGUAGE),
            Self::Solidity => Some(languages::tree_sitter_solidity::LANGUAGE),
            Self::Sql => Some(languages::tree_sitter_sql::LANGUAGE),
            Self::Squirrel => Some(languages::tree_sitter_squirrel::LANGUAGE),
            Self::Starlark => Some(languages::tree_sitter_starlark::LANGUAGE),
            Self::Svelte => Some(languages::tree_sitter_svelte::LANGUAGE),
            Self::Sway => Some(languages::tree_sitter_sway::LANGUAGE),
            Self::Swift => Some(languages::tree_sitter_swift::LANGUAGE),
            Self::SystemVerilog => Some(languages::tree_sitter_systemverilog::LANGUAGE),
            Self::TableGen => Some(languages::tree_sitter_tablegen::LANGUAGE),
            Self::Tcl => Some(languages::tree_sitter_tcl::LANGUAGE),
            Self::Teal => Some(languages::tree_sitter_teal::LANGUAGE),
            Self::Templ => Some(languages::tree_sitter_templ::LANGUAGE),
            Self::Thrift => Some(languages::tree_sitter_thrift::LANGUAGE),
            Self::Tlaplus => Some(languages::tree_sitter_tlaplus::LANGUAGE),
            Self::Toml => Some(languages::tree_sitter_toml::LANGUAGE),
            Self::Tsx => Some(languages::tree_sitter_tsx::LANGUAGE),
            Self::TypeScript => Some(languages::tree_sitter_typescript::LANGUAGE),
            Self::Typst => Some(languages::tree_sitter_typst::LANGUAGE),
            Self::VHDL => Some(languages::tree_sitter_vhdl::LANGUAGE),
            Self::Verilog => Some(languages::tree_sitter_verilog::LANGUAGE),
            Self::Vim => Some(languages::tree_sitter_vim::LANGUAGE),
            Self::Vue => Some(languages::tree_sitter_vue::LANGUAGE),
            Self::WGSL => Some(languages::tree_sitter_wgsl::LANGUAGE),
            Self::WIT => Some(languages::tree_sitter_wit::LANGUAGE),
            Self::Wolfram => Some(languages::tree_sitter_wolfram::LANGUAGE),
            Self::Xml => Some(languages::tree_sitter_xml::LANGUAGE),
            Self::Yaml => Some(languages::tree_sitter_yaml::LANGUAGE),
            Self::Zig => Some(languages::tree_sitter_zig::LANGUAGE),
            Self::Zsh => Some(languages::tree_sitter_zsh::LANGUAGE),
            Self::Unknown => None,
        }
    }

    /// Human-readable language label (e.g. `"TypeScript"`).
    #[must_use]
    pub const fn display_name(self) -> &'static str {
        match self {
            Self::AWK => "AWK",
            Self::Ada => "Ada",
            Self::Agda => "Agda",
            Self::Apex => "Apex",
            Self::Assembly => "Assembly",
            Self::Astro => "Astro",
            Self::Bash => "Bash",
            Self::Beancount => "Beancount",
            Self::BibTeX => "BibTeX",
            Self::Bicep => "Bicep",
            Self::BitBake => "BitBake",
            Self::Blade => "Blade",
            Self::C => "C",
            Self::CFML => "CFML",
            Self::CFScript => "CFScript",
            Self::CMake => "CMake",
            Self::COBOL => "COBOL",
            Self::CSS => "CSS",
            Self::CSV => "CSV",
            Self::CSharp => "C#",
            Self::Cairo => "Cairo",
            Self::Capnp => "Cap'n Proto",
            Self::Clojure => "Clojure",
            Self::CommonLisp => "Common Lisp",
            Self::Cpp => "C++",
            Self::Crystal => "Crystal",
            Self::Cuda => "Cuda",
            Self::D => "D",
            Self::Dart => "Dart",
            Self::DeviceTree => "DeviceTree",
            Self::Diff => "Diff",
            Self::Dockerfile => "Dockerfile",
            Self::DotEnv => "DotEnv",
            Self::Elixir => "Elixir",
            Self::Elm => "Elm",
            Self::EmacsLisp => "Emacs Lisp",
            Self::Erlang => "Erlang",
            Self::Fennel => "Fennel",
            Self::Fish => "Fish",
            Self::Form => "Form",
            Self::Fortran => "Fortran",
            Self::Fsharp => "F#",
            Self::FunC => "FunC",
            Self::GDScript => "GDScript",
            Self::GLSL => "GLSL",
            Self::GN => "GN",
            Self::GitAttributes => "gitattributes",
            Self::Gitignore => "gitignore",
            Self::Gleam => "Gleam",
            Self::Go => "Go",
            Self::GoTemplate => "Go Template",
            Self::Gomod => "Go Mod",
            Self::GraphQL => "GraphQL",
            Self::Groovy => "Groovy",
            Self::HCL => "HCL",
            Self::HLSL => "HLSL",
            Self::HTML => "HTML",
            Self::Hare => "Hare",
            Self::Haskell => "Haskell",
            Self::Hyprlang => "Hyprlang",
            Self::INI => "INI",
            Self::ISPC => "ISPC",
            Self::JSDoc => "JSDoc",
            Self::JSON => "JSON",
            Self::JSON5 => "JSON5",
            Self::Janet => "Janet",
            Self::Java => "Java",
            Self::JavaScript => "JavaScript",
            Self::Jinja2 => "Jinja2",
            Self::Jsonnet => "Jsonnet",
            Self::Julia => "Julia",
            Self::Just => "Just",
            Self::KDL => "KDL",
            Self::Kconfig => "Kconfig",
            Self::Kotlin => "Kotlin",
            Self::LLVMIR => "LLVM IR",
            Self::Lean => "Lean",
            Self::LinkerScript => "Linker Script",
            Self::Liquid => "Liquid",
            Self::Lua => "Lua",
            Self::Luau => "Luau",
            Self::Magma => "Magma",
            Self::Make => "Make",
            Self::Markdown => "Markdown",
            Self::Matlab => "Matlab",
            Self::Mermaid => "Mermaid",
            Self::Meson => "Meson",
            Self::Mojo => "Mojo",
            Self::Move => "Move",
            Self::NASM => "NASM",
            Self::Nickel => "Nickel",
            Self::Nix => "Nix",
            Self::OCaml => "OCaml",
            Self::Objc => "Objective-C",
            Self::ObjectScriptRoutine => "ObjectScript Routine",
            Self::ObjectScriptUDL => "ObjectScript UDL",
            Self::Odin => "Odin",
            Self::PO => "PO",
            Self::Pascal => "Pascal",
            Self::Perl => "Perl",
            Self::Php => "PHP",
            Self::PineScript => "PineScript",
            Self::Pkl => "Pkl",
            Self::Pony => "Pony",
            Self::PowerShell => "PowerShell",
            Self::Prisma => "Prisma",
            Self::Properties => "Properties",
            Self::Protobuf => "Protocol Buffers",
            Self::Puppet => "Puppet",
            Self::PureScript => "PureScript",
            Self::Python => "Python",
            Self::Qml => "QML",
            Self::R => "R",
            Self::RON => "RON",
            Self::Racket => "Racket",
            Self::ReScript => "ReScript",
            Self::ReStructuredText => "reStructuredText",
            Self::Regex => "Regex",
            Self::Requirements => "Requirements",
            Self::Ruby => "Ruby",
            Self::Rust => "Rust",
            Self::SCSS => "SCSS",
            Self::SOQL => "SOQL",
            Self::SOSL => "SOSL",
            Self::SSHConfig => "SSH Config",
            Self::Scala => "Scala",
            Self::Scheme => "Scheme",
            Self::Slang => "Slang",
            Self::Smali => "Smali",
            Self::Smithy => "Smithy",
            Self::Solidity => "Solidity",
            Self::Sql => "SQL",
            Self::Squirrel => "Squirrel",
            Self::Starlark => "Starlark",
            Self::Svelte => "Svelte",
            Self::Sway => "Sway",
            Self::Swift => "Swift",
            Self::SystemVerilog => "SystemVerilog",
            Self::TableGen => "TableGen",
            Self::Tcl => "Tcl",
            Self::Teal => "Teal",
            Self::Templ => "Templ",
            Self::Thrift => "Thrift",
            Self::Tlaplus => "TLA+",
            Self::Toml => "TOML",
            Self::Tsx => "TSX",
            Self::TypeScript => "TypeScript",
            Self::Typst => "Typst",
            Self::VHDL => "VHDL",
            Self::Verilog => "Verilog",
            Self::Vim => "Vim",
            Self::Vue => "Vue",
            Self::WGSL => "WGSL",
            Self::WIT => "WIT",
            Self::Wolfram => "Wolfram",
            Self::Xml => "XML",
            Self::Yaml => "YAML",
            Self::Zig => "Zig",
            Self::Zsh => "Zsh",
            Self::Unknown => "Unknown",
        }
    }

    /// Stable enum identifier from the grammar manifest (e.g. `"TYPESCRIPT"`).
    #[must_use]
    pub const fn enum_name(self) -> &'static str {
        match self {
            Self::AWK => "AWK",
            Self::Ada => "ADA",
            Self::Agda => "AGDA",
            Self::Apex => "APEX",
            Self::Assembly => "ASSEMBLY",
            Self::Astro => "ASTRO",
            Self::Bash => "BASH",
            Self::Beancount => "BEANCOUNT",
            Self::BibTeX => "BIBTEX",
            Self::Bicep => "BICEP",
            Self::BitBake => "BITBAKE",
            Self::Blade => "BLADE",
            Self::C => "C",
            Self::CFML => "CFML",
            Self::CFScript => "CFSCRIPT",
            Self::CMake => "CMAKE",
            Self::COBOL => "COBOL",
            Self::CSS => "CSS",
            Self::CSV => "CSV",
            Self::CSharp => "CSHARP",
            Self::Cairo => "CAIRO",
            Self::Capnp => "CAPNP",
            Self::Clojure => "CLOJURE",
            Self::CommonLisp => "COMMONLISP",
            Self::Cpp => "CPP",
            Self::Crystal => "CRYSTAL",
            Self::Cuda => "CUDA",
            Self::D => "DLANG",
            Self::Dart => "DART",
            Self::DeviceTree => "DEVICETREE",
            Self::Diff => "DIFF",
            Self::Dockerfile => "DOCKERFILE",
            Self::DotEnv => "DOTENV",
            Self::Elixir => "ELIXIR",
            Self::Elm => "ELM",
            Self::EmacsLisp => "ELISP",
            Self::Erlang => "ERLANG",
            Self::Fennel => "FENNEL",
            Self::Fish => "FISH",
            Self::Form => "FORM",
            Self::Fortran => "FORTRAN",
            Self::Fsharp => "FSHARP",
            Self::FunC => "FUNC",
            Self::GDScript => "GDSCRIPT",
            Self::GLSL => "GLSL",
            Self::GN => "GN",
            Self::GitAttributes => "GITATTRIBUTES",
            Self::Gitignore => "GITIGNORE",
            Self::Gleam => "GLEAM",
            Self::Go => "GO",
            Self::GoTemplate => "GOTEMPLATE",
            Self::Gomod => "GOMOD",
            Self::GraphQL => "GRAPHQL",
            Self::Groovy => "GROOVY",
            Self::HCL => "HCL",
            Self::HLSL => "HLSL",
            Self::HTML => "HTML",
            Self::Hare => "HARE",
            Self::Haskell => "HASKELL",
            Self::Hyprlang => "HYPRLANG",
            Self::INI => "INI",
            Self::ISPC => "ISPC",
            Self::JSDoc => "JSDOC",
            Self::JSON => "JSON",
            Self::JSON5 => "JSON5",
            Self::Janet => "JANET",
            Self::Java => "JAVA",
            Self::JavaScript => "JAVASCRIPT",
            Self::Jinja2 => "JINJA2",
            Self::Jsonnet => "JSONNET",
            Self::Julia => "JULIA",
            Self::Just => "JUST",
            Self::KDL => "KDL",
            Self::Kconfig => "KCONFIG",
            Self::Kotlin => "KOTLIN",
            Self::LLVMIR => "LLVM_IR",
            Self::Lean => "LEAN",
            Self::LinkerScript => "LINKERSCRIPT",
            Self::Liquid => "LIQUID",
            Self::Lua => "LUA",
            Self::Luau => "LUAU",
            Self::Magma => "MAGMA",
            Self::Make => "MAKE",
            Self::Markdown => "MARKDOWN",
            Self::Matlab => "MATLAB",
            Self::Mermaid => "MERMAID",
            Self::Meson => "MESON",
            Self::Mojo => "MOJO",
            Self::Move => "MOVE",
            Self::NASM => "NASM",
            Self::Nickel => "NICKEL",
            Self::Nix => "NIX",
            Self::OCaml => "OCAML",
            Self::Objc => "OBJC",
            Self::ObjectScriptRoutine => "OBJECTSCRIPT_ROUTINE",
            Self::ObjectScriptUDL => "OBJECTSCRIPT_UDL",
            Self::Odin => "ODIN",
            Self::PO => "PO",
            Self::Pascal => "PASCAL",
            Self::Perl => "PERL",
            Self::Php => "PHP",
            Self::PineScript => "PINE",
            Self::Pkl => "PKL",
            Self::Pony => "PONY",
            Self::PowerShell => "POWERSHELL",
            Self::Prisma => "PRISMA",
            Self::Properties => "PROPERTIES",
            Self::Protobuf => "PROTOBUF",
            Self::Puppet => "PUPPET",
            Self::PureScript => "PURESCRIPT",
            Self::Python => "PYTHON",
            Self::Qml => "QML",
            Self::R => "R",
            Self::RON => "RON",
            Self::Racket => "RACKET",
            Self::ReScript => "RESCRIPT",
            Self::ReStructuredText => "RST",
            Self::Regex => "REGEX",
            Self::Requirements => "REQUIREMENTS",
            Self::Ruby => "RUBY",
            Self::Rust => "RUST",
            Self::SCSS => "SCSS",
            Self::SOQL => "SOQL",
            Self::SOSL => "SOSL",
            Self::SSHConfig => "SSHCONFIG",
            Self::Scala => "SCALA",
            Self::Scheme => "SCHEME",
            Self::Slang => "SLANG",
            Self::Smali => "SMALI",
            Self::Smithy => "SMITHY",
            Self::Solidity => "SOLIDITY",
            Self::Sql => "SQL",
            Self::Squirrel => "SQUIRREL",
            Self::Starlark => "STARLARK",
            Self::Svelte => "SVELTE",
            Self::Sway => "SWAY",
            Self::Swift => "SWIFT",
            Self::SystemVerilog => "SYSTEMVERILOG",
            Self::TableGen => "TABLEGEN",
            Self::Tcl => "TCL",
            Self::Teal => "TEAL",
            Self::Templ => "TEMPL",
            Self::Thrift => "THRIFT",
            Self::Tlaplus => "TLAPLUS",
            Self::Toml => "TOML",
            Self::Tsx => "TSX",
            Self::TypeScript => "TYPESCRIPT",
            Self::Typst => "TYPST",
            Self::VHDL => "VHDL",
            Self::Verilog => "VERILOG",
            Self::Vim => "VIM",
            Self::Vue => "VUE",
            Self::WGSL => "WGSL",
            Self::WIT => "WIT",
            Self::Wolfram => "WOLFRAM",
            Self::Xml => "XML",
            Self::Yaml => "YAML",
            Self::Zig => "ZIG",
            Self::Zsh => "ZSH",
            Self::Unknown => "UNKNOWN",
        }
    }

    /// Root tree-sitter node kind for this language's translation unit.
    #[must_use]
    pub const fn module_root(self) -> &'static str {
        match self {
            Self::AWK => "program",
            Self::Ada => "compilation",
            Self::Agda => "source_file",
            Self::Apex => "parser_output",
            Self::Assembly => "program",
            Self::Astro => "document",
            Self::Bash => "program",
            Self::Beancount => "file",
            Self::BibTeX => "document",
            Self::Bicep => "program",
            Self::BitBake => "source_file",
            Self::Blade => "document",
            Self::C => "translation_unit",
            Self::CFML => "program",
            Self::CFScript => "source_file",
            Self::CMake => "source_file",
            Self::COBOL => "source_file",
            Self::CSS => "stylesheet",
            Self::CSV => "document",
            Self::CSharp => "source_file",
            Self::Cairo => "source_file",
            Self::Capnp => "source",
            Self::Clojure => "source",
            Self::CommonLisp => "source",
            Self::Cpp => "translation_unit",
            Self::Crystal => "program",
            Self::Cuda => "source_file",
            Self::D => "source_file",
            Self::Dart => "program",
            Self::DeviceTree => "document",
            Self::Diff => "source",
            Self::Dockerfile => "source_file",
            Self::DotEnv => "source_file",
            Self::Elixir => "source",
            Self::Elm => "file",
            Self::EmacsLisp => "source_file",
            Self::Erlang => "source_file",
            Self::Fennel => "program",
            Self::Fish => "program",
            Self::Form => "source_file",
            Self::Fortran => "translation_unit",
            Self::Fsharp => "file",
            Self::FunC => "source_file",
            Self::GDScript => "source_file",
            Self::GLSL => "source_file",
            Self::GN => "source_file",
            Self::GitAttributes => "source",
            Self::Gitignore => "document",
            Self::Gleam => "source_file",
            Self::Go => "source_file",
            Self::GoTemplate => "template",
            Self::Gomod => "source_file",
            Self::GraphQL => "document",
            Self::Groovy => "source_file",
            Self::HCL => "config_file",
            Self::HLSL => "translation_unit",
            Self::HTML => "document",
            Self::Hare => "source_file",
            Self::Haskell => "haskell",
            Self::Hyprlang => "source_file",
            Self::INI => "document",
            Self::ISPC => "translation_unit",
            Self::JSDoc => "document",
            Self::JSON => "document",
            Self::JSON5 => "document",
            Self::Janet => "source",
            Self::Java => "program",
            Self::JavaScript => "source_file",
            Self::Jinja2 => "source_file",
            Self::Jsonnet => "document",
            Self::Julia => "source_file",
            Self::Just => "source_file",
            Self::KDL => "document",
            Self::Kconfig => "source",
            Self::Kotlin => "source_file",
            Self::LLVMIR => "source_file",
            Self::Lean => "module",
            Self::LinkerScript => "source_file",
            Self::Liquid => "template",
            Self::Lua => "chunk",
            Self::Luau => "program",
            Self::Magma => "source_file",
            Self::Make => "source_file",
            Self::Markdown => "document",
            Self::Matlab => "source_file",
            Self::Mermaid => "source_file",
            Self::Meson => "source_file",
            Self::Mojo => "source_file",
            Self::Move => "source_file",
            Self::NASM => "source_file",
            Self::Nickel => "source_file",
            Self::Nix => "source_expression",
            Self::OCaml => "compilation_unit",
            Self::Objc => "translation_unit",
            Self::ObjectScriptRoutine => "source_file",
            Self::ObjectScriptUDL => "source_file",
            Self::Odin => "source_file",
            Self::PO => "source_file",
            Self::Pascal => "source_file",
            Self::Perl => "source_file",
            Self::Php => "program",
            Self::PineScript => "source_file",
            Self::Pkl => "module",
            Self::Pony => "source_file",
            Self::PowerShell => "program",
            Self::Prisma => "program",
            Self::Properties => "source_file",
            Self::Protobuf => "source_file",
            Self::Puppet => "source_file",
            Self::PureScript => "module",
            Self::Python => "source_file",
            Self::Qml => "source_file",
            Self::R => "program",
            Self::RON => "source_file",
            Self::Racket => "program",
            Self::ReScript => "source_file",
            Self::ReStructuredText => "document",
            Self::Regex => "pattern",
            Self::Requirements => "file",
            Self::Ruby => "program",
            Self::Rust => "source_file",
            Self::SCSS => "stylesheet",
            Self::SOQL => "source_file",
            Self::SOSL => "source_file",
            Self::SSHConfig => "source_file",
            Self::Scala => "compilation_unit",
            Self::Scheme => "program",
            Self::Slang => "source_file",
            Self::Smali => "source_file",
            Self::Smithy => "source_file",
            Self::Solidity => "source_file",
            Self::Sql => "program",
            Self::Squirrel => "source_file",
            Self::Starlark => "module",
            Self::Svelte => "document",
            Self::Sway => "source_file",
            Self::Swift => "source_file",
            Self::SystemVerilog => "source_file",
            Self::TableGen => "source_file",
            Self::Tcl => "source_file",
            Self::Teal => "program",
            Self::Templ => "source_file",
            Self::Thrift => "document",
            Self::Tlaplus => "source_file",
            Self::Toml => "document",
            Self::Tsx => "source_file",
            Self::TypeScript => "source_file",
            Self::Typst => "source_file",
            Self::VHDL => "design_file",
            Self::Verilog => "source_file",
            Self::Vim => "script_file",
            Self::Vue => "document",
            Self::WGSL => "translation_unit",
            Self::WIT => "source_file",
            Self::Wolfram => "source_file",
            Self::Xml => "document",
            Self::Yaml => "stream",
            Self::Zig => "source_file",
            Self::Zsh => "program",
            Self::Unknown => "",
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
