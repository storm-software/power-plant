use std::fmt::Debug;

use crate::{Diagnostic, DiagnosticOptions, IssueKind};
use arcstr::ArcStr;
use oxc::span::Span;

#[cfg(feature = "napi")]
pub mod napi_error;

pub mod circular_dependency;
pub mod path_is_not_valid_utf8;
pub mod plugin_error;
pub mod unable_to_read_dir;
pub mod unable_to_read_file;
pub mod unable_to_strip_root_prefix;
pub mod unhandleable_error;

pub trait Issue: Debug + Sync + Send {
  fn kind(&self) -> IssueKind;

  fn message(&self, opts: &DiagnosticOptions) -> String;

  fn on_diagnostic(&self, _diagnostic: &mut Diagnostic, _opts: &DiagnosticOptions) {}

  // extra properties to match `RollupLog` interface
  // https://rollupjs.org/configuration-options/#onlog
  fn id(&self) -> Option<String> {
    None
  }

  fn exporter(&self) -> Option<String> {
    None
  }

  #[cfg(feature = "napi")]
  fn as_napi_error(&self) -> Option<&napi::Error> {
    None
  }
}

impl<T: Issue + 'static> From<T> for Box<dyn Issue>
where
  Self: Sized,
{
  fn from(e: T) -> Self {
    Box::new(e)
  }
}

/// A Hybrid string type used for diagnostic, e.g.
/// for `UnresolvedError`, a specifier could be either a slice from raw source, or
/// created during ast transformation. When the specifier came from raw source, we could
/// use the `Span` information to give user better DX, otherwise, we could just use the string to
/// create a fallback message.
/// ## Panic
/// they type is only used for store information, user should check the span could be referenced
/// the raw source, or the user side may panic.
#[derive(Debug)]
pub enum DiagnosableArcstr {
  String(ArcStr),
  Span(Span),
}
