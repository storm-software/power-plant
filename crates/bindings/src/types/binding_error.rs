#![expect(clippy::missing_debug_implementations)]

use napi::Either;

/// Error emitted from native side, it only contains kind and message, no stack trace.
#[napi_derive::napi(object, object_from_js = false)]
#[derive(Debug)]
pub struct NativeError {
  pub kind: String,
  pub message: String,
}

#[napi_derive::napi(discriminant = "type", object_from_js = false)]
pub enum BindingError {
  JsError(napi::JsError),
  NativeError(NativeError),
}

#[napi_derive::napi(object, object_from_js = false)]
pub struct BindingErrors {
  pub errors: Vec<BindingError>,
  pub is_binding_errors: bool,
}

impl BindingErrors {
  pub fn new(errors: Vec<BindingError>) -> Self {
    Self { errors, is_binding_errors: true }
  }
}

pub type BindingResult<T> = Either<BindingErrors, T>;
