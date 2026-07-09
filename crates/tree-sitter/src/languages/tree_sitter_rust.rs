//! This crate provides Rust language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_rust] function to add the Rust language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_rust::language()).expect("Error loading Rust grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_rust() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_rust] for the Rust grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_rust() }
}

pub const HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/rust/queries/highlights.scm");
pub const INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/rust/queries/injections.scm");
pub const TAGS_SCM_QUERY: &'static str = include_str!("../../grammars/rust/queries/tags.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Rust language");
    }
}
