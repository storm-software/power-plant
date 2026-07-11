//! Matlab language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`LANGUAGE`] constant to add the Matlab language to a
//! tree-sitter [`Parser`][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser
//!     .set_language(&tree_sitter_matlab::LANGUAGE.into())
//!     .expect("Error loading Matlab grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter_language::LanguageFn;

unsafe extern "C" {
    fn tree_sitter_matlab() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for this grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_matlab) };

pub const EMACS_HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/emacs/highlights.scm");
pub const EMACS_TEXTOBJECTS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/emacs/textobjects.scm");
pub const HELIX_CONTEXT_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/helix/context.scm");
pub const HELIX_FOLDS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/helix/folds.scm");
pub const HELIX_HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/helix/highlights.scm");
pub const HELIX_INDENTS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/helix/indents.scm");
pub const HELIX_INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/helix/injections.scm");
pub const HELIX_LOCALS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/helix/locals.scm");
pub const HELIX_TEXTOBJECTS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/helix/textobjects.scm");
pub const NEOVIM_CONTEXT_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/neovim/context.scm");
pub const NEOVIM_FOLDS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/neovim/folds.scm");
pub const NEOVIM_HIGHLIGHTS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/neovim/highlights.scm");
pub const NEOVIM_INDENTS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/neovim/indents.scm");
pub const NEOVIM_INJECTIONS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/neovim/injections.scm");
pub const NEOVIM_LOCALS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/neovim/locals.scm");
pub const NEOVIM_TAGS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/neovim/tags.scm");
pub const NEOVIM_TEXTOBJECTS_SCM_QUERY: &str = include_str!("../../grammars/matlab/queries/neovim/textobjects.scm");

#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::LANGUAGE.into())
            .expect("Error loading Matlab language");
    }
}
