use std::{borrow::Cow, fmt::Display};

use crate::{
  PowerPlantDiagnostic, diagnostic,
  types::{diagnostic_options::DiagnosticOptions, issue_kind::IssueKind},
};

use super::Issue;

#[derive(Debug, Clone)]
pub struct CausedPlugin {
  pub name: Cow<'static, str>,
}

impl CausedPlugin {
  pub fn new(name: Cow<'static, str>) -> Self {
    Self { name }
  }
}

impl Display for CausedPlugin {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "plugin `{}` threw an error", self.name)
  }
}

#[derive(Debug)]
pub struct PluginError {
  pub(crate) plugin: CausedPlugin,
  pub(crate) error: anyhow::Error,
}

impl Issue for PluginError {
  fn kind(&self) -> IssueKind {
    IssueKind::PluginError
  }

  fn message(&self, _opts: &DiagnosticOptions) -> String {
    if self.error.downcast_ref::<PowerPlantDiagnostic>().is_some() {
      String::default()
    } else {
      format!("{:?}", self.error)
    }
  }

  fn on_diagnostic(&self, diagnostic: &mut diagnostic::Diagnostic, opts: &DiagnosticOptions) {
    if let Some(err) = self.error.downcast_ref::<PowerPlantDiagnostic>() {
      *diagnostic = err.to_diagnostic_with(opts);
    }
    diagnostic.kind = self.plugin.name.to_string();
  }
}
