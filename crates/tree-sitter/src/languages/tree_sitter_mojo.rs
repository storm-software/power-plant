//! Mojo language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add the Mojo language to a
//! tree-sitter [`Parser`][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser
//!     .set_language(&tree_sitter_mojo::LANGUAGE.into())
//!     .expect("Error loading Mojo grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_mojo() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_mojo) };

pub const HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/mojo/queries/highlights.scm");
pub const INDENTS_SCM_QUERY: &str = include_str!("../../grammars/mojo/queries/indents.scm");
pub const OUTLINE_SCM_QUERY: &str = include_str!("../../grammars/mojo/queries/outline.scm");
pub const OVERRIDES_SCM_QUERY: &str = include_str!("../../grammars/mojo/queries/overrides.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading Mojo language");
    }
}
