//! This crate provides CFScript language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_cfscript] function to add the CFScript language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_cfscript::language()).expect("Error loading CFScript grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_cfscript() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_cfscript] for the CFScript grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_cfscript() }
}

pub const BRACKETS_ZED_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/brackets-zed.scm");
pub const FOLDS_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/folds.scm");
pub const HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/highlights.scm");
pub const INDENTS_ZED_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/indents-zed.scm");
pub const INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/indents.scm");
pub const INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/injections.scm");
pub const OUTLINE_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/outline.scm");
pub const OVERRIDES_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/overrides.scm");
pub const TAGS_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/tags.scm");
pub const TEXTOBJECTS_SCM_QUERY: &'static str = include_str!("../../grammars/cfscript/queries/textobjects.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading CFScript language");
    }
}
