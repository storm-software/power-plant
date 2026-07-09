//! This crate provides ObjectScript Routine language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_objectscript_routine] function to add the ObjectScript Routine language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_objectscript_routine::language()).expect("Error loading ObjectScript Routine grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_objectscript_routine() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_objectscript_routine] for the ObjectScript Routine grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_objectscript_routine() }
}

pub const HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/objectscript_routine/queries/highlights.scm");
pub const INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/objectscript_routine/queries/indents.scm");
pub const INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/objectscript_routine/queries/injections.scm");
pub const STUDIO_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/objectscript_routine/queries/studio-highlights.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading ObjectScript Routine language");
    }
}
