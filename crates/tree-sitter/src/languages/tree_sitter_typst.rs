//! This crate provides Typst language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_typst] function to add the Typst language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_typst::language()).expect("Error loading Typst grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_typst() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_typst] for the Typst grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_typst() }
}

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &'static str = include_str!("../../grammars/typst/node-types.json");

pub const TYPST_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/typst/queries/typst/highlights.scm");
pub const TYPST_INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/typst/queries/typst/injections.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Typst language");
    }
}
