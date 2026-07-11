//! Vue language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add the Vue language to a
//! tree-sitter [`Parser`][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser
//!     .set_language(&tree_sitter_vue::LANGUAGE.into())
//!     .expect("Error loading Vue grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_vue() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_vue) };

pub const HTML_TAGS_HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/vue/queries/html_tags/highlights.scm");
pub const HTML_TAGS_INDENTS_SCM_QUERY: &str = include_str!("../../grammars/vue/queries/html_tags/indents.scm");
pub const HTML_TAGS_INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/vue/queries/html_tags/injections.scm");
pub const VUE_FOLDS_SCM_QUERY: &str = include_str!("../../grammars/vue/queries/vue/folds.scm");
pub const VUE_HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/vue/queries/vue/highlights.scm");
pub const VUE_INDENTS_SCM_QUERY: &str = include_str!("../../grammars/vue/queries/vue/indents.scm");
pub const VUE_INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/vue/queries/vue/injections.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading Vue language");
    }
}
