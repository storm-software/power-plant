use napi_derive::napi;
use power_plant_core::session::UserInfo;

#[derive(Clone, PartialEq, Eq)]
#[napi(object, object_from_js = false)]
pub struct BindingUser {
  pub name: String,
  pub display_name: String,
  pub language_preferences: Vec<String>,
}

impl From<UserInfo> for BindingUser {
  fn from(value: UserInfo) -> Self {
    Self {
      name: value.name,
      display_name: value.display_name,
      language_preferences: value.language_preferences,
    }
  }
}
