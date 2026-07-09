//! This crate provides Matlab language support for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [language][tree_sitter_matlab] function to add the Matlab language to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! let code = "";
//! let mut parser = tree_sitter::Parser::new();
//! parser.set_language(tree_sitter_matlab::language()).expect("Error loading Matlab grammar");
//! let tree = parser.parse(code, None).unwrap();
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

unsafe extern "C" {
    unsafe fn tree_sitter_matlab() -> Language;
}

/// Get the tree-sitter [Language][tree_sitter_matlab] for the Matlab grammar.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
pub fn language() -> Language {
    unsafe { tree_sitter_matlab() }
}

pub const EMACS_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/emacs/highlights.scm");
pub const EMACS_TEXTOBJECTS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/emacs/textobjects.scm");
pub const HELIX_CONTEXT_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/helix/context.scm");
pub const HELIX_FOLDS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/helix/folds.scm");
pub const HELIX_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/helix/highlights.scm");
pub const HELIX_INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/helix/indents.scm");
pub const HELIX_INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/helix/injections.scm");
pub const HELIX_LOCALS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/helix/locals.scm");
pub const HELIX_TEXTOBJECTS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/helix/textobjects.scm");
pub const NEOVIM_CONTEXT_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/neovim/context.scm");
pub const NEOVIM_FOLDS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/neovim/folds.scm");
pub const NEOVIM_HIGHLIGHTS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/neovim/highlights.scm");
pub const NEOVIM_INDENTS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/neovim/indents.scm");
pub const NEOVIM_INJECTIONS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/neovim/injections.scm");
pub const NEOVIM_LOCALS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/neovim/locals.scm");
pub const NEOVIM_TAGS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/neovim/tags.scm");
pub const NEOVIM_TEXTOBJECTS_SCM_QUERY: &'static str = include_str!("../../grammars/matlab/queries/neovim/textobjects.scm");


#[cfg(test)]
mod tests {
    #[test]
    fn test_can_load_grammar() {
        let mut parser = tree_sitter::Parser::new();
        parser
            .set_language(&super::language())
            .expect("Error loading Matlab language");
    }
}
