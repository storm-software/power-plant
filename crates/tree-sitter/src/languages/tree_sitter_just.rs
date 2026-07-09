//! This crate provides Just language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_just] function to add the Just language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_just::language()).expect("Error loading Just grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_just() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_just] for the Just grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_just() }
}

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &'static str = include_str!("../../grammars/just/node-types.json");

pub const JUST_FOLDS_SCM_QUERY: &'static str = include_str!("../../grammars/just/queries/just/folds.scm");
pub const JUST_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/just/queries/just/highlights.scm");
pub const JUST_INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/just/queries/just/indents.scm");
pub const JUST_INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/just/queries/just/injections.scm");
pub const JUST_LOCALS_SCM_QUERY: &'static str = include_str!("../../grammars/just/queries/just/locals.scm");
pub const JUST_TEXTOBJECTS_SCM_QUERY: &'static str = include_str!("../../grammars/just/queries/just/textobjects.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Just language");
    }
}
