//! PHP language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add the PHP language to a
//! tree-sitter [`Parser`][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser
//!     .set_language(&tree_sitter_php_only::LANGUAGE.into())
//!     .expect("Error loading PHP grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_php_only() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_php_only) };

pub const HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/php/queries/highlights.scm");
pub const INJECTIONS_TEXT_SCM_QUERY: &str = include_str!("../../grammars/php/queries/injections-text.scm");
pub const INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/php/queries/injections.scm");
pub const TAGS_SCM_QUERY: &str = include_str!("../../grammars/php/queries/tags.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading PHP language");
    }
}
