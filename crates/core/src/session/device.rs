use whoami::{
  CpuArchitecture, DesktopEnvironment, Platform, cpu_arch, desktop_env, devicename, distro,
  hostname, platform,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeviceInfo {
  pub name: String,
  pub display_name: String,
  pub platform: Platform,
  pub distro: String,
  pub desktop_env: DesktopEnvironment,
  pub cpu_arch: CpuArchitecture,
}

impl DeviceInfo {
  pub fn new(
    name: String,
    display_name: String,
    platform: Platform,
    distro: String,
    desktop_env: DesktopEnvironment,
    cpu_arch: CpuArchitecture,
  ) -> Self {
    Self { name, display_name, platform, distro, desktop_env, cpu_arch }
  }
}

impl Default for DeviceInfo {
  fn default() -> Self {
    let name =
      devicename().unwrap_or_else(|_| hostname().unwrap_or_else(|_| "Unknown Device".to_string()));
    let display_name = hostname().unwrap_or_else(|_| name.clone());

    Self {
      name,
      display_name,
      platform: platform(),
      distro: distro().unwrap_or_else(|_| "Unknown OS Distribution".to_string()),
      desktop_env: desktop_env()
        .unwrap_or_else(|| DesktopEnvironment::Unknown("Unknown".to_string())),
      cpu_arch: cpu_arch(),
    }
  }
}
