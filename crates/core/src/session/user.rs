#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UserInfo {
  pub name: String,
  pub display_name: String,
  pub language_preferences: Vec<String>,
}

impl UserInfo {
  pub fn new(name: String, display_name: String, language_preferences: Vec<String>) -> Self {
    Self { name, display_name, language_preferences }
  }
}

impl Default for UserInfo {
  fn default() -> Self {
    Self {
      name: whoami::username().unwrap_or_else(|_| "Unknown User".to_string()),
      display_name: whoami::realname().unwrap_or_else(|_| "Unknown User".to_string()),
      language_preferences: vec!["en-US".to_string()],
    }
  }
}
