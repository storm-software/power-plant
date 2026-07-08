use crate::types::{binding_device::BindingDevice, binding_user::BindingUser};
use napi_derive::napi;
use power_plant_core::session::Session;

#[derive(Clone, PartialEq, Eq)]
#[napi(object, object_from_js = false)]
pub struct BindingSession {
  pub session_id: String,
  pub started_at: i64,
  pub user: BindingUser,
  pub device: BindingDevice,
}

impl From<Session> for BindingSession {
  fn from(value: Session) -> Self {
    Self {
      session_id: value.session_id.to_string(),
      started_at: value.started_at.timestamp_millis(),
      user: value.user.into(),
      device: value.device.into(),
    }
  }
}
