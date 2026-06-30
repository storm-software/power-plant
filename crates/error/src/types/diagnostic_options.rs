use std::path::Path;

use camino::Utf8PathBuf;
use sugar_path::SugarPath;

#[derive(Debug)]
pub struct DiagnosticOptions {
  pub path: Utf8PathBuf,
}

impl Default for DiagnosticOptions {
  fn default() -> Self {
    Self {
      path: Utf8PathBuf::from_path_buf(
        std::env::current_dir().expect("Failed to get current directory."),
      )
      .expect("Failed to convert to UTF-8 path."),
    }
  }
}

impl DiagnosticOptions {
  /// Turns an absolute path into a path relative to the current working directory. This helps make the output consistent across different machines.
  ///
  /// Example: `/Users/you/project/src/index.js` -> `src/index.js` (if cwd is `/Users/you/project`)
  pub fn stabilize_path(&self, path: impl AsRef<Path>) -> String {
    let path = path.as_ref();
    if path.is_absolute() {
      path.relative(&self.path).to_slash_lossy().into_owned()
    } else {
      path.to_string_lossy().to_string()
    }
  }
}
