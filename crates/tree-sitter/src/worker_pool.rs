#[cfg(not(target_family = "wasm"))]
use rayon::prelude::*;

/// Options for parallel dispatch.
#[derive(Debug, Clone, Copy)]
pub struct ParallelForOpts {
  pub max_workers: usize,
}

impl Default for ParallelForOpts {
  fn default() -> Self {
    Self { max_workers: default_worker_count(true) }
  }
}

/// Default worker count for pipeline phases.
pub fn default_worker_count(initial: bool) -> usize {
  let _ = initial;
  std::thread::available_parallelism().map(std::num::NonZeroUsize::get).unwrap_or(1)
}

/// Effective worker count honoring `POWER_PLANT_INDEX_SINGLE_THREAD=1`.
pub fn effective_worker_count(initial: bool) -> usize {
  if std::env::var("POWER_PLANT_INDEX_SINGLE_THREAD").is_ok_and(|v| v == "1") {
    return 1;
  }
  default_worker_count(initial)
}

/// Dispatch `count` iterations across a worker pool. Each index is visited once.
pub fn parallel_for<F>(count: usize, f: F, opts: ParallelForOpts)
where
  F: Fn(usize) + Sync,
{
  if count == 0 {
    return;
  }

  let workers = if opts.max_workers == 0 { effective_worker_count(true) } else { opts.max_workers };

  if count <= 1 || workers <= 1 {
    for idx in 0..count {
      f(idx);
    }
    return;
  }

  #[cfg(not(target_family = "wasm"))]
  {
    let pool = rayon::ThreadPoolBuilder::new()
      .num_threads(workers)
      .build()
      .unwrap_or_else(|_| rayon::ThreadPoolBuilder::new().build().expect("rayon pool"));
    pool.install(|| {
      (0..count).into_par_iter().for_each(|idx| f(idx));
    });
  }

  #[cfg(target_family = "wasm")]
  {
    for idx in 0..count {
      f(idx);
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::sync::Arc;
  use std::sync::atomic::{AtomicUsize, Ordering};

  #[test]
  fn parallel_for_visits_each_index_once() {
    let seen = Arc::new(AtomicUsize::new(0));
    parallel_for(
      16,
      {
        let seen = Arc::clone(&seen);
        move |_| {
          seen.fetch_add(1, Ordering::SeqCst);
        }
      },
      ParallelForOpts { max_workers: 4 },
    );
    assert_eq!(seen.load(Ordering::SeqCst), 16);
  }

  #[test]
  fn single_worker_runs_sequential() {
    let seen = Arc::new(AtomicUsize::new(0));
    parallel_for(
      5,
      {
        let seen = Arc::clone(&seen);
        move |_| {
          seen.fetch_add(1, Ordering::SeqCst);
        }
      },
      ParallelForOpts { max_workers: 1 },
    );
    assert_eq!(seen.load(Ordering::SeqCst), 5);
  }
}
