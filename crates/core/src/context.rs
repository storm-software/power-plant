use crate::{NormalizedOptions, Options, Repository, session::Session, settings::Settings};

/// Context for the current Power Plant process, including options and workspace configuration.
#[derive(Debug, Clone)]
pub struct Context {
  /// Configuration options for the current context.
  pub user_options: Options,
  /// Normalized configuration options for the current context.
  pub options: NormalizedOptions,
  /// Settings for the current context.
  pub settings: Settings,
  /// Information about the current session, including user and device information.
  pub session: Session,
  /// The current workspace.
  pub repository: Repository,
}

impl Context {
  /// Create a new Context from the given Options.
  pub fn new(options: Options) -> Self {
    let normalized_options = NormalizedOptions::from(options.clone());
    let settings = Settings::from(&normalized_options);
    let repository = Repository::from(&normalized_options);

    Self {
      user_options: options,
      options: normalized_options,
      settings,
      session: Session::default(),
      repository,
    }
  }
}
