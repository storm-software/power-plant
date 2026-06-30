//! Power Plant crate: provides core Power Plant functionalities for creating
//! the React application from the JavaScript/TypeScript source code.

pub mod engine;
pub use engine::*;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
