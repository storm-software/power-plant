use camino::Utf8PathBuf;

use crate::NormalizedOptions;

#[derive(Debug, Clone)]
pub struct Repository {
  pub root_path: Utf8PathBuf,
  pub name: String,
}

impl Repository {
  pub fn new(path: Option<Utf8PathBuf>) -> Self {
    let mut root_path: Utf8PathBuf =
      path.unwrap_or_else(|| Utf8PathBuf::from_path_buf(std::env::current_dir().unwrap()).unwrap());
    while !root_path.join(".git").exists()
      && !root_path.join(".github").exists()
      && root_path.parent().is_some()
    {
      root_path = root_path.parent().unwrap().to_path_buf();
    }

    Self {
      root_path: root_path.clone(),
      name: root_path.to_string().split("/").last().unwrap().to_string(),
    }
  }
}

impl Default for Repository {
  fn default() -> Self {
    Self::new(None)
  }
}

impl From<Utf8PathBuf> for Repository {
  fn from(path: Utf8PathBuf) -> Self {
    Self::new(Some(path))
  }
}

impl From<&NormalizedOptions> for Repository {
  fn from(options: &NormalizedOptions) -> Self {
    Self::new(Some(options.repository_root.clone()))
  }
}
