# Power Plant - Storage Crate

Trait-based execution persistence for the Power Plant runtime.

## Backends

| Type                                                         | Description                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| [`FsExecutionStore`](src/fs_execution_store.rs)              | Primary JSON file store under `{data_path}/executions/`                   |
| [`InMemoryExecutionStore`](src/in_memory_execution_store.rs) | In-memory store for tests (`testing` feature)                             |
| [`IndexedExecutionStore`](src/indexed_execution_store.rs)    | Wraps a primary store and indexes metadata in Ladybug (`ladybug` feature) |

## Features

| Feature   | Default | Description                                                                                             |
| --------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `testing` | no      | Exposes `InMemoryExecutionStore`                                                                        |
| `ladybug` | no      | Indexes execution metadata in an embedded [Ladybug](https://docs.ladybugdb.com) graph + vector database |

Enable Ladybug indexing from `power-plant-core`:

```toml
power-plant-core = { path = "../core", features = ["ladybug"] }
```

With `ladybug` enabled:

- `store` writes JSON to disk and indexes graph nodes (`Execution`, `Component`) plus a 384-dim embedding derived from searchable metadata
- `search` queries the Ladybug index first (text, filters, or vector similarity), then falls back to scanning JSON files
- `recall` continues to load the authoritative JSON record by id

## API

[`ExecutionStore`](src/execution_store.rs) exposes:

- `store` — persist an execution by id
- `recall` — load an execution by id
- `search` — query execution metadata by text, filters, or optional embedding vector
