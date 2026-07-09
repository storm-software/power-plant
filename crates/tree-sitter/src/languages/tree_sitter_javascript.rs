//! This crate provides JavaScript language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_javascript] function to add the JavaScript language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_javascript::language()).expect("Error loading JavaScript grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_javascript() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_javascript] for the JavaScript grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_javascript() }
}

pub const HIGHLIGHTS_JSX_SCM_QUERY: &'static str = include_str!("../../grammars/javascript/queries/highlights-jsx.scm");
pub const HIGHLIGHTS_PARAMS_SCM_QUERY: &'static str = include_str!("../../grammars/javascript/queries/highlights-params.scm");
pub const HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/javascript/queries/highlights.scm");
pub const INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/javascript/queries/injections.scm");
pub const LOCALS_SCM_QUERY: &'static str = include_str!("../../grammars/javascript/queries/locals.scm");
pub const TAGS_SCM_QUERY: &'static str = include_str!("../../grammars/javascript/queries/tags.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading JavaScript language");
    }
}
