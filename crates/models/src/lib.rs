//! Power Plant Common crate: provides various utilities and helper functions
//! and common types used across other Power Plant crates.

/// Module containing the DataPoint type.
pub mod data_point;
pub use data_point::*;

/// Module containing the Document type.
pub mod document;
pub use document::*;

/// Module containing the SourceCode type.
pub mod source_code;
pub use source_code::*;

/// Module containing metadata types used by execution models.
pub mod meta;
pub use meta::*;

/// Module containing execution types.
pub mod execution;
pub use execution::*;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
