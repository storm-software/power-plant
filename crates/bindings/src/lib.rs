//! Power Plant binding crate: provides N-API (Node.js) facing helpers to create, start and
//! shutdown a tuned Tokio runtime (including WASM specific lifecycle helpers) used by the
//! power_plant build pipeline. The runtime sizing is customized to better match power_plant's
//! workload characteristics (more CPU-bound / blocking tasks on worker threads).

// Allow type complexity rule, because NAPI-RS requires the direct types to generate the TypeScript definitions.
#![allow(clippy::type_complexity)]
// Due to the bound of NAPI-RS, we need to use `String` though we only need `&str`.
#![allow(clippy::needless_pass_by_value)]
// Most of transmute are just change the lifetime `'a` to `'static`., the annotation, e.g.
//
// BindingsTransformPluginContext::new(unsafe {
//   std::mem::transmute::<
//     &power_plant_plugin::TransformPluginContext<'_>,
//     &power_plant_plugin::TransformPluginContext<'_>,
//   >(ctx)
// }),
// Looks redundant
#![allow(clippy::missing_transmute_annotations)]

#[cfg(all(target_family = "wasm", tokio_unstable))]
use std::sync::{
  LazyLock,
  atomic::{AtomicU32, Ordering},
};

use napi_derive::napi;

#[cfg(all(
  not(target_family = "wasm"),
  not(feature = "default_global_allocator"),
  not(target_env = "ohos")
))]
#[global_allocator]
static ALLOC: mimalloc_safe::MiMalloc = mimalloc_safe::MiMalloc;

pub mod binding_engine;
pub mod types;
pub mod utils;
pub mod worker_manager;

#[napi_derive::napi]
pub fn create_tokio_runtime(blocking_threads: Option<u32>) {
  use napi::{bindgen_prelude::create_custom_tokio_runtime, tokio};
  let max_blocking_threads = blocking_threads
    .map(|v| v as usize)
    .or_else(|| {
      std::env::var("POWER_PLANT_MAX_BLOCKING_THREADS").ok().and_then(|v| v.parse::<usize>().ok())
    })
    // default value in tokio implementation is **512**
    // it's too high for us
    // we don't have that many `blocking` tasks to run at this moment
    .unwrap_or(4);
  let mut builder = tokio::runtime::Builder::new_multi_thread();

  let rt = builder
    .max_blocking_threads(max_blocking_threads)
    // unlike the web server scenario
    // Power Plant puts a lot of blocking tasks in the worker threads rather than blocking_threads
    // so we need to increase the worker threads rather than the blocking_threads
    .worker_threads(num_cpus::get_physical() * 3 / 2)
    .enable_all()
    .build()
    .expect("Failed to create tokio runtime");
  create_custom_tokio_runtime(rt);
}

#[cfg(all(target_family = "wasm", tokio_unstable))]
pub static ACTIVE_TASK_COUNT: LazyLock<AtomicU32> = LazyLock::new(|| AtomicU32::new(1));

#[napi]
/// Shutdown the tokio runtime manually.
///
/// This is required for the wasm target with `tokio_unstable` cfg.
/// In the wasm runtime, the `park` threads will hang there until the tokio::Runtime is shutdown.
pub fn shutdown_async_runtime() {
  #[cfg(all(target_family = "wasm", tokio_unstable))]
  {
    if ACTIVE_TASK_COUNT.load(Ordering::Relaxed) > 0 {
      if ACTIVE_TASK_COUNT.fetch_sub(1, Ordering::Relaxed) == 1 {
        napi::bindgen_prelude::shutdown_async_runtime();
      }
    }
  }
}

#[napi]
/// Start the async runtime manually.
///
/// This is required when the async runtime is shutdown manually.
/// Usually it's used in test.
pub fn start_async_runtime() {
  #[cfg(all(target_family = "wasm", tokio_unstable))]
  {
    napi::bindgen_prelude::start_async_runtime();
    ACTIVE_TASK_COUNT.fetch_add(1, Ordering::Relaxed);
  }
}

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    let result = 2 + 2;
    assert_eq!(result, 4);
  }
}
