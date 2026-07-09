//! This crate provides Vue language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_vue] function to add the Vue language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_vue::language()).expect("Error loading Vue grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_vue() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_vue] for the Vue grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_vue() }
}

pub const HTML_TAGS_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/vue/queries/html_tags/highlights.scm");
pub const HTML_TAGS_INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/vue/queries/html_tags/indents.scm");
pub const HTML_TAGS_INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/vue/queries/html_tags/injections.scm");
pub const VUE_FOLDS_SCM_QUERY: &'static str = include_str!("../../grammars/vue/queries/vue/folds.scm");
pub const VUE_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/vue/queries/vue/highlights.scm");
pub const VUE_INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/vue/queries/vue/indents.scm");
pub const VUE_INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/vue/queries/vue/injections.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Vue language");
    }
}
