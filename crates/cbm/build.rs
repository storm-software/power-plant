use std::env;
use std::path::{Path, PathBuf};

fn main() {
    println!("cargo::rustc-check-cfg=cfg(cbm_native)");

    let target = env::var("TARGET").unwrap_or_default();
    if target.contains("wasm") {
        return;
    }

    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
    let vendored = manifest_dir.join("vendored");
    let ffi = manifest_dir.join("ffi");

    let mut build = cc::Build::new();
    build
        .std("c11")
        .flag_if_supported("-Wno-unused-parameter")
        .flag_if_supported("-Wno-sign-compare")
        .define("_DEFAULT_SOURCE", None)
        .define("_GNU_SOURCE", None)
        .define("CBM_BIND_TS_ALLOCATOR", "0")
        .flag(format!(
            "-include{}",
            vendored.join("foundation/constants.h").display()
        ))
        .include(&ffi)
        .include(&vendored)
        .include(vendored.join("ts_runtime/include"))
        .include(vendored.join("ts_runtime/src"))
        .include(vendored.join("verstable"));

    for src in extraction_sources(&manifest_dir) {
        build.file(&src);
    }

    build.compile("cbm_extract");

    cc::Build::new()
        .cpp(true)
        .std("c++14")
        .flag_if_supported("-Wno-unused-parameter")
        .define("_DEFAULT_SOURCE", None)
        .define("_GNU_SOURCE", None)
        .include(&vendored)
        .file(vendored.join("preprocessor.cpp"))
        .compile("cbm_preprocess");

    println!("cargo:rustc-link-lib=z");
    println!("cargo:rustc-link-lib=stdc++");
    println!("cargo:rustc-link-lib=pthread");
    println!("cargo:rustc-cfg=cbm_native");
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=ffi/bindings.h");
    println!("cargo:rerun-if-changed=ffi/mimalloc.h");
    println!("cargo:rerun-if-changed=ffi/lsp_extract.c");

    for src in extraction_sources(&manifest_dir) {
        println!("cargo:rerun-if-changed={}", src.display());
    }

    let bindings = bindgen::Builder::default()
        .header(ffi.join("bindings.h").to_string_lossy())
        .clang_arg(format!("-I{}", vendored.display()))
        .clang_arg(format!(
            "-I{}",
            vendored.join("ts_runtime/include").display()
        ))
        .clang_arg("-DCBM_BIND_TS_ALLOCATOR=0")
        .allowlist_function("cbm_.*")
        .allowlist_type("CBM.*")
        .allowlist_var("CBM_.*")
        .default_enum_style(bindgen::EnumVariation::ModuleConsts)
        .allowlist_type("TSTree")
        .allowlist_type("TSNode")
        .opaque_type("TSTree")
        .opaque_type("TSNode")
        .opaque_type("CBMExtractCtx")
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .generate()
        .expect("cbm bindgen failed");

    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    bindings
        .write_to_file(out_dir.join("bindings.rs"))
        .expect("write cbm bindings.rs failed");
}
    
fn extraction_sources(manifest_dir: &Path) -> Vec<PathBuf> {
    let ffi = manifest_dir.join("ffi");
    let vendored = manifest_dir.join("vendored");
    let foundation = vendored.join("foundation");

    let mut sources = vec![
        vendored.join("cbm.c"),
        vendored.join("extract_defs.c"),
        vendored.join("extract_calls.c"),
        vendored.join("extract_imports.c"),
        vendored.join("extract_usages.c"),
        vendored.join("extract_unified.c"),
        vendored.join("extract_semantic.c"),
        vendored.join("extract_type_refs.c"),
        vendored.join("extract_type_assigns.c"),
        vendored.join("extract_env_accesses.c"),
        vendored.join("extract_channels.c"),
        vendored.join("extract_k8s.c"),
        vendored.join("helpers.c"),
        vendored.join("lang_specs.c"),
        vendored.join("service_patterns.c"),
        vendored.join("arena.c"),
        ffi.join("lsp_extract.c"),
        vendored.join("ts_runtime.c"),
        foundation.join("compat.c"),
        foundation.join("compat_fs.c"),
        foundation.join("hash_table.c"),
        foundation.join("platform.c"),
        foundation.join("log.c"),
    ];

    sources.extend(pipeline_grammars(&vendored));
    sources
}

fn pipeline_grammars(vendored: &Path) -> Vec<PathBuf> {
    const GRAMMARS: &[&str] = &[
        "grammar_go.c",
        "grammar_python.c",
        "grammar_javascript.c",
        "grammar_typescript.c",
        "grammar_tsx.c",
        "grammar_rust.c",
        "grammar_java.c",
        "grammar_c_sharp.c",
        "grammar_php.c",
        "grammar_c.c",
        "grammar_cpp.c",
        "grammar_yaml.c",
        "grammar_gomod.c",
        "grammar_requirements.c",
    ];
    GRAMMARS
        .iter()
        .map(|name| vendored.join(name))
        .collect()
}
