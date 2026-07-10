use std::sync::atomic::{AtomicU8, Ordering};
use std::thread;
use std::time::Duration;

/// Global index lock: prevents concurrent pipeline runs on the same DB.
static PIPELINE_BUSY: AtomicU8 = AtomicU8::new(0);

const LOCK_SPIN: Duration = Duration::from_millis(100);

/// Try to acquire the global index lock without blocking.
pub fn try_lock() -> bool {
  PIPELINE_BUSY.compare_exchange(0, 1, Ordering::Acquire, Ordering::Relaxed).is_ok()
}

/// Acquire the global index lock, spinning until available.
pub fn lock() {
  while PIPELINE_BUSY.compare_exchange(0, 1, Ordering::Acquire, Ordering::Relaxed).is_err() {
    thread::sleep(LOCK_SPIN);
  }
}

/// Release the global index lock.
pub fn unlock() {
  PIPELINE_BUSY.store(0, Ordering::Release);
}
