//! Safe wrapper around `cbm_extract_file` / `cbm_free_result`.

#![allow(unsafe_op_in_unsafe_fn)]

use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::sync::OnceLock;

use super::error::{PipelineError, PipelineResult};
use super::extract::{
    CallSite, Channel, ChannelDirection, Definition, EnvAccess, Extractor, FileResult, ImplTrait,
    Import, ReadWriteAccess, ResolvedCall, ThrowSite, Usage, EXTRACT_BUDGET,
};
use super::types::Language;

include!(concat!(env!("OUT_DIR"), "/bindings.rs"));

static INIT: OnceLock<PipelineResult<()>> = OnceLock::new();

fn ensure_init() -> PipelineResult<()> {
    INIT.get_or_init(|| {
        let rc = unsafe { cbm_init() };
        if rc == 0 {
            Ok(())
        } else {
            Err(PipelineError::Other("cbm_init failed".into()))
        }
    })
    .clone()
}

/// Tree-sitter extraction via vendored CBM (`cbm_extract_file`).
#[derive(Debug, Default, Clone, Copy)]
pub struct CbmExtractor;

impl Extractor for CbmExtractor {
    fn extract_file(
        &self,
        source: &[u8],
        language: Language,
        project: &str,
        rel_path: &str,
    ) -> PipelineResult<FileResult> {
        ensure_init()?;

        let cbm_lang = language_to_cbm(language).ok_or_else(|| {
            PipelineError::Other(format!("unsupported extraction language: {language:?}"))
        })?;

        let project_c = CString::new(project)
            .map_err(|_| PipelineError::Other("project name contains NUL".into()))?;
        let rel_path_c = CString::new(rel_path)
            .map_err(|_| PipelineError::Other("relative path contains NUL".into()))?;

        let timeout_micros = i64::try_from(EXTRACT_BUDGET).unwrap_or(i64::MAX);
        let source_ptr = source.as_ptr().cast::<c_char>();

        let raw = unsafe {
            cbm_extract_file(
                source_ptr,
                source.len() as i32,
                cbm_lang,
                project_c.as_ptr(),
                rel_path_c.as_ptr(),
                timeout_micros,
                std::ptr::null_mut(),
                std::ptr::null_mut(),
            )
        };

        if raw.is_null() {
            return Err(PipelineError::Other(
                "cbm_extract_file returned NULL (OOM)".into(),
            ));
        }

        let result = unsafe { convert_file_result(&*raw) };
        unsafe { cbm_free_result(raw) };
        Ok(result)
    }
}

fn language_to_cbm(language: Language) -> Option<CBMLanguage::Type> {
    use CBMLanguage::*;
    Some(match language {
        Language::Go => CBM_LANG_GO,
        Language::Python => CBM_LANG_PYTHON,
        Language::JavaScript => CBM_LANG_JAVASCRIPT,
        Language::TypeScript => CBM_LANG_TYPESCRIPT,
        Language::Tsx => CBM_LANG_TSX,
        Language::Rust => CBM_LANG_RUST,
        Language::Java => CBM_LANG_JAVA,
        Language::CSharp => CBM_LANG_CSHARP,
        Language::Php => CBM_LANG_PHP,
        Language::C => CBM_LANG_C,
        Language::Yaml => CBM_LANG_YAML,
        Language::Gomod => CBM_LANG_GOMOD,
        Language::Requirements => CBM_LANG_REQUIREMENTS,
        Language::K8s => CBM_LANG_K8S,
        Language::Unknown => return None,
    })
}

unsafe fn convert_file_result(raw: &CBMFileResult) -> FileResult {
    FileResult {
        has_error: raw.has_error,
        error_msg: c_str_opt(raw.error_msg),
        defs: convert_defs(&raw.defs),
        calls: convert_calls(&raw.calls),
        resolved_calls: convert_resolved_calls(&raw.resolved_calls),
        imports: convert_imports(&raw.imports),
        usages: convert_usages(&raw.usages),
        throws: convert_throws(&raw.throws),
        rw: convert_rw(&raw.rw),
        channels: convert_channels(&raw.channels),
        env_accesses: convert_env_accesses(&raw.env_accesses),
        impl_traits: convert_impl_traits(&raw.impl_traits),
    }
}

unsafe fn convert_defs(arr: &CBMDefArray) -> Vec<Definition> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|def| unsafe { convert_definition(def) })
        .collect()
}

unsafe fn convert_definition(def: &CBMDefinition) -> Definition {
    Definition {
        name: c_str_to_string(def.name),
        qualified_name: c_str_to_string(def.qualified_name),
        label: c_str_to_string(def.label),
        file_path: c_str_opt(def.file_path),
        start_line: def.start_line,
        end_line: def.end_line,
        signature: c_str_opt(def.signature),
        return_type: c_str_opt(def.return_type),
        parent_class: c_str_opt(def.parent_class),
        decorators: c_str_array(def.decorators),
        base_classes: c_str_array(def.base_classes),
        complexity: def.complexity,
        lines: def.lines,
        is_exported: def.is_exported,
        is_test: def.is_test,
        is_entry_point: def.is_entry_point,
    }
}

unsafe fn convert_calls(arr: &CBMCallArray) -> Vec<CallSite> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|call| CallSite {
            callee_name: c_str_to_string(call.callee_name),
            enclosing_func_qn: c_str_opt(call.enclosing_func_qn),
            is_method: call.is_method,
        })
        .collect()
}

unsafe fn convert_resolved_calls(arr: &CBMResolvedCallArray) -> Vec<ResolvedCall> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|rc| ResolvedCall {
            callee_name: short_name(c_str_to_string(rc.callee_qn)),
            qualified_name: c_str_to_string(rc.callee_qn),
            strategy: c_str_to_string(rc.strategy),
            confidence: f64::from(rc.confidence),
        })
        .collect()
}

unsafe fn convert_imports(arr: &CBMImportArray) -> Vec<Import> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|imp| Import {
            module_path: c_str_to_string(imp.module_path),
            local_name: c_str_opt(imp.local_name),
            namespace: None,
        })
        .collect()
}

unsafe fn convert_usages(arr: &CBMUsageArray) -> Vec<Usage> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|usage| Usage {
            type_name: c_str_to_string(usage.ref_name),
            enclosing_func_qn: c_str_opt(usage.enclosing_func_qn),
        })
        .collect()
}

unsafe fn convert_throws(arr: &CBMThrowArray) -> Vec<ThrowSite> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|thr| ThrowSite {
            exception_type: c_str_to_string(thr.exception_name),
            enclosing_func_qn: c_str_opt(thr.enclosing_func_qn),
        })
        .collect()
}

unsafe fn convert_rw(arr: &CBMRWArray) -> Vec<ReadWriteAccess> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|rw| ReadWriteAccess {
            var_name: c_str_to_string(rw.var_name),
            enclosing_func_qn: c_str_opt(rw.enclosing_func_qn),
            is_write: rw.is_write,
        })
        .collect()
}

unsafe fn convert_channels(arr: &CBMChannelArray) -> Vec<Channel> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|ch| Channel {
            channel_name: c_str_to_string(ch.channel_name),
            transport: c_str_opt(ch.transport),
            direction: if ch.direction == CBMChannelDirection::CBM_CHANNEL_LISTEN {
                ChannelDirection::Listen
            } else {
                ChannelDirection::Emit
            },
            enclosing_func_qn: c_str_opt(ch.enclosing_func_qn),
        })
        .collect()
}

unsafe fn convert_env_accesses(arr: &CBMEnvAccessArray) -> Vec<EnvAccess> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|ea| EnvAccess {
            env_key: c_str_to_string(ea.env_key),
            enclosing_func_qn: c_str_opt(ea.enclosing_func_qn),
        })
        .collect()
}

unsafe fn convert_impl_traits(arr: &CBMImplTraitArray) -> Vec<ImplTrait> {
    if arr.items.is_null() || arr.count <= 0 {
        return Vec::new();
    }
    let slice = std::slice::from_raw_parts(arr.items, arr.count as usize);
    slice
        .iter()
        .map(|it| ImplTrait {
            trait_qn: c_str_to_string(it.trait_name),
            type_qn: c_str_to_string(it.struct_name),
        })
        .collect()
}

unsafe fn c_str_to_string(ptr: *const c_char) -> String {
    if ptr.is_null() {
        return String::new();
    }
    CStr::from_ptr(ptr).to_string_lossy().into_owned()
}

unsafe fn c_str_opt(ptr: *const c_char) -> Option<String> {
    if ptr.is_null() {
        None
    } else {
        Some(c_str_to_string(ptr))
    }
}

unsafe fn c_str_array(ptr: *const *const c_char) -> Vec<String> {
    if ptr.is_null() {
        return Vec::new();
    }
    let mut out = Vec::new();
    let mut i = 0;
    loop {
        let entry = *ptr.add(i);
        if entry.is_null() {
            break;
        }
        out.push(c_str_to_string(entry));
        i += 1;
    }
    out
}

fn short_name(qualified: String) -> String {
    qualified
        .rsplit('.')
        .next()
        .unwrap_or(qualified.as_str())
        .to_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_rust_fn() {
        let _ = CbmExtractor;
        ensure_init().expect("cbm_init");

        let source = br#"
pub fn hello() -> i32 {
    42
}
"#;
        let result = CbmExtractor
            .extract_file(source, Language::Rust, "demo", "lib.rs")
            .expect("extract");

        assert!(!result.has_error, "{:?}", result.error_msg);
        assert!(
            result.defs.iter().any(|d| d.name == "hello"),
            "defs: {:?}",
            result
                .defs
                .iter()
                .map(|d| &d.name)
                .collect::<Vec<_>>()
        );
    }
}
