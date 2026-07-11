//! Runtime helpers for loading compiled grammars into tree-sitter parsers.
//!
//! Grammars are linked statically from `grammars/` at build time. At runtime the
//! cheapest path is:
//! 1. Resolve a [`crate::Language`] → [`LanguageFn`] (function pointer, free).
//! 2. Reuse a single [`tree_sitter::Parser`] and call `set_language` only when
//!    the source language changes (see [`LanguageParser`]).

use std::cell::RefCell;

use tree_sitter::{LanguageError, Parser, Tree};
use tree_sitter_language::LanguageFn;

use crate::Language;

/// Errors that can occur while loading a grammar into a parser.
#[derive(Debug, thiserror::Error)]
pub enum ParserLanguageError {
  /// No compiled grammar is available for this [`Language`] (e.g. [`Language::Unknown`]).
  #[error("no tree-sitter grammar available for language {0:?}")]
  Unavailable(Language),
  /// The grammar ABI is incompatible with the linked `tree-sitter` crate.
  #[error(transparent)]
  Incompatible(#[from] LanguageError),
}

impl PartialEq for ParserLanguageError {
  fn eq(&self, other: &Self) -> bool {
    match (self, other) {
      (Self::Unavailable(a), Self::Unavailable(b)) => a == b,
      (Self::Incompatible(a), Self::Incompatible(b)) => a == b,
      _ => false,
    }
  }
}

impl Eq for ParserLanguageError {}

/// Load `language` into `parser`.
///
/// Prefer [`LanguageParser`] when parsing many files so the parser instance and
/// language assignment are reused across calls.
pub fn configure_parser(
  parser: &mut Parser,
  language: Language,
) -> Result<(), ParserLanguageError> {
  let Some(ts_language) = language.tree_sitter_language() else {
    return Err(ParserLanguageError::Unavailable(language));
  };
  parser.set_language(&ts_language)?;
  Ok(())
}

/// Create a new parser already configured for `language`.
pub fn parser_for(language: Language) -> Result<Parser, ParserLanguageError> {
  let mut parser = Parser::new();
  configure_parser(&mut parser, language)?;
  Ok(parser)
}

/// Reusable parser that only calls [`Parser::set_language`] when the language changes.
///
/// This is the efficient default for batch / incremental indexing: constructing a
/// [`Parser`] and assigning a language both allocate; keeping one parser per worker
/// and switching languages only on change avoids that overhead on the hot path.
pub struct LanguageParser {
  parser: Parser,
  current: Option<Language>,
}

impl std::fmt::Debug for LanguageParser {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    f.debug_struct("LanguageParser").field("current", &self.current).finish_non_exhaustive()
  }
}

impl Default for LanguageParser {
  fn default() -> Self {
    Self::new()
  }
}

impl LanguageParser {
  /// Create an unconfigured parser.
  #[must_use]
  pub fn new() -> Self {
    Self { parser: Parser::new(), current: None }
  }

  /// Ensure `language` is loaded, then parse `source`.
  pub fn parse(
    &mut self,
    language: Language,
    source: impl AsRef<[u8]>,
    old_tree: Option<&Tree>,
  ) -> Result<Option<Tree>, ParserLanguageError> {
    self.ensure_language(language)?;
    Ok(self.parser.parse(source.as_ref(), old_tree))
  }

  /// Ensure `language` is loaded, then parse with a custom input callback.
  pub fn parse_with_options<T, F>(
    &mut self,
    language: Language,
    mut callback: F,
    old_tree: Option<&Tree>,
    options: Option<tree_sitter::ParseOptions<'_>>,
  ) -> Result<Option<Tree>, ParserLanguageError>
  where
    T: AsRef<[u8]>,
    F: FnMut(usize, tree_sitter::Point) -> T,
  {
    self.ensure_language(language)?;
    Ok(self.parser.parse_with_options(&mut callback, old_tree, options))
  }

  /// Ensure `language` is loaded, then parse `source` and extract indexable
  /// definitions / calls / imports.
  pub fn extract(
    &mut self,
    language: Language,
    source: impl AsRef<[u8]>,
    project: &str,
    rel_path: &str,
  ) -> Result<crate::extract::FileResult, ParserLanguageError> {
    let source = source.as_ref();
    let Some(tree) = self.parse(language, source, None)? else {
      return Ok(crate::extract::FileResult {
        has_error: true,
        error_msg: Some("parse failed".into()),
        ..crate::extract::FileResult::default()
      });
    };
    Ok(crate::extract::extract_from_tree(&tree, source, language, project, rel_path))
  }

  /// Load `language` if it is not already the active grammar.
  pub fn ensure_language(&mut self, language: Language) -> Result<(), ParserLanguageError> {
    if self.current == Some(language) {
      return Ok(());
    }
    configure_parser(&mut self.parser, language)?;
    self.current = Some(language);
    Ok(())
  }

  /// Currently loaded source language, if any.
  #[must_use]
  pub fn current_language(&self) -> Option<Language> {
    self.current
  }

  /// Borrow the underlying tree-sitter parser.
  #[must_use]
  pub fn parser(&self) -> &Parser {
    &self.parser
  }

  /// Mutably borrow the underlying tree-sitter parser.
  pub fn parser_mut(&mut self) -> &mut Parser {
    &mut self.parser
  }

  /// Return the [`LanguageFn`] for `language` without constructing a [`Parser`].
  #[must_use]
  pub const fn language_fn(language: Language) -> Option<LanguageFn> {
    language.language_fn()
  }
}

thread_local! {
  static THREAD_PARSER: RefCell<LanguageParser> = RefCell::new(LanguageParser::new());
}

/// Parse on a thread-local [`LanguageParser`], reusing the parser across calls on
/// this thread.
///
/// Suitable for rayon / worker-pool indexing where each worker thread parses many
/// files and should avoid allocating a new [`Parser`] per file.
pub fn parse_on_thread(
  language: Language,
  source: impl AsRef<[u8]>,
  old_tree: Option<&Tree>,
) -> Result<Option<Tree>, ParserLanguageError> {
  THREAD_PARSER.with(|cell| {
    let mut parser = cell.borrow_mut();
    parser.parse(language, source, old_tree)
  })
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn rust_grammar_loads_into_parser() {
    let mut parser = LanguageParser::new();
    let tree = parser
      .parse(Language::Rust, "fn main() {}", None)
      .expect("rust grammar should load")
      .expect("parse should produce a tree");
    assert_eq!(tree.root_node().kind(), "source_file");
    assert_eq!(parser.current_language(), Some(Language::Rust));
  }

  #[test]
  fn language_switch_only_reloads_when_changed() {
    let mut parser = LanguageParser::new();
    parser.ensure_language(Language::Rust).unwrap();
    parser.ensure_language(Language::Rust).unwrap();
    parser.ensure_language(Language::Python).unwrap();
    assert_eq!(parser.current_language(), Some(Language::Python));
  }

  #[test]
  fn unknown_language_is_unavailable() {
    let err = configure_parser(&mut Parser::new(), Language::Unknown).unwrap_err();
    assert_eq!(err, ParserLanguageError::Unavailable(Language::Unknown));
  }
}
