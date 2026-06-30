/// Debug utilities.
use regex::Regex;
use std::borrow::Cow;
use std::sync::LazyLock;

static MODULE_MATCHER_RE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"(?:\w+::)").unwrap());

/// Get a pretty type name for a given type `T`.
/// This function removes module paths from the type name
/// to make it more readable.
pub fn pretty_type_name<T: ?Sized>() -> Cow<'static, str> {
  let type_name = std::any::type_name::<T>();
  prettify_type_name(type_name)
}

fn prettify_type_name(name: &str) -> Cow<'_, str> {
  MODULE_MATCHER_RE.replace_all(name, "")
}

#[test]
fn test_pretty_type_name() {
  struct Custom;
  assert_eq!(pretty_type_name::<std::option::Option<std::string::String>>(), "Option<String>");
  assert_eq!(pretty_type_name::<std::option::Option<Custom>>(), "Option<Custom>");
}

#[test]
fn test_prettify_type_name() {
  assert_eq!(
    prettify_type_name(
      "napi::threadsafe_function::ThreadsafeFunction<rolldown_binding::types::binding_rendered_chunk::RenderedChunk, napi::bindgen_runtime::js_values::either::Either<napi::bindgen_runtime::js_values::either::Either<napi::bindgen_runtime::js_values::promise::Promise<core::option::Option<alloc::string::String>>, core::option::Option<alloc::string::String>>, napi::threadsafe_function::UnknownReturnValue>, false>"
    ),
    "ThreadsafeFunction<RenderedChunk, Either<Either<Promise<Option<String>>, Option<String>>, UnknownReturnValue>, false>"
  );
}
