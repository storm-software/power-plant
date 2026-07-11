//! Static nomic-embed-code token lookup (`code_vectors.bin` + `code_tokens.txt`).
//!
//! No crates.io package ships this blob. Format matches
//! [codebase-memory-mcp `vendored/nomic/`](https://github.com/DeusData/codebase-memory-mcp/tree/main/vendored/nomic).
//!
//! Download once:
//! ```text
//! curl -LO https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/vendored/nomic/code_tokens.txt
//! curl -LO https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/vendored/nomic/code_vectors.bin
//! ```
//!
//! Then point `POWER_PLANT_NOMIC_DATA_DIR` at that directory, or pass the path to [`NomicPretrained::from_dir`].

use std::path::Path;
use std::sync::OnceLock;

use rustc_hash::FxHashMap;

use crate::constants::DIM;
use crate::pretrained::PretrainedEmbeddings;

/// Errors loading nomic pretrained tables.
#[derive(Debug)]
pub enum NomicPretrainedError {
  Io(std::io::Error),
  InvalidHeader(&'static str),
  TokenVectorMismatch { tokens: usize, vectors: usize },
}

impl std::fmt::Display for NomicPretrainedError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Io(err) => write!(f, "io error: {err}"),
      Self::InvalidHeader(msg) => write!(f, "invalid nomic blob header: {msg}"),
      Self::TokenVectorMismatch { tokens, vectors } => {
        write!(f, "token count {tokens} does not match vector count {vectors}")
      }
    }
  }
}

impl std::error::Error for NomicPretrainedError {
  fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
    match self {
      Self::Io(err) => Some(err),
      _ => None,
    }
  }
}

/// Lazy-loaded nomic-embed-code int8 lookup table.
#[derive(Debug)]
pub struct NomicPretrained {
  token_map: FxHashMap<String, usize>,
  vectors: Vec<i8>,
  token_count: usize,
}

impl NomicPretrained {
  /// Load from a directory containing `code_tokens.txt` and `code_vectors.bin`.
  ///
  /// # Errors
  ///
  /// Returns an error when files are missing or the blob header is invalid.
  pub fn from_dir(dir: impl AsRef<Path>) -> Result<Self, NomicPretrainedError> {
    let dir = dir.as_ref();
    let tokens_path = dir.join("code_tokens.txt");
    let vectors_path = dir.join("code_vectors.bin");
    Self::from_files(&tokens_path, &vectors_path)
  }

  /// Load from explicit token/vector file paths.
  ///
  /// # Errors
  ///
  /// Returns an error when files are missing or the blob header is invalid.
  pub fn from_files(
    tokens_path: impl AsRef<Path>,
    vectors_path: impl AsRef<Path>,
  ) -> Result<Self, NomicPretrainedError> {
    let tokens_text = std::fs::read_to_string(tokens_path).map_err(NomicPretrainedError::Io)?;
    let blob = std::fs::read(vectors_path).map_err(NomicPretrainedError::Io)?;
    Self::from_bytes(&tokens_text, &blob)
  }

  /// Parse in-memory token list + vector blob.
  ///
  /// Blob layout: `[i32 token_count][i32 dim]` then `token_count * dim` int8 values.
  ///
  /// # Errors
  ///
  /// Returns an error when the header or dimensions are invalid.
  pub fn from_bytes(tokens_text: &str, blob: &[u8]) -> Result<Self, NomicPretrainedError> {
    if blob.len() < 8 {
      return Err(NomicPretrainedError::InvalidHeader("blob too small"));
    }
    let count = i32::from_le_bytes(blob[0..4].try_into().expect("count bytes")) as usize;
    let dim = i32::from_le_bytes(blob[4..8].try_into().expect("dim bytes")) as usize;
    if dim != DIM {
      return Err(NomicPretrainedError::InvalidHeader("unexpected embedding dim"));
    }
    let expected_bytes = 8 + count * dim;
    if blob.len() < expected_bytes {
      return Err(NomicPretrainedError::InvalidHeader("truncated vector payload"));
    }

    let tokens: Vec<String> = tokens_text
      .lines()
      .map(str::trim)
      .filter(|line| !line.is_empty())
      .map(str::to_owned)
      .collect();
    if tokens.len() != count {
      return Err(NomicPretrainedError::TokenVectorMismatch {
        tokens: tokens.len(),
        vectors: count,
      });
    }

    let payload = &blob[8..8 + count * dim];
    let vectors: Vec<i8> = payload.iter().map(|&b| b as i8).collect();

    let mut token_map = FxHashMap::with_capacity_and_hasher(tokens.len(), Default::default());
    for (idx, token) in tokens.into_iter().enumerate() {
      token_map.insert(token, idx);
    }

    Ok(Self { token_map, vectors, token_count: count })
  }

  /// Load from `POWER_PLANT_NOMIC_DATA_DIR`, or return `None` when unset / invalid.
  #[must_use]
  pub fn from_env() -> Option<Self> {
    let dir = std::env::var("POWER_PLANT_NOMIC_DATA_DIR").ok()?;
    Self::from_dir(dir).ok()
  }

  /// Global singleton from `POWER_PLANT_NOMIC_DATA_DIR`.
  ///
  /// # Panics
  ///
  /// Panics if the environment variable is set but files fail to load.
  #[must_use]
  pub fn global() -> Option<&'static Self> {
    static INSTANCE: OnceLock<Option<NomicPretrained>> = OnceLock::new();
    INSTANCE.get_or_init(|| Self::from_env()).as_ref()
  }

  #[must_use]
  pub fn token_count(&self) -> usize {
    self.token_count
  }

  fn vector_at(&self, index: usize) -> Option<[i8; DIM]> {
    let start = index.checked_mul(DIM)?;
    let end = start + DIM;
    let slice = self.vectors.get(start..end)?;
    let mut out = [0_i8; DIM];
    out.copy_from_slice(slice);
    Some(out)
  }
}

impl PretrainedEmbeddings for NomicPretrained {
  fn lookup(&self, token: &str) -> Option<[i8; DIM]> {
    let &idx = self.token_map.get(token)?;
    self.vector_at(idx)
  }
}

impl PretrainedEmbeddings for &'static NomicPretrained {
  fn lookup(&self, token: &str) -> Option<[i8; DIM]> {
    (*self).lookup(token)
  }
}

/// Resolve a pretrained backend: global nomic table when configured, else empty.
#[must_use]
pub fn default_pretrained() -> DefaultPretrained {
  DefaultPretrained
}

/// Delegates to [`NomicPretrained::global`] when available.
#[derive(Debug, Clone, Copy, Default)]
pub struct DefaultPretrained;

impl PretrainedEmbeddings for DefaultPretrained {
  fn lookup(&self, token: &str) -> Option<[i8; DIM]> {
    NomicPretrained::global().and_then(|nomic| nomic.lookup(token))
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  fn sample_blob(token_count: usize, dim: usize) -> Vec<u8> {
    let mut blob = Vec::with_capacity(8 + token_count * dim);
    blob.extend_from_slice(&(token_count as i32).to_le_bytes());
    blob.extend_from_slice(&(dim as i32).to_le_bytes());
    blob.extend((0..token_count * dim).map(|i| (i % 127) as u8));
    blob
  }

  #[test]
  fn loads_token_vector_files() {
    let dir = tempfile::tempdir().expect("tempdir");
    std::fs::write(dir.path().join("code_tokens.txt"), "error\nhandler\n").expect("tokens");
    std::fs::write(dir.path().join("code_vectors.bin"), sample_blob(2, DIM)).expect("vectors");

    let table = NomicPretrained::from_dir(dir.path()).expect("load");
    assert_eq!(table.token_count(), 2);
    assert!(table.lookup("error").is_some());
    assert!(table.lookup("missing").is_none());
  }
}
