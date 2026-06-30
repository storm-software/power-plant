//! Power Plant Utilities crate: provides various utilities and helper functions

pub mod base64;
pub mod concat_string;
pub mod dashmap;
pub mod data_url;
pub mod debug;
pub mod filter_expression;
pub mod futures;
pub mod js_regex;
pub mod mime;
pub mod path;
pub mod pattern_filter;
pub mod percent_encoding;
pub mod rustc_hash;
pub mod stabilize_id;
pub mod url;
pub mod uuid;
pub mod xxhash;

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
