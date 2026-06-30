use mime::Mime;
use std::{fmt::Display, path::Path, str::FromStr};

#[inline]
fn is_valid_utf8(data: &[u8]) -> bool {
  simdutf8::basic::from_utf8(data).is_ok()
}

#[derive(Debug)]
pub struct MimeExt {
  pub mime: Mime,
  pub is_utf8_encoded: bool,
}

impl Display for MimeExt {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.mime)?;
    if self.is_utf8_encoded {
      write!(f, ";charset=utf-8")?;
    }
    Ok(())
  }
}

impl From<(Mime, bool)> for MimeExt {
  fn from(value: (Mime, bool)) -> Self {
    Self { mime: value.0, is_utf8_encoded: value.1 }
  }
}

impl TryFrom<RawMimeExt> for MimeExt {
  fn try_from(raw_mime_ext: RawMimeExt) -> Result<Self, Self::Error> {
    let mime = Mime::from_str(raw_mime_ext.mime_str)?;
    Ok(MimeExt { mime, is_utf8_encoded: raw_mime_ext.is_utf8_encoded })
  }

  type Error = anyhow::Error;
}

// second param is whether the data is utf8 encoded
pub fn guess_mime(path: &Path, data: &[u8]) -> anyhow::Result<MimeExt> {
  if let Ok(guessed) = try_from_path(path) {
    return Ok(guessed);
  }

  if let Some(inferred) = infer::get(data) {
    return Ok((Mime::from_str(inferred.mime_type())?, false).into());
  }

  if is_valid_utf8(data) || data.is_empty() {
    return Ok((mime::TEXT_PLAIN, true).into());
  }

  // Fallback to application/octet-stream
  Ok((mime::APPLICATION_OCTET_STREAM, false).into())
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct RawMimeExt {
  pub mime_str: &'static str,
  pub is_utf8_encoded: bool,
}

impl RawMimeExt {
  const fn new(mime_str: &'static str, is_utf8_encoded: bool) -> RawMimeExt {
    RawMimeExt { mime_str, is_utf8_encoded }
  }
}

pub static MIME_TYPES_KEYS: [&str; 24] = [
  "avif",
  "css",
  "eot",
  "gif",
  "htm",
  "html",
  "jpeg",
  "jpg",
  "js",
  "json",
  "markdown",
  "md",
  "mjs",
  "otf",
  "pdf",
  "png",
  "sfnt",
  "svg",
  "ttf",
  "wasm",
  "webmanifest",
  "webp",
  "woff",
  "woff2",
];

pub static MIME_TYPES_VALUES: [RawMimeExt; 24] = [
  RawMimeExt::new("image/avif", false),
  RawMimeExt::new("text/css", true),
  RawMimeExt::new("application/vnd.ms-fontobject", false),
  RawMimeExt::new("image/gif", false),
  RawMimeExt::new("text/html", true),
  RawMimeExt::new("text/html", true),
  RawMimeExt::new("image/jpeg", false),
  RawMimeExt::new("image/jpeg", false),
  RawMimeExt::new("text/javascript", true),
  RawMimeExt::new("application/json", true),
  RawMimeExt::new("text/markdown", true),
  RawMimeExt::new("text/markdown", true),
  RawMimeExt::new("text/javascript", true),
  RawMimeExt::new("font/otf", false),
  RawMimeExt::new("application/pdf", false),
  RawMimeExt::new("image/png", false),
  RawMimeExt::new("font/sfnt", false),
  RawMimeExt::new("image/svg+xml", false),
  RawMimeExt::new("font/ttf", false),
  RawMimeExt::new("application/wasm", false),
  RawMimeExt::new("application/manifest+json", false),
  RawMimeExt::new("image/webp", false),
  RawMimeExt::new("font/woff", false),
  RawMimeExt::new("font/woff2", false),
];

/// Adapted from:
/// - https://github.com/rolldown/rolldown/pull/1406/files#diff-4b612e077c82ae0e05e50eb0d419e02c05a04b83c6ac5440c0d0c9d0c38af942
/// - https://github.com/evanw/esbuild/blob/fc37c2fa9de2ad77476a6d4a8f1516196b90187e/internal/helpers/mime.go#L5
///
/// Thanks to @ikkz and @evanw for the inspiration.
pub fn mime_type_by_extension(ext: &str) -> Option<RawMimeExt> {
  MIME_TYPES_KEYS.into_iter().position(|v| v == ext).map(|index| MIME_TYPES_VALUES[index])
}

pub fn try_from_ext(ext: &str) -> anyhow::Result<MimeExt> {
  mime_type_by_extension(ext)
    .ok_or_else(|| anyhow::Error::msg(format!("No mime type found for extension: {ext}")))
    .and_then(MimeExt::try_from)
}

pub fn try_from_path(path: &std::path::Path) -> anyhow::Result<MimeExt> {
  if let Some(ext) = path.extension().and_then(|ext| ext.to_str()) {
    try_from_ext(ext)
  } else {
    anyhow::bail!("No extension found for path: {}", path.display());
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn normal_extensions() {
    assert_eq!(mime_type_by_extension("txt"), None);
    assert_eq!(mime_type_by_extension("css").unwrap().mime_str, "text/css");
    assert_eq!(mime_type_by_extension("html").unwrap().mime_str, "text/html");
    assert_eq!(mime_type_by_extension("json").unwrap().mime_str, "application/json");
    assert_eq!(mime_type_by_extension("png").unwrap().mime_str, "image/png");
    assert_eq!(mime_type_by_extension("svg").unwrap().mime_str, "image/svg+xml");
    assert_eq!(mime_type_by_extension("woff2").unwrap().mime_str, "font/woff2");
    assert_eq!(mime_type_by_extension("pdf").unwrap().mime_str, "application/pdf");
    assert_eq!(mime_type_by_extension("wasm").unwrap().mime_str, "application/wasm");
    assert_eq!(
      mime_type_by_extension("webmanifest").unwrap().mime_str,
      "application/manifest+json"
    );
  }

  #[test]
  fn unknown_extensions() {
    assert!(mime_type_by_extension("unknown").is_none());
  }

  #[test]
  fn try_from_exts() {
    assert!(matches!(try_from_ext("png").unwrap().mime.subtype(), mime::PNG));
    assert!(matches!(try_from_ext("svg").unwrap().mime.subtype(), mime::SVG));
    assert!(matches!(try_from_ext("woff2").unwrap().mime.type_(), mime::FONT));
  }
}
