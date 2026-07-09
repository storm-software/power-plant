//! This crate provides Smithy language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_smithy] function to add the Smithy language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_smithy::language()).expect("Error loading Smithy grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_smithy() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_smithy] for the Smithy grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_smithy() }
}

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &'static str = include_str!("../../grammars/smithy/node-types.json");

pub const HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/smithy/queries/highlights.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Smithy language");
    }
}
