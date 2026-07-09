//! Power Plant Core crate: provides core types and utilities used across other Power Plant crates.

pub mod context;
pub mod error;
pub mod inputs;
pub mod log;
pub mod normalized_options;
pub mod options;
pub mod outputs;
pub mod session;
pub mod settings;
pub mod repository;

pub use crate::context::*;
pub use crate::error::*;
pub use crate::normalized_options::*;
pub use crate::options::*;
pub use crate::session::*;
pub use crate::repository::*;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
