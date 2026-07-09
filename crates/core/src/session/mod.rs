use chrono::{DateTime, Utc};
use uuid::Uuid;

pub mod device;
pub mod user;

pub use device::*;
pub use user::*;

/// Represents a session in the Power Plant system, containing user and device information.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Session {
  /// Unique identifier for the session.
  pub session_id: Uuid,
  /// Timestamp indicating when the session started.
  pub started_at: DateTime<Utc>,
  /// Information about the current user.
  pub user: UserInfo,
  /// Information about the current device.
  pub device: DeviceInfo,

}

impl Session {
  /// Creates a new session with the provided user and device information.
  pub fn new(user: UserInfo, device: DeviceInfo) -> Self {
    Self { session_id: Uuid::new_v4(), started_at: Utc::now(), user, device }
  }
}

impl Default for Session {
  fn default() -> Self {
    Self {
      session_id: Uuid::new_v4(),
      started_at: Utc::now(),
      user: UserInfo::default(),
      device: DeviceInfo::default(),
    }
  }
}
