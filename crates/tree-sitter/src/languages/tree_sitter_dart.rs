//! This crate provides Dart language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_dart] function to add the Dart language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_dart::language()).expect("Error loading Dart grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_dart() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_dart] for the Dart grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_dart() }
}

pub const HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/dart/queries/highlights.scm");
pub const TAGS_SCM_QUERY: &'static str = include_str!("../../grammars/dart/queries/tags.scm");
pub const TEST_SCM_QUERY: &'static str = include_str!("../../grammars/dart/queries/test.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Dart language");
    }
}
