![Power Plant's logo banner](https://public.storm-cdn.com/power-plant/media/banner-1280x320-dark.gif)

# Changelog for Power Plant - Schema

## [0.0.47](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.47) (07/28/2026)

### Miscellaneous

- **schema:** Ensure `any` schema includes all possible `type` values ([b9799a6](https://github.com/storm-software/power-plant/commit/b9799a6))

## [0.0.46](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.46) (07/28/2026)

### Bug Fixes

- **schema:** Resolve issue extracting `JsonSchemaAny` types ([1328b8d](https://github.com/storm-software/power-plant/commit/1328b8d))

## [0.0.45](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.45) (07/27/2026)

### Miscellaneous

- **core:** Updated logic to use `JsonSchemaAny` for any schemas ([1832abe](https://github.com/storm-software/power-plant/commit/1832abe))

### Bug Fixes

- **schema:** Resolve issue with any typed JSON schemas ([b8aac3c](https://github.com/storm-software/power-plant/commit/b8aac3c))

## [0.0.44](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.44) (07/27/2026)

### Miscellaneous

- **schema:** Reduce size of bundled package ([89fb3c7](https://github.com/storm-software/power-plant/commit/89fb3c7))

## [0.0.41](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.41) (07/27/2026)

### Bug Fixes

- **schema:** Resolve issue with missing package dependency ([3730f08](https://github.com/storm-software/power-plant/commit/3730f08))

## [0.0.40](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.40) (07/26/2026)

### Features

- **schema:** Added `deepkit` type annotations and bundled patched `@deepkit/type-compiler` dependency ([4ace9c6](https://github.com/storm-software/power-plant/commit/4ace9c6))

## [0.0.39](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.39) (07/26/2026)

### Bug Fixes

- **schema:** Resolve issue with missing `@deepkit/type-compiler` export ([794bf6e](https://github.com/storm-software/power-plant/commit/794bf6e))

## [0.0.38](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.38) (07/26/2026)

### Miscellaneous

- **schema:** Added `@deepkit/type-compiler` vendored export ([b3d71a9](https://github.com/storm-software/power-plant/commit/b3d71a9))

## [0.0.37](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.37) (07/26/2026)

### Bug Fixes

- **schema:** Resolved build issues ([72a23c3](https://github.com/storm-software/power-plant/commit/72a23c3))

### Features

- **schema:** Update `schema` to use `deepkit` instead of `ts-json-schema-generator` ([0cea48d](https://github.com/storm-software/power-plant/commit/0cea48d))

## [0.0.36](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.36) (07/26/2026)

### Features

- **schema:** Added support for function types in schema ([0f3179e](https://github.com/storm-software/power-plant/commit/0f3179e))

## [0.0.35](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.35) (07/26/2026)

### Miscellaneous

- **schema:** Updated `extract` logic to use `esbuild` to bundle code prior to extracting schema ([1660eb6](https://github.com/storm-software/power-plant/commit/1660eb6))

## [0.0.34](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.34) (07/26/2026)

### Miscellaneous

- **schema:** Set `skipTypeCheck` to true ([9066161](https://github.com/storm-software/power-plant/commit/9066161))

## [0.0.33](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.33) (07/26/2026)

### Miscellaneous

- **schema:** Update `extract` to no longer use vfs ([ce51ac4](https://github.com/storm-software/power-plant/commit/ce51ac4))

## [0.0.32](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.32) (07/26/2026)

### Bug Fixes

- **schema:** Resolve issue with root path directory in virtual typescript config ([b1b1a02](https://github.com/storm-software/power-plant/commit/b1b1a02))

## [0.0.31](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.31) (07/25/2026)

### Bug Fixes

- **schema:** Reenable type checking ([7d6be29](https://github.com/storm-software/power-plant/commit/7d6be29))

## [0.0.30](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.30) (07/24/2026)

### Miscellaneous

- **schema:** Added `logger` to `extract` function's options ([18304b9](https://github.com/storm-software/power-plant/commit/18304b9))

## [0.0.29](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.29) (07/24/2026)

### Bug Fixes

- **schema:** Resolve issue with invalid `tsconfig` path ([f2ede24](https://github.com/storm-software/power-plant/commit/f2ede24))

## [0.0.28](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.28) (07/24/2026)

### Miscellaneous

- **schema:** Update `extract` to allow `cwd` parameter in options ([282be6c](https://github.com/storm-software/power-plant/commit/282be6c))

## [0.0.26](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.26) (07/24/2026)

### Miscellaneous

- **schema:** Update package build to set `minify` to `false` ([5736cdf](https://github.com/storm-software/power-plant/commit/5736cdf))

## [0.0.25](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.25) (07/24/2026)

### Miscellaneous

- **schema:** Added logic to use `@typescript/vfs` to enable virtual storage in `extract` ([1587087](https://github.com/storm-software/power-plant/commit/1587087))

## [0.0.24](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.24) (07/24/2026)

### Miscellaneous

- **schema:** Add extra configuration values to `extract` options ([2b73467](https://github.com/storm-software/power-plant/commit/2b73467))

## [0.0.23](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.23) (07/24/2026)

### Miscellaneous

- **monorepo:** Regenerate `README.md` files for the workspace ([8c112b8](https://github.com/storm-software/power-plant/commit/8c112b8))

### Bug Fixes

- **schema:** Resolve issue extracting schemas from package path ([ac2255f](https://github.com/storm-software/power-plant/commit/ac2255f))

## [0.0.22](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.22) (07/23/2026)

### Miscellaneous

- **monorepo:** Update workspace packages' `README.md` files ([f9a7662](https://github.com/storm-software/power-plant/commit/f9a7662))

## [0.0.19](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.19) (07/23/2026)

### Features

- **schema:** Added logic to validate no schema contradictions exist in config ([3b020cb](https://github.com/storm-software/power-plant/commit/3b020cb))

## [0.0.17](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.17) (07/20/2026)

### Miscellaneous

- **monorepo:** Update the workspace packages' `README.md` file ([d028d1c](https://github.com/storm-software/power-plant/commit/d028d1c))

## [0.0.16](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.16) (07/20/2026)

### Miscellaneous

- **monorepo:** Update types and tagline used in `package.json` and `README.md` files ([19e044a](https://github.com/storm-software/power-plant/commit/19e044a))
- **core:** Remove unused meta functions and resolve TSC issues ([febf6f0](https://github.com/storm-software/power-plant/commit/febf6f0))

## [0.0.13](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.13) (07/13/2026)

### Miscellaneous

- **monorepo:** Update workspaces' devenv modules ([e157ddb](https://github.com/storm-software/power-plant/commit/e157ddb))

## [0.0.12](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.12) (07/10/2026)

### Miscellaneous

- **monorepo:** Cleaned up unused dependencies from the workspace's `Cargo.toml` file ([7b0de29](https://github.com/storm-software/power-plant/commit/7b0de29))
- **schema:** Resolve typing issues with `JsonSchema` ([151279c](https://github.com/storm-software/power-plant/commit/151279c))

## [0.0.10](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.10) (07/10/2026)

### Miscellaneous

- **monorepo:** Update `Cargo.lock` file ([d563c06](https://github.com/storm-software/power-plant/commit/d563c06))

### Features

- **native-tree-sitter:** Initial check-in of the Tree Sitter crate with grammars ([5c6d56e](https://github.com/storm-software/power-plant/commit/5c6d56e))

## [0.0.9](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.9) (07/10/2026)

### Miscellaneous

- **monorepo:** Update `Cargo.lock` file ([d563c06](https://github.com/storm-software/power-plant/commit/d563c06))

### Features

- **native-tree-sitter:** Initial check-in of the Tree Sitter crate with grammars ([5c6d56e](https://github.com/storm-software/power-plant/commit/5c6d56e))

## [0.0.8](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.8) (07/09/2026)

### Miscellaneous

- **monorepo:** Update `Cargo.lock` file ([d563c06](https://github.com/storm-software/power-plant/commit/d563c06))

### Features

- **native-tree-sitter:** Initial check-in of the Tree Sitter crate with grammars ([5c6d56e](https://github.com/storm-software/power-plant/commit/5c6d56e))

## [0.0.7](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.7) (07/09/2026)

### Miscellaneous

- **monorepo:** Update `Cargo.lock` file ([d563c06](https://github.com/storm-software/power-plant/commit/d563c06))

### Features

- **native-tree-sitter:** Initial check-in of the Tree Sitter crate with grammars ([5c6d56e](https://github.com/storm-software/power-plant/commit/5c6d56e))

## [0.0.6](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.6) (07/09/2026)

### Miscellaneous

- **monorepo:** Resolve workspace linting issues ([bb6b3a2](https://github.com/storm-software/power-plant/commit/bb6b3a2))

### Features

- **ai-sdk:** Initial check-in of the AI SDK tools package ([12f01e1](https://github.com/storm-software/power-plant/commit/12f01e1))
- **asyncapi-schema:** Initial check-in of the AsyncAPI schema package ([98b03ec](https://github.com/storm-software/power-plant/commit/98b03ec))
- **unstorage-input:** Updated `file` input to use `unstorage` for greater flexibility ([21f8358](https://github.com/storm-software/power-plant/commit/21f8358))
- **monorepo:** Added native crates to support backend memory storage ([dac9923](https://github.com/storm-software/power-plant/commit/dac9923))

## [0.0.5](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.5) (06/28/2026)

### Features

- **schema:** Added `zod` and `valibot` schemas and updated package exports ([6440150](https://github.com/storm-software/power-plant/commit/6440150))
- **core:** Rename `source` to `input` and `sink` to `output` ([1a3235f](https://github.com/storm-software/power-plant/commit/1a3235f))

## [0.0.4](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.4) (06/28/2026)

### Miscellaneous

- **schema:** Rename `displayName` to `title` for consistency ([31ded5c](https://github.com/storm-software/power-plant/commit/31ded5c))

### Features

- **openapi-schema:** Added the OpenAPI schema package ([ed3fc82](https://github.com/storm-software/power-plant/commit/ed3fc82))
- **core:** Move base meta and schema logic into the `core` package ([c0e8502](https://github.com/storm-software/power-plant/commit/c0e8502))

## [0.0.3](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.3) (06/27/2026)

### Miscellaneous

- **monorepo:** Move `core` and `schema` packages into `base` directory ([f832989](https://github.com/storm-software/power-plant/commit/f832989))

### Features

- **core:** Added create and define methods to extend core functionality ([180a095](https://github.com/storm-software/power-plant/commit/180a095))

### Continuous Integration

- **monorepo:** Update README file templates, add `readme` git hook, and regenerate `README.md` files ([8b35f6c](https://github.com/storm-software/power-plant/commit/8b35f6c))

## [0.0.2](https://github.com/storm-software/power-plant/releases/tag/schema%400.0.2) (06/23/2026)

### Features

- **monorepo:** Added `source`, `sink`, and `generator` modules and clean up repository ([c4656a7](https://github.com/storm-software/power-plant/commit/c4656a7))
