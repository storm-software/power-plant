//! Power Plant Core crate: provides core types and utilities used across other Power Plant crates.

pub mod context;
pub mod env_paths;
pub mod error;
pub mod get_settings_input;
pub mod get_settings_output;
pub mod input;
pub mod log;
pub mod log_level;
pub mod log_message;
pub mod mode;
pub mod normalized_options;
pub mod options;
pub mod output;
pub mod recall_input;
pub mod recall_output;
pub mod search_input;
pub mod search_output;
pub mod settings;

pub use crate::context::*;
pub use crate::env_paths::*;
pub use crate::error::*;
pub use crate::get_settings_input::*;
pub use crate::get_settings_output::*;
pub use crate::input::*;
pub use crate::log::*;
pub use crate::log_level::*;
pub use crate::log_message::*;
pub use crate::mode::*;
pub use crate::normalized_options::*;
pub use crate::options::*;
pub use crate::output::*;
pub use crate::recall_input::*;
pub use crate::recall_output::*;
pub use crate::search_input::*;
pub use crate::search_output::*;
pub use crate::settings::*;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
