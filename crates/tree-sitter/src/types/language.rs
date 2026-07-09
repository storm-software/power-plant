/// Source language for extraction.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
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

        if lowered_file_path.ends_with(".awk") { return Self::AWK; }
        if lowered_file_path.ends_with(".adb") { return Self::Ada; }
        if lowered_file_path.ends_with(".ads") { return Self::Ada; }
        if lowered_file_path.ends_with(".agda") { return Self::Agda; }
        if lowered_file_path.ends_with(".cls") { return Self::Apex; }
        if lowered_file_path.ends_with(".trigger") { return Self::Apex; }
        if lowered_file_path.ends_with(".s") { return Self::Assembly; }
        if lowered_file_path.ends_with(".astro") { return Self::Astro; }
        if lowered_file_path.ends_with(".bash") { return Self::Bash; }
        if lowered_file_path.ends_with(".sh") { return Self::Bash; }
        if lowered_file_path.ends_with(".beancount") { return Self::Beancount; }
        if lowered_file_path.ends_with(".bib") { return Self::BibTeX; }
        if lowered_file_path.ends_with(".bicep") { return Self::Bicep; }
        if lowered_file_path.ends_with(".bb") { return Self::BitBake; }
        if lowered_file_path.ends_with(".bbclass") { return Self::BitBake; }
        if lowered_file_path.ends_with(".bbappend") { return Self::BitBake; }
        if lowered_file_path.ends_with(".blade.php") { return Self::Blade; }
        if lowered_file_path.ends_with(".c") { return Self::C; }
        if lowered_file_path.ends_with(".h") { return Self::C; }
        if lowered_file_path.ends_with(".cfm") { return Self::CFML; }
        if lowered_file_path.ends_with(".cfc") { return Self::CFScript; }
        if lowered_file_path.ends_with(".cmake") { return Self::CMake; }
        if lowered_file_path.ends_with(".cbl") { return Self::COBOL; }
        if lowered_file_path.ends_with(".cob") { return Self::COBOL; }
        if lowered_file_path.ends_with(".css") { return Self::CSS; }
        if lowered_file_path.ends_with(".csv") { return Self::CSV; }
        if lowered_file_path.ends_with(".cs") { return Self::CSharp; }
        if lowered_file_path.ends_with(".cairo") { return Self::Cairo; }
        if lowered_file_path.ends_with(".capnp") { return Self::Capnp; }
        if lowered_file_path.ends_with(".clj") { return Self::Clojure; }
        if lowered_file_path.ends_with(".cljc") { return Self::Clojure; }
        if lowered_file_path.ends_with(".cljs") { return Self::Clojure; }
        if lowered_file_path.ends_with(".lisp") { return Self::CommonLisp; }
        if lowered_file_path.ends_with(".lsp") { return Self::CommonLisp; }
        if lowered_file_path.ends_with(".cc") { return Self::Cpp; }
        if lowered_file_path.ends_with(".cp") { return Self::Cpp; }
        if lowered_file_path.ends_with(".cpp") { return Self::Cpp; }
        if lowered_file_path.ends_with(".cxx") { return Self::Cpp; }
        if lowered_file_path.ends_with(".hpp") { return Self::Cpp; }
        if lowered_file_path.ends_with(".hxx") { return Self::Cpp; }
        if lowered_file_path.ends_with(".cr") { return Self::Crystal; }
        if lowered_file_path.ends_with(".cu") { return Self::Cuda; }
        if lowered_file_path.ends_with(".cuh") { return Self::Cuda; }
        if lowered_file_path.ends_with(".d") { return Self::D; }
        if lowered_file_path.ends_with(".dart") { return Self::Dart; }
        if lowered_file_path.ends_with(".dts") { return Self::DeviceTree; }
        if lowered_file_path.ends_with(".dtsi") { return Self::DeviceTree; }
        if lowered_file_path.ends_with(".overlay") { return Self::DeviceTree; }
        if lowered_file_path.ends_with(".diff") { return Self::Diff; }
        if lowered_file_path.ends_with(".patch") { return Self::Diff; }
        if lowered_file_path.ends_with(".env") { return Self::DotEnv; }
        if lowered_file_path.ends_with(".ex") { return Self::Elixir; }
        if lowered_file_path.ends_with(".exs") { return Self::Elixir; }
        if lowered_file_path.ends_with(".elm") { return Self::Elm; }
        if lowered_file_path.ends_with(".el") { return Self::EmacsLisp; }
        if lowered_file_path.ends_with(".erl") { return Self::Erlang; }
        if lowered_file_path.ends_with(".hrl") { return Self::Erlang; }
        if lowered_file_path.ends_with(".fnl") { return Self::Fennel; }
        if lowered_file_path.ends_with(".fish") { return Self::Fish; }
        if lowered_file_path.ends_with(".form") { return Self::Form; }
        if lowered_file_path.ends_with(".f") { return Self::Fortran; }
        if lowered_file_path.ends_with(".f90") { return Self::Fortran; }
        if lowered_file_path.ends_with(".f95") { return Self::Fortran; }
        if lowered_file_path.ends_with(".fs") { return Self::Fsharp; }
        if lowered_file_path.ends_with(".fsi") { return Self::Fsharp; }
        if lowered_file_path.ends_with(".fsx") { return Self::Fsharp; }
        if lowered_file_path.ends_with(".fc") { return Self::FunC; }
        if lowered_file_path.ends_with(".gd") { return Self::GDScript; }
        if lowered_file_path.ends_with(".frag") { return Self::GLSL; }
        if lowered_file_path.ends_with(".glsl") { return Self::GLSL; }
        if lowered_file_path.ends_with(".vert") { return Self::GLSL; }
        if lowered_file_path.ends_with(".gn") { return Self::GN; }
        if lowered_file_path.ends_with(".gni") { return Self::GN; }
        if lowered_file_path.ends_with(".gleam") { return Self::Gleam; }
        if lowered_file_path.ends_with(".go") { return Self::Go; }
        if lowered_file_path.ends_with(".tmpl") { return Self::GoTemplate; }
        if lowered_file_path.ends_with(".gotmpl") { return Self::GoTemplate; }
        if lowered_file_path.ends_with(".gql") { return Self::GraphQL; }
        if lowered_file_path.ends_with(".graphql") { return Self::GraphQL; }
        if lowered_file_path.ends_with(".gradle") { return Self::Groovy; }
        if lowered_file_path.ends_with(".groovy") { return Self::Groovy; }
        if lowered_file_path.ends_with(".hcl") { return Self::HCL; }
        if lowered_file_path.ends_with(".tf") { return Self::HCL; }
        if lowered_file_path.ends_with(".tfvars") { return Self::HCL; }
        if lowered_file_path.ends_with(".hlsl") { return Self::HLSL; }
        if lowered_file_path.ends_with(".hlsli") { return Self::HLSL; }
        if lowered_file_path.ends_with(".fx") { return Self::HLSL; }
        if lowered_file_path.ends_with(".htm") { return Self::HTML; }
        if lowered_file_path.ends_with(".html") { return Self::HTML; }
        if lowered_file_path.ends_with(".ha") { return Self::Hare; }
        if lowered_file_path.ends_with(".hs") { return Self::Haskell; }
        if lowered_file_path.ends_with(".hl") { return Self::Hyprlang; }
        if lowered_file_path.ends_with(".ini") { return Self::INI; }
        if lowered_file_path.ends_with(".ispc") { return Self::ISPC; }
        if lowered_file_path.ends_with(".json") { return Self::JSON; }
        if lowered_file_path.ends_with(".json5") { return Self::JSON5; }
        if lowered_file_path.ends_with(".janet") { return Self::Janet; }
        if lowered_file_path.ends_with(".java") { return Self::Java; }
        if lowered_file_path.ends_with(".cjs") { return Self::JavaScript; }
        if lowered_file_path.ends_with(".js") { return Self::JavaScript; }
        if lowered_file_path.ends_with(".mjs") { return Self::JavaScript; }
        if lowered_file_path.ends_with(".j2") { return Self::Jinja2; }
        if lowered_file_path.ends_with(".jinja2") { return Self::Jinja2; }
        if lowered_file_path.ends_with(".jinja") { return Self::Jinja2; }
        if lowered_file_path.ends_with(".jsonnet") { return Self::Jsonnet; }
        if lowered_file_path.ends_with(".libsonnet") { return Self::Jsonnet; }
        if lowered_file_path.ends_with(".jl") { return Self::Julia; }
        if lowered_file_path.ends_with(".kdl") { return Self::KDL; }
        if lowered_file_path.ends_with(".kt") { return Self::Kotlin; }
        if lowered_file_path.ends_with(".kts") { return Self::Kotlin; }
        if lowered_file_path.ends_with(".ll") { return Self::LLVMIR; }
        if lowered_file_path.ends_with(".lean") { return Self::Lean; }
        if lowered_file_path.ends_with(".ld") { return Self::LinkerScript; }
        if lowered_file_path.ends_with(".lds") { return Self::LinkerScript; }
        if lowered_file_path.ends_with(".liquid") { return Self::Liquid; }
        if lowered_file_path.ends_with(".lua") { return Self::Lua; }
        if lowered_file_path.ends_with(".luau") { return Self::Luau; }
        if lowered_file_path.ends_with(".md") { return Self::Markdown; }
        if lowered_file_path.ends_with(".mdx") { return Self::Markdown; }
        if lowered_file_path.ends_with(".markdown") { return Self::Markdown; }
        if lowered_file_path.ends_with(".mat") { return Self::Matlab; }
        if lowered_file_path.ends_with(".mmd") { return Self::Mermaid; }
        if lowered_file_path.ends_with(".mermaid") { return Self::Mermaid; }
        if lowered_file_path.ends_with(".meson") { return Self::Meson; }
        if lowered_file_path.ends_with(".mojo") { return Self::Mojo; }
        if lowered_file_path.ends_with(".move") { return Self::Move; }
        if lowered_file_path.ends_with(".nasm") { return Self::NASM; }
        if lowered_file_path.ends_with(".ncl") { return Self::Nickel; }
        if lowered_file_path.ends_with(".nix") { return Self::Nix; }
        if lowered_file_path.ends_with(".ml") { return Self::OCaml; }
        if lowered_file_path.ends_with(".mli") { return Self::OCaml; }
        if lowered_file_path.ends_with(".m") { return Self::Objc; }
        if lowered_file_path.ends_with(".mac") { return Self::ObjectScriptRoutine; }
        if lowered_file_path.ends_with(".odin") { return Self::Odin; }
        if lowered_file_path.ends_with(".po") { return Self::PO; }
        if lowered_file_path.ends_with(".pot") { return Self::PO; }
        if lowered_file_path.ends_with(".pas") { return Self::Pascal; }
        if lowered_file_path.ends_with(".lpr") { return Self::Pascal; }
        if lowered_file_path.ends_with(".dpr") { return Self::Pascal; }
        if lowered_file_path.ends_with(".pl") { return Self::Perl; }
        if lowered_file_path.ends_with(".pm") { return Self::Perl; }
        if lowered_file_path.ends_with(".php") { return Self::Php; }
        if lowered_file_path.ends_with(".pine") { return Self::PineScript; }
        if lowered_file_path.ends_with(".pkl") { return Self::Pkl; }
        if lowered_file_path.ends_with(".pony") { return Self::Pony; }
        if lowered_file_path.ends_with(".ps1") { return Self::PowerShell; }
        if lowered_file_path.ends_with(".psm1") { return Self::PowerShell; }
        if lowered_file_path.ends_with(".psd1") { return Self::PowerShell; }
        if lowered_file_path.ends_with(".prisma") { return Self::Prisma; }
        if lowered_file_path.ends_with(".properties") { return Self::Properties; }
        if lowered_file_path.ends_with(".proto") { return Self::Protobuf; }
        if lowered_file_path.ends_with(".pp") { return Self::Puppet; }
        if lowered_file_path.ends_with(".purs") { return Self::PureScript; }
        if lowered_file_path.ends_with(".py") { return Self::Python; }
        if lowered_file_path.ends_with(".qml") { return Self::Qml; }
        if lowered_file_path.ends_with(".r") { return Self::R; }
        if lowered_file_path.ends_with(".ron") { return Self::RON; }
        if lowered_file_path.ends_with(".rkt") { return Self::Racket; }
        if lowered_file_path.ends_with(".res") { return Self::ReScript; }
        if lowered_file_path.ends_with(".resi") { return Self::ReScript; }
        if lowered_file_path.ends_with(".rst") { return Self::ReStructuredText; }
        if lowered_file_path.ends_with(".rb") { return Self::Ruby; }
        if lowered_file_path.ends_with(".rs") { return Self::Rust; }
        if lowered_file_path.ends_with(".scss") { return Self::SCSS; }
        if lowered_file_path.ends_with(".soql") { return Self::SOQL; }
        if lowered_file_path.ends_with(".sosl") { return Self::SOSL; }
        if lowered_file_path.ends_with(".scala") { return Self::Scala; }
        if lowered_file_path.ends_with(".scm") { return Self::Scheme; }
        if lowered_file_path.ends_with(".ss") { return Self::Scheme; }
        if lowered_file_path.ends_with(".slang") { return Self::Slang; }
        if lowered_file_path.ends_with(".smali") { return Self::Smali; }
        if lowered_file_path.ends_with(".smithy") { return Self::Smithy; }
        if lowered_file_path.ends_with(".sol") { return Self::Solidity; }
        if lowered_file_path.ends_with(".sql") { return Self::Sql; }
        if lowered_file_path.ends_with(".nut") { return Self::Squirrel; }
        if lowered_file_path.ends_with(".star") { return Self::Starlark; }
        if lowered_file_path.ends_with(".bzl") { return Self::Starlark; }
        if lowered_file_path.ends_with(".svelte") { return Self::Svelte; }
        if lowered_file_path.ends_with(".sw") { return Self::Sway; }
        if lowered_file_path.ends_with(".swift") { return Self::Swift; }
        if lowered_file_path.ends_with(".sv") { return Self::SystemVerilog; }
        if lowered_file_path.ends_with(".svh") { return Self::SystemVerilog; }
        if lowered_file_path.ends_with(".td") { return Self::TableGen; }
        if lowered_file_path.ends_with(".tcl") { return Self::Tcl; }
        if lowered_file_path.ends_with(".tl") { return Self::Teal; }
        if lowered_file_path.ends_with(".templ") { return Self::Templ; }
        if lowered_file_path.ends_with(".thrift") { return Self::Thrift; }
        if lowered_file_path.ends_with(".tla") { return Self::Tlaplus; }
        if lowered_file_path.ends_with(".toml") { return Self::Toml; }
        if lowered_file_path.ends_with(".tsx") { return Self::Tsx; }
        if lowered_file_path.ends_with(".ts") { return Self::TypeScript; }
        if lowered_file_path.ends_with(".typ") { return Self::Typst; }
        if lowered_file_path.ends_with(".vhd") { return Self::VHDL; }
        if lowered_file_path.ends_with(".vhdl") { return Self::VHDL; }
        if lowered_file_path.ends_with(".v") { return Self::Verilog; }
        if lowered_file_path.ends_with(".vim") { return Self::Vim; }
        if lowered_file_path.ends_with(".vue") { return Self::Vue; }
        if lowered_file_path.ends_with(".wgsl") { return Self::WGSL; }
        if lowered_file_path.ends_with(".wit") { return Self::WIT; }
        if lowered_file_path.ends_with(".wl") { return Self::Wolfram; }
        if lowered_file_path.ends_with(".wls") { return Self::Wolfram; }
        if lowered_file_path.ends_with(".xml") { return Self::Xml; }
        if lowered_file_path.ends_with(".yaml") { return Self::Yaml; }
        if lowered_file_path.ends_with(".yml") { return Self::Yaml; }
        if lowered_file_path.ends_with(".zig") { return Self::Zig; }
        if lowered_file_path.ends_with(".zsh") { return Self::Zsh; }

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
