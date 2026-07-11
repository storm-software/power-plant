//! D language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add the D language to a
//! tree-sitter [`Parser`][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser
//!     .set_language(&tree_sitter_d::LANGUAGE.into())
//!     .expect("Error loading D grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_d() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_d) };

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &str = include_str!("../../grammars/d/node-types.json");

pub const HELIX_HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/helix-highlights.scm");
pub const HELIX_INDENTS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/helix-indents.scm");
pub const HELIX_INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/helix-injections.scm");
pub const HELIX_TEXTOBJECTS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/helix-textobjects.scm");
pub const HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/highlights.scm");
pub const INDENTS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/indents.scm");
pub const INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/injections.scm");
pub const NOVA_FOLDS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/nova-folds.scm");
pub const NOVA_HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/nova-highlights.scm");
pub const NOVA_SYMBOLS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/nova-symbols.scm");
pub const TAGS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/tags.scm");
pub const TEXTOBJECTS_SCM_QUERY: &str = include_str!("../../grammars/d/queries/textobjects.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading D language");
    }
}
