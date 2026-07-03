use crate::{NormalizedOptions, Options};

/// Context for the current Power Plant process, including options and workspace configuration.
#[derive(Debug, Clone)]
pub struct Context {
  /// Configuration options for the current context.
  pub user_options: Options,
  /// Normalized configuration options for the current context.
  pub options: NormalizedOptions,
}

impl Context {
  /// Create a new Context from the given Options.
  pub fn new(options: Options) -> Self {
    let normalized_options = NormalizedOptions::from(options.clone());

    Self { user_options: options, options: normalized_options }
  }
}
