![Power Plant's logo banner](https://public.storm-cdn.com/power-plant/media/banner-1280x320-dark.gif)

# Changelog for Power Plant - Native Bindings

## [0.1.4](https://github.com/storm-software/power-plant/releases/tag/native-bindings%400.1.4) (07/10/2026)

### Miscellaneous

- **monorepo:** Resolve merge conflicts ([0355057](https://github.com/storm-software/power-plant/commit/0355057))

### Bug Fixes

- **monorepo:** Resolve issue specifying release executor for native packages ([fd2d16e](https://github.com/storm-software/power-plant/commit/fd2d16e))

### Features

- **native-tree-sitter:** Initial check-in of the Tree Sitter crate with grammars ([5c6d56e](https://github.com/storm-software/power-plant/commit/5c6d56e))

## [0.1.3](https://github.com/storm-software/power-plant/releases/tag/native-bindings%400.1.3) (07/09/2026)

### Miscellaneous

- **monorepo:** Resolve merge conflicts ([0355057](https://github.com/storm-software/power-plant/commit/0355057))

### Bug Fixes

- **monorepo:** Resolve issue specifying release executor for native packages ([fd2d16e](https://github.com/storm-software/power-plant/commit/fd2d16e))

### Features

- **native-tree-sitter:** Initial check-in of the Tree Sitter crate with grammars ([5c6d56e](https://github.com/storm-software/power-plant/commit/5c6d56e))

## [0.1.2](https://github.com/storm-software/power-plant/releases/tag/native-bindings%400.1.2) (07/09/2026)

### Miscellaneous

- **monorepo:** Resolve merge conflicts ([0355057](https://github.com/storm-software/power-plant/commit/0355057))

### Features

- **native-tree-sitter:** Initial check-in of the Tree Sitter crate with grammars ([5c6d56e](https://github.com/storm-software/power-plant/commit/5c6d56e))

## [0.1.1](https://github.com/storm-software/power-plant/releases/tag/native-bindings%400.1.1) (07/09/2026)

### Miscellaneous

- **bindings:** Added binding result type-checks and updated `DateTime` inputs to use `i64` ([24258a9](https://github.com/storm-software/power-plant/commit/24258a9))
- **core:** Update `release` script to include artifact release and moved over bindings ([1bfa779](https://github.com/storm-software/power-plant/commit/1bfa779))
- **native-core:** Added `Settings` type and logic to read from system ([6d0b4fd](https://github.com/storm-software/power-plant/commit/6d0b4fd))
- **monorepo:** Resolve workspace linting issues ([bb6b3a2](https://github.com/storm-software/power-plant/commit/bb6b3a2))
- **monorepo:** Resolve issues with invalid triples configuration ([d0a441b](https://github.com/storm-software/power-plant/commit/d0a441b))
- **core:** Update type defintiions for session data models ([4a58aa6](https://github.com/storm-software/power-plant/commit/4a58aa6))
- **monorepo:** Update devenv `release-unix` profile to include `cmake` package ([034328b](https://github.com/storm-software/power-plant/commit/034328b))

### Bug Fixes

- **native-common:** Resolve issue with public crate modules ([f387c5c](https://github.com/storm-software/power-plant/commit/f387c5c))

### Features

- **native-core:** Added `Session` and `Settings` to `Context` and access function bindings ([0a6870d](https://github.com/storm-software/power-plant/commit/0a6870d))
- **asyncapi-schema:** Initial check-in of the AsyncAPI schema package ([98b03ec](https://github.com/storm-software/power-plant/commit/98b03ec))
- **native-engine:** Reorganized the native crates structure ([04c570d](https://github.com/storm-software/power-plant/commit/04c570d))
- **core:** Restructure `generator` to remove duplicate required configruations ([aceeb9d](https://github.com/storm-software/power-plant/commit/aceeb9d))
- **native-core:** Update naive engine to support metadata `search` functionality ([7d339d9](https://github.com/storm-software/power-plant/commit/7d339d9))
- **native-storage:** Added a crate to store `Execution` data after generation ([71bc930](https://github.com/storm-software/power-plant/commit/71bc930))
- **native-models:** Added the `Execution` models to define the stucture of source data ([7d3ec6b](https://github.com/storm-software/power-plant/commit/7d3ec6b))
- **monorepo:** Added native crates to support backend memory storage ([dac9923](https://github.com/storm-software/power-plant/commit/dac9923))

### Continuous Integration

- **bindings:** Update GitHub action workflow to cross-build native modules ([e1a4ab0](https://github.com/storm-software/power-plant/commit/e1a4ab0))
