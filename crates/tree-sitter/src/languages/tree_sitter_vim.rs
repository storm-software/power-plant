//! This crate provides Vim language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_vim] function to add the Vim language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_vim::language()).expect("Error loading Vim grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_vim() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_vim] for the Vim grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_vim() }
}

pub const VIM_FOLDS_SCM_QUERY: &'static str = include_str!("../../grammars/vim/queries/vim/folds.scm");
pub const VIM_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/vim/queries/vim/highlights.scm");
pub const VIM_INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/vim/queries/vim/injections.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Vim language");
    }
}
