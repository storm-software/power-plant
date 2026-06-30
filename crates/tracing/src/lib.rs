//! Power Plant crate: provides core Power Plant functionalities for creating
//! the React application from the JavaScript/TypeScript source code.

pub(crate) mod debug_data_propagate_layer;
pub(crate) mod debug_formatter;
pub(crate) mod type_alias;
pub(crate) mod types;

pub mod actions;
pub mod macros;
pub mod static_data;

pub mod session;
pub use session::*;

pub mod tracing;
pub use tracing::*;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
