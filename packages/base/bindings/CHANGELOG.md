![Power Plant's logo banner](https://public.storm-cdn.com/power-plant/media/banner-1280x320-dark.gif)

# Changelog for Power Plant - Bindings

## [0.0.2](https://github.com/storm-software/power-plant/releases/tag/bindings%400.0.2) (07/09/2026)

### Miscellaneous

- **bindings:** Update config to populate `artifacts` directory with build output ([92b3980](https://github.com/storm-software/power-plant/commit/92b3980))
- **core:** Added initial logic to extract meta values ([9a24f77](https://github.com/storm-software/power-plant/commit/9a24f77))
- **bindings:** Resolve issue with `cwd` set for `artifacts` target ([216310b](https://github.com/storm-software/power-plant/commit/216310b))
- **bindings:** Added binding result type-checks and updated `DateTime` inputs to use `i64` ([24258a9](https://github.com/storm-software/power-plant/commit/24258a9))
- **bindings:** Update the `BindingEngine` code and `devenv` modules ([d3b9f9a](https://github.com/storm-software/power-plant/commit/d3b9f9a))
- **core:** Update `release` script to include artifact release and moved over bindings ([1bfa779](https://github.com/storm-software/power-plant/commit/1bfa779))
- **monorepo:** Added `deploy-artifacts` to release script ([1325ae6](https://github.com/storm-software/power-plant/commit/1325ae6))
- **native-core:** Added `Settings` type and logic to read from system ([6d0b4fd](https://github.com/storm-software/power-plant/commit/6d0b4fd))
- **monorepo:** Added `logLevel` to windows bindings build ([b357867](https://github.com/storm-software/power-plant/commit/b357867))
- **monorepo:** Added codegen script and resolved args issue during bindings build ([3994f90](https://github.com/storm-software/power-plant/commit/3994f90))
- **monorepo:** Updated `release` workflow and Nx targets to provide values through command-line ([360a253](https://github.com/storm-software/power-plant/commit/360a253))
- **monorepo:** Resolve wasm build issue and regenerate bindings files ([1ef6ddc](https://github.com/storm-software/power-plant/commit/1ef6ddc))
- **monorepo:** Resolve issues with invalid triples configuration ([d0a441b](https://github.com/storm-software/power-plant/commit/d0a441b))
- **core:** Update type defintiions for session data models ([4a58aa6](https://github.com/storm-software/power-plant/commit/4a58aa6))
- **monorepo:** Resolve issue with native modules builds in CI ([8fa4e1b](https://github.com/storm-software/power-plant/commit/8fa4e1b))

### Bug Fixes

- **bindings:** Added the missing binding targets to `project.json` file ([ea732f0](https://github.com/storm-software/power-plant/commit/ea732f0))

### Features

- **native-core:** Added `Session` and `Settings` to `Context` and access function bindings ([0a6870d](https://github.com/storm-software/power-plant/commit/0a6870d))
- **handlebars:** Initial check-in of the Handlebars templating generator package ([f9eb5ff](https://github.com/storm-software/power-plant/commit/f9eb5ff))
- **asyncapi-schema:** Initial check-in of the AsyncAPI schema package ([98b03ec](https://github.com/storm-software/power-plant/commit/98b03ec))
- **unstorage-input:** Updated `file` input to use `unstorage` for greater flexibility ([21f8358](https://github.com/storm-software/power-plant/commit/21f8358))
- **unstorage-output:** Update default output extension to use `unstorage` for flexibility ([f48e7ea](https://github.com/storm-software/power-plant/commit/f48e7ea))
- **core:** Restructure `generator` to remove duplicate required configruations ([aceeb9d](https://github.com/storm-software/power-plant/commit/aceeb9d))
- **bindings:** Renamed `engine` package to `bindings` ([c2a531b](https://github.com/storm-software/power-plant/commit/c2a531b))

### Continuous Integration

- **bindings:** Added FreeBSD build to cross-compile matrix ([a85448e](https://github.com/storm-software/power-plant/commit/a85448e))
- **bindings:** Resolve issue with Bindings project's `artifacts` target name ([9a16f04](https://github.com/storm-software/power-plant/commit/9a16f04))
- **bindings:** Update bindings build to use cross compile for Windows ([dfb2de0](https://github.com/storm-software/power-plant/commit/dfb2de0))
- **monorepo:** Resolve issue with missing `zig` install during aarch64-linux-gnu build ([ddd8688](https://github.com/storm-software/power-plant/commit/ddd8688))
- **monorepo:** Resolve cross-build issue in `release` workflow ([11b0853](https://github.com/storm-software/power-plant/commit/11b0853))
- **bindings:** Update GitHub action workflow to cross-build native modules ([e1a4ab0](https://github.com/storm-software/power-plant/commit/e1a4ab0))

### Updated Dependencies

- Updated **core** to **v0.0.6**
- Updated **schema** to **v0.0.6**
