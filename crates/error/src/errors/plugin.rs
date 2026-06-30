use std::{borrow::Cow, fmt::Display};

#[derive(Debug, Clone)]
pub struct PluginError {
  pub name: Cow<'static, str>,
}

impl PluginError {
  pub fn new(name: Cow<'static, str>) -> Self {
    Self { name }
  }
}

impl Display for PluginError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "caused by plugin `{}`", self.name)
  }
}
