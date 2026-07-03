//! Power Plant Common crate: provides various utilities and helper functions
//! and common types used across other Power Plant crates.

pub mod context;
pub mod input;
pub mod log;
pub mod log_level;
pub mod log_message;
pub mod normalized_options;
pub mod options;
pub mod output;
pub mod recall_input;
pub mod recall_output;
pub mod search_input;
pub mod search_output;

pub use crate::context::*;
pub use crate::input::*;
pub use crate::log::*;
pub use crate::log_level::*;
pub use crate::log_message::*;
pub use crate::normalized_options::*;
pub use crate::options::*;
pub use crate::output::*;
pub use crate::recall_input::*;
pub use crate::recall_output::*;
pub use crate::search_input::*;
pub use crate::search_output::*;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
