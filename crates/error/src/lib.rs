//! Power Plant crate: provides core Power Plant functionalities for creating
//! the React application from the JavaScript/TypeScript source code.

pub mod diagnostic;
pub mod errors;
pub mod issues;
pub mod types;
pub mod utils;

pub use diagnostic::*;
pub use types::*;
pub use utils::*;

/// A result type alias for Power Plant operations that can return a single diagnostic error.
pub type PowerPlantResult<T> = Result<T, BatchedPowerPlantDiagnostic>;
/// A result type alias for Power Plant operations that can return multiple diagnostic errors.
pub type SinglePowerPlantResult<T> = std::result::Result<T, PowerPlantDiagnostic>;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
