//! This crate provides Beancount language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_beancount] function to add the Beancount language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_beancount::language()).expect("Error loading Beancount grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_beancount() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_beancount] for the Beancount grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_beancount() }
}

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &'static str = include_str!("../../grammars/beancount/node-types.json");

pub const FOLDS_SCM_QUERY: &'static str = include_str!("../../grammars/beancount/queries/folds.scm");
pub const HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/beancount/queries/highlights.scm");
pub const INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/beancount/queries/indents.scm");
pub const LOCALS_SCM_QUERY: &'static str = include_str!("../../grammars/beancount/queries/locals.scm");
pub const TAGS_SCM_QUERY: &'static str = include_str!("../../grammars/beancount/queries/tags.scm");
pub const TEXTOBJECTS_SCM_QUERY: &'static str = include_str!("../../grammars/beancount/queries/textobjects.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Beancount language");
    }
}
