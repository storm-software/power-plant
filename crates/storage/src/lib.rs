//! Execution persistence for the Power Plant runtime.
//!
//! Provides a trait-based interface so storage backends can be swapped without
//! touching the engine or bindings layers.
//!
//! - [`ExecutionStore`] — store and recall [`Execution`] values by id
//! - [`FsExecutionStore`] — filesystem implementation under the data directory

mod error;
mod execution_store;
mod fs_execution_store;

#[cfg(feature = "testing")]
mod in_memory_execution_store;

pub use error::StorageError;
pub use execution_store::ExecutionStore;
pub use fs_execution_store::FsExecutionStore;

#[cfg(feature = "testing")]
pub use in_memory_execution_store::InMemoryExecutionStore;
