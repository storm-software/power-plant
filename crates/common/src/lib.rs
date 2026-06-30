//! Power Plant Common crate: provides various utilities and helper functions
//! and common types used across other Power Plant crates.

/// Common logging utilities and helper functions.
pub mod log;
pub use log::*;
/// Common types used across Power Plant crates.
pub mod types;
pub use types::*;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
