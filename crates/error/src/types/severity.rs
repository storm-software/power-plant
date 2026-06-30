use derive_more::Debug;

#[derive(Default, Clone, Debug, Copy, PartialEq, Eq)]
pub enum Severity {
  #[default]
  Error,
  Warning,
}
