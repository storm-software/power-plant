//! Perl language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add the Perl language to a
//! tree-sitter [`Parser`][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser
//!     .set_language(&tree_sitter_perl::LANGUAGE.into())
//!     .expect("Error loading Perl grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_perl() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_perl) };

pub const FOLDS_SCM_QUERY: &str = include_str!("../../grammars/perl/queries/folds.scm");
pub const HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/perl/queries/highlights.scm");
pub const INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/perl/queries/injections.scm");
pub const MATCHUP_SCM_QUERY: &str = include_str!("../../grammars/perl/queries/matchup.scm");
pub const TEXTOBJECTS_SCM_QUERY: &str = include_str!("../../grammars/perl/queries/textobjects.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading Perl language");
    }
}
