//! This crate provides Mojo language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_mojo] function to add the Mojo language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_mojo::language()).expect("Error loading Mojo grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_mojo() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_mojo] for the Mojo grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_mojo() }
}

pub const HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/mojo/queries/highlights.scm");
pub const INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/mojo/queries/indents.scm");
pub const OUTLINE_SCM_QUERY: &'static str = include_str!("../../grammars/mojo/queries/outline.scm");
pub const OVERRIDES_SCM_QUERY: &'static str = include_str!("../../grammars/mojo/queries/overrides.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Mojo language");
    }
}
