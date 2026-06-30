//! Execution persistence for the Power Plant runtime.
//!
//! Provides a trait-based interface so storage backends can be swapped without
//! touching the engine or bindings layers.
//!
//! - [`ExecutionStore`] — store, recall, and search [`Execution`] values
//! - [`FsExecutionStore`] — filesystem implementation under the data directory
//! - [`IndexedExecutionStore`] — optional Ladybug graph + vector metadata index

mod error;
mod execution_metadata;
mod execution_store;
mod fs_execution_store;
mod indexed_execution_store;

#[cfg(feature = "testing")]
mod in_memory_execution_store;

#[cfg(feature = "ladybug")]
mod ladybug;

pub use error::StorageError;
pub use execution_store::ExecutionStore;
pub use fs_execution_store::FsExecutionStore;
pub use indexed_execution_store::IndexedExecutionStore;

#[cfg(feature = "testing")]
pub use in_memory_execution_store::InMemoryExecutionStore;

#[cfg(feature = "ladybug")]
pub use ladybug::LadybugExecutionIndex;
