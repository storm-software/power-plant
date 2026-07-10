use std::sync::atomic::{AtomicBool, Ordering};

/// Cancellation flag shared across pipeline phases.
#[derive(Debug, Default)]
pub struct CancellationToken(AtomicBool);

impl CancellationToken {
  pub fn cancel(&self) {
    self.0.store(true, Ordering::SeqCst);
  }

  pub fn is_cancelled(&self) -> bool {
    self.0.load(Ordering::SeqCst)
  }
}
