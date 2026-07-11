//! CFScript language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add the CFScript language to a
//! tree-sitter [`Parser`][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser
//!     .set_language(&tree_sitter_cfscript::LANGUAGE.into())
//!     .expect("Error loading CFScript grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_cfscript() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_cfscript) };

pub const BRACKETS_ZED_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/brackets-zed.scm");
pub const FOLDS_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/folds.scm");
pub const HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/highlights.scm");
pub const INDENTS_ZED_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/indents-zed.scm");
pub const INDENTS_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/indents.scm");
pub const INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/injections.scm");
pub const OUTLINE_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/outline.scm");
pub const OVERRIDES_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/overrides.scm");
pub const TAGS_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/tags.scm");
pub const TEXTOBJECTS_SCM_QUERY: &str = include_str!("../../grammars/cfscript/queries/textobjects.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading CFScript language");
    }
}
