/* -------------------------------------------------------------------

                  🗲 Storm Software - Power Plant

 This code was released as part of the Power Plant project. Power Plant
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/power-plant.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/power-plant
 Documentation:            https://docs.stormsoftware.com/projects/power-plant
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

export type MaybePromise<T> = T | Promise<T>;
export type Nullable<T> = T | null | undefined;
type VoidNullable<T = void> = T | null | undefined | void;
export type BindingStringOrRegex = string | RegExp;
type BindingResult<T> =
  { errors: BindingError[]; isBindingErrors: boolean } | T;

export interface Comment {
  type: "Line" | "Block";
  value: string;
  start: number;
  end: number;
}

export interface ErrorLabel {
  message?: string;
  start: number;
  end: number;
}

export interface OxcError {
  severity: Severity;
  message: string;
  labels: Array<ErrorLabel>;
  helpMessage?: string;
  codeframe?: string;
}

export declare const enum Severity {
  Error = "Error",
  Warning = "Warning",
  Advice = "Advice"
}
export declare class ParseResult {
  get program(): import("@oxc-project/types").Program;

  get module(): EcmaScriptModule;

  get comments(): Array<Comment>;

  get errors(): Array<OxcError>;
}

export interface DynamicImport {
  start: number;
  end: number;
  moduleRequest: Span;
}

export interface EcmaScriptModule {
  /**
   * Has ESM syntax.
   *
   * i.e. `import` and `export` statements, and `import.meta`.
   *
   * Dynamic imports `import('foo')` are ignored since they can be used in non-ESM files.
   */
  hasModuleSyntax: boolean;
  /** Import statements. */
  staticImports: Array<StaticImport>;
  /** Export statements. */
  staticExports: Array<StaticExport>;
  /** Dynamic import expressions. */
  dynamicImports: Array<DynamicImport>;
  /** Span positions` of `import.meta` */
  importMetas: Array<Span>;
}

export interface ExportExportName {
  kind: ExportExportNameKind;
  name?: string;
  start?: number;
  end?: number;
}

export declare const enum ExportExportNameKind {
  /** `export { name } */
  Name = "Name",
  /** `export default expression` */
  Default = "Default",
  /** `export * from "mod" */
  None = "None"
}

export interface ExportImportName {
  kind: ExportImportNameKind;
  name?: string;
  start?: number;
  end?: number;
}

export declare const enum ExportImportNameKind {
  /** `export { name } */
  Name = "Name",
  /** `export * as ns from "mod"` */
  All = "All",
  /** `export * from "mod"` */
  AllButDefault = "AllButDefault",
  /** Does not have a specifier. */
  None = "None"
}

export interface ExportLocalName {
  kind: ExportLocalNameKind;
  name?: string;
  start?: number;
  end?: number;
}

export declare const enum ExportLocalNameKind {
  /** `export { name } */
  Name = "Name",
  /** `export default expression` */
  Default = "Default",
  /**
   * If the exported value is not locally accessible from within the module.
   * `export default function () {}`
   */
  None = "None"
}

export interface ImportName {
  kind: ImportNameKind;
  name?: string;
  start?: number;
  end?: number;
}

export declare const enum ImportNameKind {
  /** `import { x } from "mod"` */
  Name = "Name",
  /** `import * as ns from "mod"` */
  NamespaceObject = "NamespaceObject",
  /** `import defaultExport from "mod"` */
  Default = "Default"
}

/**
 * Parse asynchronously.
 *
 * Note: This function can be slower than `parseSync` due to the overhead of spawning a thread.
 */
export declare function parseAsync(
  filename: string,
  sourceText: string,
  options?: ParserOptions | undefined | null
): Promise<ParseResult>;

export interface ParserOptions {
  /** Treat the source text as `js`, `jsx`, `ts`, `tsx` or `dts`. */
  lang?: "js" | "jsx" | "ts" | "tsx" | "dts";
  /** Treat the source text as `script` or `module` code. */
  sourceType?: "script" | "module" | "unambiguous" | undefined;
  /**
   * Return an AST which includes TypeScript-related properties, or excludes them.
   *
   * `'js'` is default for JS / JSX files.
   * `'ts'` is default for TS / TSX files.
   * The type of the file is determined from `lang` option, or extension of provided `filename`.
   */
  astType?: "js" | "ts";
  /**
   * Controls whether the `range` property is included on AST nodes.
   * The `range` property is a `[number, number]` which indicates the start/end offsets
   * of the node in the file contents.
   *
   * @default false
   */
  range?: boolean;
  /**
   * Emit `ParenthesizedExpression` and `TSParenthesizedType` in AST.
   *
   * If this option is true, parenthesized expressions are represented by
   * (non-standard) `ParenthesizedExpression` and `TSParenthesizedType` nodes that
   * have a single `expression` property containing the expression inside parentheses.
   *
   * @default true
   */
  preserveParens?: boolean;
  /**
   * Produce semantic errors with an additional AST pass.
   * Semantic errors depend on symbols and scopes, where the parser does not construct.
   * This adds a small performance overhead.
   *
   * @default false
   */
  showSemanticErrors?: boolean;
}

/** Parse synchronously. */
export declare function parseSync(
  filename: string,
  sourceText: string,
  options?: ParserOptions | undefined | null
): ParseResult;

/** Returns `true` if raw transfer is supported on this platform. */
export declare function rawTransferSupported(): boolean;

export interface Span {
  start: number;
  end: number;
}

export interface StaticExport {
  start: number;
  end: number;
  entries: Array<StaticExportEntry>;
}

export interface StaticExportEntry {
  start: number;
  end: number;
  moduleRequest?: ValueSpan;
  /** The name under which the desired binding is exported by the module`. */
  importName: ExportImportName;
  /** The name used to export this binding by this module. */
  exportName: ExportExportName;
  /** The name that is used to locally access the exported value from within the importing module. */
  localName: ExportLocalName;
  /**
   * Whether the export is a TypeScript `export type`.
   *
   * Examples:
   *
   * ```ts
   * export type * from 'mod';
   * export type * as ns from 'mod';
   * export type { foo };
   * export { type foo }:
   * export type { foo } from 'mod';
   * ```
   */
  isType: boolean;
}

export interface StaticImport {
  /** Start of import statement. */
  start: number;
  /** End of import statement. */
  end: number;
  /**
   * Import source.
   *
   * ```js
   * import { foo } from "mod";
   * //                   ^^^
   * ```
   */
  moduleRequest: ValueSpan;
  /**
   * Import specifiers.
   *
   * Empty for `import "mod"`.
   */
  entries: Array<StaticImportEntry>;
}

export interface StaticImportEntry {
  /**
   * The name under which the desired binding is exported by the module.
   *
   * ```js
   * import { foo } from "mod";
   * //       ^^^
   * import { foo as bar } from "mod";
   * //       ^^^
   * ```
   */
  importName: ImportName;
  /**
   * The name that is used to locally access the imported value from within the importing module.
   * ```js
   * import { foo } from "mod";
   * //       ^^^
   * import { foo as bar } from "mod";
   * //              ^^^
   * ```
   */
  localName: ValueSpan;
  /**
   * Whether this binding is for a TypeScript type-only import.
   *
   * `true` for the following imports:
   * ```ts
   * import type { foo } from "mod";
   * import { type foo } from "mod";
   * ```
   */
  isType: boolean;
}

export interface ValueSpan {
  value: string;
  start: number;
  end: number;
}
export declare class ResolverFactory {
  constructor(options?: NapiResolveOptions | undefined | null);

  static default(): ResolverFactory;

  /** Clone the resolver using the same underlying cache. */
  cloneWithOptions(options: NapiResolveOptions): ResolverFactory;

  /**
   * Clear the underlying cache.
   *
   * Warning: The caller must ensure that there're no ongoing resolution operations when calling this method. Otherwise, it may cause those operations to return an incorrect result.
   */
  clearCache(): void;

  /** Synchronously resolve `specifier` at an absolute path to a `directory`. */
  sync(directory: string, request: string): ResolveResult;

  /** Asynchronously resolve `specifier` at an absolute path to a `directory`. */
  async(directory: string, request: string): Promise<ResolveResult>;

  /**
   * Synchronously resolve `specifier` at an absolute path to a `file`.
   *
   * This method automatically discovers tsconfig.json by traversing parent directories.
   */
  resolveFileSync(file: string, request: string): ResolveResult;

  /**
   * Asynchronously resolve `specifier` at an absolute path to a `file`.
   *
   * This method automatically discovers tsconfig.json by traversing parent directories.
   */
  resolveFileAsync(file: string, request: string): Promise<ResolveResult>;

  /**
   * Synchronously resolve `specifier` for TypeScript declaration files.
   *
   * `file` is the absolute path to the containing file.
   * Uses TypeScript's `moduleResolution: "bundler"` algorithm.
   */
  resolveDtsSync(file: string, request: string): ResolveResult;

  /**
   * Asynchronously resolve `specifier` for TypeScript declaration files.
   *
   * `file` is the absolute path to the containing file.
   * Uses TypeScript's `moduleResolution: "bundler"` algorithm.
   */
  resolveDtsAsync(file: string, request: string): Promise<ResolveResult>;
}

/** Node.js builtin module when `Options::builtin_modules` is enabled. */
export interface Builtin {
  /**
   * Resolved module.
   *
   * Always prefixed with "node:" in compliance with the ESM specification.
   */
  resolved: string;
  /**
   * Whether the request was prefixed with `node:` or not.
   * `fs` -> `false`.
   * `node:fs` returns `true`.
   */
  isRuntimeModule: boolean;
}

export declare const enum EnforceExtension {
  Auto = 0,
  Enabled = 1,
  Disabled = 2
}

export declare const enum ModuleType {
  Module = "module",
  CommonJs = "commonjs",
  Json = "json",
  Wasm = "wasm",
  Addon = "addon"
}

/**
 * Module Resolution Options
 *
 * Options are directly ported from [enhanced-resolve](https://github.com/webpack/enhanced-resolve#resolver-options).
 *
 * See [webpack resolve](https://webpack.js.org/configuration/resolve/) for information and examples
 */
export interface NapiResolveOptions {
  /**
   * Discover tsconfig automatically or use the specified tsconfig.json path.
   *
   * Default `None`
   */
  tsconfig?: "auto" | TsconfigOptions;
  /**
   * Alias for [ResolveOptions::alias] and [ResolveOptions::fallback].
   *
   * For the second value of the tuple, `None -> AliasValue::Ignore`, Some(String) ->
   * AliasValue::Path(String)`
   * Create aliases to import or require certain modules more easily.
   * A trailing $ can also be added to the given object's keys to signify an exact match.
   * Default `{}`
   */
  alias?: Record<string, Array<string | undefined | null>>;
  /**
   * A list of alias fields in description files.
   * Specify a field, such as `browser`, to be parsed according to [this specification](https://github.com/defunctzombie/package-browser-field-spec).
   * Can be a path to json object such as `["path", "to", "exports"]`.
   *
   * Default `[]`
   */
  aliasFields?: (string | string[])[];
  /**
   * Condition names for exports field which defines entry points of a package.
   * The key order in the exports field is significant. During condition matching, earlier entries have higher priority and take precedence over later entries.
   *
   * Default `[]`
   */
  conditionNames?: Array<string>;
  /**
   * If true, it will not allow extension-less files.
   * So by default `require('./foo')` works if `./foo` has a `.js` extension,
   * but with this enabled only `require('./foo.js')` will work.
   *
   * Default to `true` when [ResolveOptions::extensions] contains an empty string.
   * Use `Some(false)` to disable the behavior.
   * See <https://github.com/webpack/enhanced-resolve/pull/285>
   *
   * Default None, which is the same as `Some(false)` when the above empty rule is not applied.
   */
  enforceExtension?: EnforceExtension;
  /**
   * A list of exports fields in description files.
   * Can be a path to json object such as `["path", "to", "exports"]`.
   *
   * Default `[["exports"]]`.
   */
  exportsFields?: (string | string[])[];
  /**
   * Fields from `package.json` which are used to provide the internal requests of a package
   * (requests starting with # are considered internal).
   *
   * Can be a path to a JSON object such as `["path", "to", "imports"]`.
   *
   * Default `[["imports"]]`.
   */
  importsFields?: (string | string[])[];
  /**
   * An object which maps extension to extension aliases.
   *
   * Default `{}`
   */
  extensionAlias?: Record<string, Array<string>>;
  /**
   * Attempt to resolve these extensions in order.
   * If multiple files share the same name but have different extensions,
   * will resolve the one with the extension listed first in the array and skip the rest.
   *
   * Default `[".js", ".json", ".node"]`
   */
  extensions?: Array<string>;
  /**
   * Redirect module requests when normal resolving fails.
   *
   * Default `{}`
   */
  fallback?: Record<string, Array<string | undefined | null>>;
  /**
   * Request passed to resolve is already fully specified and extensions or main files are not resolved for it (they are still resolved for internal requests).
   *
   * See also webpack configuration [resolve.fullySpecified](https://webpack.js.org/configuration/module/#resolvefullyspecified)
   *
   * Default `false`
   */
  fullySpecified?: boolean;
  /**
   * A list of main fields in description files
   *
   * Default `["main"]`.
   */
  mainFields?: string | string[];
  /**
   * The filename to be used while resolving directories.
   *
   * Default `["index"]`
   */
  mainFiles?: Array<string>;
  /**
   * A list of directories to resolve modules from, can be absolute path or folder name.
   *
   * Default `["node_modules"]`
   */
  modules?: string | string[];
  /**
   * Resolve to a context instead of a file.
   *
   * Default `false`
   */
  resolveToContext?: boolean;
  /**
   * Prefer to resolve module requests as relative requests instead of using modules from node_modules directories.
   *
   * Default `false`
   */
  preferRelative?: boolean;
  /**
   * Prefer to resolve server-relative urls as absolute paths before falling back to resolve in ResolveOptions::roots.
   *
   * Default `false`
   */
  preferAbsolute?: boolean;
  /**
   * A list of resolve restrictions to restrict the paths that a request can be resolved on.
   *
   * Default `[]`
   */
  restrictions?: Array<Restriction>;
  /**
   * A list of directories where requests of server-relative URLs (starting with '/') are resolved.
   * On non-Windows systems these requests are resolved as an absolute path first.
   *
   * Default `[]`
   */
  roots?: Array<string>;
  /**
   * Whether to resolve symlinks to their symlinked location.
   * When enabled, symlinked resources are resolved to their real path, not their symlinked location.
   * Note that this may cause module resolution to fail when using tools that symlink packages (like npm link).
   *
   * Default `true`
   */
  symlinks?: boolean;
  /**
   * Whether to read the `NODE_PATH` environment variable and append its entries to `modules`.
   *
   * `NODE_PATH` is a deprecated Node.js feature that is not part of ESM resolution.
   * Set this to `false` to disable the behavior.
   *
   * Default `true`
   */
  nodePath?: boolean;
  /**
   * Whether to parse [module.builtinModules](https://nodejs.org/api/module.html#modulebuiltinmodules) or not.
   * For example, "zlib" will throw [crate::ResolveError::Builtin] when set to true.
   *
   * Default `false`
   */
  builtinModules?: boolean;
  /**
   * Resolve [ResolveResult::moduleType].
   *
   * Default `false`
   */
  moduleType?: boolean;
  /**
   * Allow `exports` field in `require('../directory')`.
   *
   * This is not part of the spec but some vite projects rely on this behavior.
   * See
   * * <https://github.com/vitejs/vite/pull/20252>
   * * <https://github.com/nodejs/node/issues/58827>
   *
   * Default: `false`
   */
  allowPackageExportsInDirectoryResolve?: boolean;
}

export interface ResolveResult {
  path?: string;
  error?: string;
  builtin?: Builtin;
  /**
   * Module type for this path.
   *
   * Enable with `ResolveOptions#moduleType`.
   *
   * The module type is computed `ESM_FILE_FORMAT` from the [ESM resolution algorithm specification](https://nodejs.org/docs/latest/api/esm.html#resolution-algorithm-specification).
   *
   *  The algorithm uses the file extension or finds the closest `package.json` with the `type` field.
   */
  moduleType?: ModuleType;
  /** `package.json` path for the given module. */
  packageJsonPath?: string;
}

/**
 * Alias Value for [ResolveOptions::alias] and [ResolveOptions::fallback].
 * Use struct because napi don't support structured union now
 */
export interface Restriction {
  path?: string;
  regex?: string;
}

export declare function sync(path: string, request: string): ResolveResult;

/**
 * Tsconfig Options
 *
 * Derived from [tsconfig-paths-webpack-plugin](https://github.com/dividab/tsconfig-paths-webpack-plugin#options)
 */
export interface TsconfigOptions {
  /**
   * Allows you to specify where to find the TypeScript configuration file.
   * You may provide
   * * a relative path to the configuration file. It will be resolved relative to cwd.
   * * an absolute path to the configuration file.
   */
  configFile: string;
  /**
   * Support for Typescript Project References.
   *
   * * `'auto'`: use the `references` field from tsconfig of `config_file`.
   */
  references?: "auto";
}
export interface SourceMap {
  file?: string;
  mappings: string;
  names: Array<string>;
  sourceRoot?: string;
  sources: Array<string>;
  sourcesContent?: Array<string>;
  version: number;
  x_google_ignoreList?: Array<number>;
}
export interface ArrowFunctionsOptions {
  /**
   * This option enables the following:
   * * Wrap the generated function in .bind(this) and keeps uses of this inside the function as-is, instead of using a renamed this.
   * * Add a runtime check to ensure the functions are not instantiated.
   * * Add names to arrow functions.
   *
   * @default false
   */
  spec?: boolean;
}

export interface CompilerAssumptions {
  ignoreFunctionLength?: boolean;
  noDocumentAll?: boolean;
  objectRestNoSymbols?: boolean;
  pureGetters?: boolean;
  /**
   * When using public class fields, assume that they don't shadow any getter in the current class,
   * in its subclasses or in its superclass. Thus, it's safe to assign them rather than using
   * `Object.defineProperty`.
   *
   * For example:
   *
   * Input:
   * ```js
   * class Test {
   *  field = 2;
   *
   *  static staticField = 3;
   * }
   * ```
   *
   * When `set_public_class_fields` is `true`, the output will be:
   * ```js
   * class Test {
   *  constructor() {
   *    this.field = 2;
   *  }
   * }
   * Test.staticField = 3;
   * ```
   *
   * Otherwise, the output will be:
   * ```js
   * import _defineProperty from "@oxc-project/runtime/helpers/defineProperty";
   * class Test {
   *   constructor() {
   *     _defineProperty(this, "field", 2);
   *   }
   * }
   * _defineProperty(Test, "staticField", 3);
   * ```
   *
   * NOTE: For TypeScript, if you wanted behavior is equivalent to `useDefineForClassFields: false`, you should
   * set both `set_public_class_fields` and [`crate::TypeScriptOptions::remove_class_fields_without_initializer`]
   * to `true`.
   */
  setPublicClassFields?: boolean;
}

export interface DecoratorOptions {
  /**
   * Enables experimental support for decorators, which is a version of decorators that predates the TC39 standardization process.
   *
   * Decorators are a language feature which hasn’t yet been fully ratified into the JavaScript specification.
   * This means that the implementation version in TypeScript may differ from the implementation in JavaScript when it it decided by TC39.
   *
   * @see https://www.typescriptlang.org/tsconfig/#experimentalDecorators
   * @default false
   */
  legacy?: boolean;
  /**
   * Enables emitting decorator metadata.
   *
   * This option the same as [emitDecoratorMetadata](https://www.typescriptlang.org/tsconfig/#emitDecoratorMetadata)
   * in TypeScript, and it only works when `legacy` is true.
   *
   * @see https://www.typescriptlang.org/tsconfig/#emitDecoratorMetadata
   * @default false
   */
  emitDecoratorMetadata?: boolean;
}

export interface Es2015Options {
  /** Transform arrow functions into function expressions. */
  arrowFunction?: ArrowFunctionsOptions;
}

export declare const enum HelperMode {
  /**
   * Runtime mode (default): Helper functions are imported from a runtime package.
   *
   * Example:
   *
   * ```js
   * import helperName from "@oxc-project/runtime/helpers/helperName";
   * helperName(...arguments);
   * ```
   */
  Runtime = "Runtime",
  /**
   * External mode: Helper functions are accessed from a global `babelHelpers` object.
   *
   * Example:
   *
   * ```js
   * babelHelpers.helperName(...arguments);
   * ```
   */
  External = "External"
}

export interface Helpers {
  mode?: HelperMode;
}

/** TypeScript Isolated Declarations for Standalone DTS Emit */
export declare function isolatedDeclaration(
  filename: string,
  sourceText: string,
  options?: IsolatedDeclarationsOptions | undefined | null
): IsolatedDeclarationsResult;

export interface IsolatedDeclarationsOptions {
  /**
   * Do not emit declarations for code that has an @internal annotation in its JSDoc comment.
   * This is an internal compiler option; use at your own risk, because the compiler does not check that the result is valid.
   *
   * Default: `false`
   *
   * See <https://www.typescriptlang.org/tsconfig/#stripInternal>
   */
  stripInternal?: boolean;
  sourcemap?: boolean;
}

export interface IsolatedDeclarationsResult {
  code: string;
  map?: SourceMap;
  errors: Array<OxcError>;
}

/**
 * Configure how TSX and JSX are transformed.
 *
 * @see {@link https://babeljs.io/docs/babel-plugin-transform-react-jsx#options}
 */
export interface JsxOptions {
  /**
   * Decides which runtime to use.
   *
   * - 'automatic' - auto-import the correct JSX factories
   * - 'classic' - no auto-import
   *
   * @default 'automatic'
   */
  runtime?: "classic" | "automatic";
  /**
   * Emit development-specific information, such as `__source` and `__self`.
   *
   * @default false
   *
   * @see {@link https://babeljs.io/docs/babel-plugin-transform-react-jsx-development}
   */
  development?: boolean;
  /**
   * Toggles whether or not to throw an error if an XML namespaced tag name
   * is used.
   *
   * Though the JSX spec allows this, it is disabled by default since React's
   * JSX does not currently have support for it.
   *
   * @default true
   */
  throwIfNamespace?: boolean;
  /**
   * Enables `@babel/plugin-transform-react-pure-annotations`.
   *
   * It will mark JSX elements and top-level React method calls as pure for tree shaking.
   *
   * @see {@link https://babeljs.io/docs/en/babel-plugin-transform-react-pure-annotations}
   *
   * @default true
   */
  pure?: boolean;
  /**
   * Replaces the import source when importing functions.
   *
   * @default 'react'
   */
  importSource?: string;
  /**
   * Replace the function used when compiling JSX expressions. It should be a
   * qualified name (e.g. `React.createElement`) or an identifier (e.g.
   * `createElement`).
   *
   * Only used for `classic` {@link runtime}.
   *
   * @default 'React.createElement'
   */
  pragma?: string;
  /**
   * Replace the component used when compiling JSX fragments. It should be a
   * valid JSX tag name.
   *
   * Only used for `classic` {@link runtime}.
   *
   * @default 'React.Fragment'
   */
  pragmaFrag?: string;
  /**
   * When spreading props, use `Object.assign` directly instead of an extend helper.
   *
   * Only used for `classic` {@link runtime}.
   *
   * @default false
   */
  useBuiltIns?: boolean;
  /**
   * When spreading props, use inline object with spread elements directly
   * instead of an extend helper or Object.assign.
   *
   * Only used for `classic` {@link runtime}.
   *
   * @default false
   */
  useSpread?: boolean;
  /**
   * Enable React Fast Refresh .
   *
   * Conforms to the implementation in {@link https://github.com/facebook/react/tree/v18.3.1/packages/react-refresh}
   *
   * @default false
   */
  refresh?: boolean | ReactRefreshOptions;
}

/**
 * Transform JavaScript code to a Vite Node runnable module.
 *
 * @param filename The name of the file being transformed.
 * @param sourceText the source code itself
 * @param options The options for the transformation. See {@link
 * ModuleRunnerTransformOptions} for more information.
 *
 * @returns an object containing the transformed code, source maps, and any
 * errors that occurred during parsing or transformation.
 *
 * @deprecated Only works for Vite.
 */
export declare function moduleRunnerTransform(
  filename: string,
  sourceText: string,
  options?: ModuleRunnerTransformOptions | undefined | null
): ModuleRunnerTransformResult;

export interface ModuleRunnerTransformOptions {
  /**
   * Enable source map generation.
   *
   * When `true`, the `sourceMap` field of transform result objects will be populated.
   *
   * @default false
   *
   * @see {@link SourceMap}
   */
  sourcemap?: boolean;
}

export interface ModuleRunnerTransformResult {
  /**
   * The transformed code.
   *
   * If parsing failed, this will be an empty string.
   */
  code: string;
  /**
   * The source map for the transformed code.
   *
   * This will be set if {@link TransformOptions#sourcemap} is `true`.
   */
  map?: SourceMap;
  deps: Array<string>;
  dynamicDeps: Array<string>;
  /**
   * Parse and transformation errors.
   *
   * Oxc's parser recovers from common syntax errors, meaning that
   * transformed code may still be available even if there are errors in this
   * list.
   */
  errors: Array<OxcError>;
}

export interface PluginsOptions {
  styledComponents?: StyledComponentsOptions;
}

export interface ReactRefreshOptions {
  /**
   * Specify the identifier of the refresh registration variable.
   *
   * @default `$RefreshReg$`.
   */
  refreshReg?: string;
  /**
   * Specify the identifier of the refresh signature variable.
   *
   * @default `$RefreshSig$`.
   */
  refreshSig?: string;
  emitFullSignatures?: boolean;
}

/**
 * Configure how styled-components are transformed.
 *
 * @see {@link https://styled-components.com/docs/tooling#babel-plugin}
 */
export interface StyledComponentsOptions {
  /**
   * Enhances the attached CSS class name on each component with richer output to help
   * identify your components in the DOM without React DevTools.
   *
   * @default true
   */
  displayName?: boolean;
  /**
   * Controls whether the `displayName` of a component will be prefixed with the filename
   * to make the component name as unique as possible.
   *
   * @default true
   */
  fileName?: boolean;
  /**
   * Adds a unique identifier to every styled component to avoid checksum mismatches
   * due to different class generation on the client and server during server-side rendering.
   *
   * @default true
   */
  ssr?: boolean;
  /**
   * Transpiles styled-components tagged template literals to a smaller representation
   * than what Babel normally creates, helping to reduce bundle size.
   *
   * @default true
   */
  transpileTemplateLiterals?: boolean;
  /**
   * Minifies CSS content by removing all whitespace and comments from your CSS,
   * keeping valuable bytes out of your bundles.
   *
   * @default true
   */
  minify?: boolean;
  /**
   * Enables transformation of JSX `css` prop when using styled-components.
   *
   * **Note: This feature is not yet implemented in oxc.**
   *
   * @default true
   */
  cssProp?: boolean;
  /**
   * Enables "pure annotation" to aid dead code elimination by bundlers.
   *
   * @default false
   */
  pure?: boolean;
  /**
   * Adds a namespace prefix to component identifiers to ensure class names are unique.
   *
   * Example: With `namespace: "my-app"`, generates `componentId: "my-app__sc-3rfj0a-1"`
   */
  namespace?: string;
  /**
   * List of file names that are considered meaningless for component naming purposes.
   *
   * When the `fileName` option is enabled and a component is in a file with a name
   * from this list, the directory name will be used instead of the file name for
   * the component's display name.
   *
   * @default `["index"]`
   */
  meaninglessFileNames?: Array<string>;
  /**
   * Import paths to be considered as styled-components imports at the top level.
   *
   * **Note: This feature is not yet implemented in oxc.**
   */
  topLevelImportPaths?: Array<string>;
}

/**
 * Transpile a JavaScript or TypeScript into a target ECMAScript version.
 *
 * @param filename The name of the file being transformed. If this is a
 * relative path, consider setting the {@link TransformOptions#cwd} option..
 * @param sourceText the source code itself
 * @param options The options for the transformation. See {@link
 * TransformOptions} for more information.
 *
 * @returns an object containing the transformed code, source maps, and any
 * errors that occurred during parsing or transformation.
 */
export declare function transform(
  filename: string,
  sourceText: string,
  options?: TransformOptions | undefined | null
): TransformResult;

/**
 * Transpile a JavaScript or TypeScript into a target ECMAScript version, asynchronously.
 *
 * Note: This function can be slower than `transform` due to the overhead of spawning a thread.
 *
 * @param filename The name of the file being transformed. If this is a
 * relative path, consider setting the {@link TransformOptions#cwd} option.
 * @param sourceText the source code itself
 * @param options The options for the transformation. See {@link
 * TransformOptions} for more information.
 *
 * @returns a promise that resolves to an object containing the transformed code,
 * source maps, and any errors that occurred during parsing or transformation.
 */
export declare function transformAsync(
  filename: string,
  sourceText: string,
  options?: TransformOptions | undefined | null
): Promise<TransformResult>;

/**
 * Options for transforming a JavaScript or TypeScript file.
 *
 * @see {@link transform}
 */
export interface TransformOptions {
  /** Treat the source text as `js`, `jsx`, `ts`, `tsx`, or `dts`. */
  lang?: "js" | "jsx" | "ts" | "tsx" | "dts";
  /** Treat the source text as `script` or `module` code. */
  sourceType?: "script" | "module" | "unambiguous" | undefined;
  /**
   * The current working directory. Used to resolve relative paths in other
   * options.
   */
  cwd?: string;
  /**
   * Enable source map generation.
   *
   * When `true`, the `sourceMap` field of transform result objects will be populated.
   *
   * @default false
   *
   * @see {@link SourceMap}
   */
  sourcemap?: boolean;
  /** Set assumptions in order to produce smaller output. */
  assumptions?: CompilerAssumptions;
  /** Configure how TypeScript is transformed. */
  typescript?: TypeScriptOptions;
  /** Configure how TSX and JSX are transformed. */
  jsx?: "preserve" | JsxOptions;
  /**
   * Sets the target environment for the generated JavaScript.
   *
   * The lowest target is `es2015`.
   *
   * Example:
   *
   * * `'es2015'`
   * * `['es2020', 'chrome58', 'edge16', 'firefox57', 'node12', 'safari11']`
   *
   * @default `esnext` (No transformation)
   *
   * @see [esbuild#target](https://esbuild.github.io/api/#target)
   */
  target?: string | Array<string>;
  /** Behaviour for runtime helpers. */
  helpers?: Helpers;
  /** Define Plugin */
  define?: Record<string, string>;
  /** Inject Plugin */
  inject?: Record<string, string | [string, string]>;
  /** Decorator plugin */
  decorator?: DecoratorOptions;
  /** Third-party plugins to use. */
  plugins?: PluginsOptions;
}

export interface TransformResult {
  /**
   * The transformed code.
   *
   * If parsing failed, this will be an empty string.
   */
  code: string;
  /**
   * The source map for the transformed code.
   *
   * This will be set if {@link TransformOptions#sourcemap} is `true`.
   */
  map?: SourceMap;
  /**
   * The `.d.ts` declaration file for the transformed code. Declarations are
   * only generated if `declaration` is set to `true` and a TypeScript file
   * is provided.
   *
   * If parsing failed and `declaration` is set, this will be an empty string.
   *
   * @see {@link TypeScriptOptions#declaration}
   * @see [declaration tsconfig option](https://www.typescriptlang.org/tsconfig/#declaration)
   */
  declaration?: string;
  /**
   * Declaration source map. Only generated if both
   * {@link TypeScriptOptions#declaration declaration} and
   * {@link TransformOptions#sourcemap sourcemap} are set to `true`.
   */
  declarationMap?: SourceMap;
  /**
   * Helpers used.
   *
   * @internal
   *
   * Example:
   *
   * ```text
   * { "_objectSpread": "@oxc-project/runtime/helpers/objectSpread2" }
   * ```
   */
  helpersUsed: Record<string, string>;
  /**
   * Parse and transformation errors.
   *
   * Oxc's parser recovers from common syntax errors, meaning that
   * transformed code may still be available even if there are errors in this
   * list.
   */
  errors: Array<OxcError>;
}

export interface TypeScriptOptions {
  jsxPragma?: string;
  jsxPragmaFrag?: string;
  onlyRemoveTypeImports?: boolean;
  allowNamespaces?: boolean;
  /**
   * When enabled, type-only class fields are only removed if they are prefixed with the declare modifier:
   *
   * @deprecated
   *
   * Allowing `declare` fields is built-in support in Oxc without any option. If you want to remove class fields
   * without initializer, you can use `remove_class_fields_without_initializer: true` instead.
   */
  allowDeclareFields?: boolean;
  /**
   * When enabled, class fields without initializers are removed.
   *
   * For example:
   * ```ts
   * class Foo {
   *    x: number;
   *    y: number = 0;
   * }
   * ```
   * // transform into
   * ```js
   * class Foo {
   *    x: number;
   * }
   * ```
   *
   * The option is used to align with the behavior of TypeScript's `useDefineForClassFields: false` option.
   * When you want to enable this, you also need to set [`crate::CompilerAssumptions::set_public_class_fields`]
   * to `true`. The `set_public_class_fields: true` + `remove_class_fields_without_initializer: true` is
   * equivalent to `useDefineForClassFields: false` in TypeScript.
   *
   * When `set_public_class_fields` is true and class-properties plugin is enabled, the above example transforms into:
   *
   * ```js
   * class Foo {
   *   constructor() {
   *     this.y = 0;
   *   }
   * }
   * ```
   *
   * Defaults to `false`.
   */
  removeClassFieldsWithoutInitializer?: boolean;
  /**
   * Also generate a `.d.ts` declaration file for TypeScript files.
   *
   * The source file must be compliant with all
   * [`isolatedDeclarations`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations)
   * requirements.
   *
   * @default false
   */
  declaration?: IsolatedDeclarationsOptions;
  /**
   * Rewrite or remove TypeScript import/export declaration extensions.
   *
   * - When set to `rewrite`, it will change `.ts`, `.mts`, `.cts` extensions to `.js`, `.mjs`, `.cjs` respectively.
   * - When set to `remove`, it will remove `.ts`/`.mts`/`.cts`/`.tsx` extension entirely.
   * - When set to `true`, it's equivalent to `rewrite`.
   * - When set to `false` or omitted, no changes will be made to the extensions.
   *
   * @default false
   */
  rewriteImportExtensions?: "rewrite" | "remove" | boolean;
}
export declare class BindingEngine {
  constructor(options: BindingOptions);

  store(input: BindingStoreInput): Promise<BindingResult<BindingStoreOutput>>;

  recall(
    input: BindingRecallInput
  ): Promise<BindingResult<BindingRecallOutput>>;

  search(
    input: BindingSearchInput
  ): Promise<BindingResult<BindingSearchOutput>>;

  close(): Promise<undefined>;

  get isClosed(): boolean;
}

export declare class TraceSubscriberGuard {
  close(): void;
}

export type BindingError =
  | { type: "JsError"; field0: Error }
  | { type: "NativeError"; field0: NativeError };

export interface BindingErrors {
  errors: Array<BindingError>;
  isBindingErrors: boolean;
}

export interface BindingExecution {
  /** The documents of the execution. */
  documents: Array<BindingExecutionDocument>;
  /** The metadata of the execution. */
  meta: BindingExecutionMeta;
}

export interface BindingExecutionDocument {
  /** The name of the document. */
  name: string;
  /** The path of the document. */
  path: string;
  /** The extension of the document. */
  extension: string;
  /** The sources of the document. */
  source: Array<BindingExecutionSource>;
}

export interface BindingExecutionMeta {
  /** The id of the execution. */
  id: string;
  /** The date and time when the execution was performed. */
  executedAt: string;
  /** The user who performed the execution. */
  executedBy: string;
}

export interface BindingExecutionSearchHit {
  /** The id of the matching execution. */
  executionId: string;
  /** Relevance score when provided by the search backend. */
  score?: number;
  /** Short excerpt from the matched metadata, when available. */
  snippet?: string;
}

export interface BindingExecutionSource {
  /** The language of the generated source code. */
  language: string;
  /** The content of the generated source code. */
  content: string;
  /** Metadata about how the source code was generated. */
  meta: BindingExecutionSourceMeta;
}

export interface BindingExecutionSourceMeta {
  /** The options used to generate the source code during the execution. */
  options: any;
  /** The specification used to generate the source code during the execution. */
  spec: any;
  /** The metadata of the generator used to generate the source code during the execution. */
  generator: BindingGeneratorMeta;
  /** The metadata of the schema used to generate the source code during the execution. */
  schema: BindingSchemaMeta;
  /** The metadata of the input used to generate the source code during the execution. */
  input: BindingInputMeta;
  /** The metadata of the output used to generate the source code during the execution. */
  output: BindingOutputMeta;
}

export interface BindingGeneratorMeta {
  /** A description of the generator's purpose or behavior. */
  description?: string;
}

export interface BindingInputMeta {
  /** A unique identifier for the component. */
  id: string;
  /** A human-readable name for the component. */
  name: string;
  /** The version of the component. */
  version: any;
  /** A description of the component. */
  description: string;
  /** A human-readable title for the component. */
  title: string;
  /** A description of when the component is used. */
  usage?: string;
  /** Deprecation information for the component. */
  deprecated?: any;
  /** Tags associated with the component. */
  tags?: Array<string>;
  /** Links associated with the component. */
  links: Array<any>;
  /** A description of how the specification is extracted or generated. */
  input?: string;
}

/** Represents a log entry in the Power Plant binding. */
export interface BindingLog {
  /** The log message. */
  message: string;
  /** The log code. */
  code?: string;
  /** Additional details about the log. */
  details?: string;
  /** The log level. */
  level: BindingLogLevel;
  /** The plugin that generated the log. */
  plugin?: string;
}

export declare const enum BindingLogLevel {
  Silent = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4
}

export interface BindingOptions {
  /** The log level. */
  logLevel?: "debug" | "info" | "warn" | "error" | "silent";
  /** Callback for log messages. */
  customLogger?: (
    logLevel: "debug" | "info" | "warn" | "error",
    log: BindingLog
  ) => Promise<void>;
  /** Disable tracing. */
  disableTracing?: boolean;
  /** The current working directory. */
  cwd: string;
  /** Path to cache directory. */
  cachePath: string;
  /** Path to data directory. */
  dataPath: string;
  /** Path to log directory. */
  logPath: string;
  /** Path to temporary directory. */
  tempPath: string;
  /** Path to configuration directory. */
  configPath: string;
  /** Path to output directory. */
  outputPath: string;
}

export interface BindingOutputMeta {
  /** A unique identifier for the component. */
  id: string;
  /** A human-readable name for the component. */
  name: string;
  /** The version of the component. */
  version: any;
  /** A description of the component. */
  description: string;
  /** A human-readable title for the component. */
  title: string;
  /** A description of when the component is used. */
  usage?: string;
  /** Deprecation information for the component. */
  deprecated?: any;
  /** Tags associated with the component. */
  tags?: Array<string>;
  /** Links associated with the component. */
  links: Array<any>;
  /** A description of what the output produces. */
  produces?: string;
}

export interface BindingRecallInput {
  /** The id of the execution to recall. */
  executionId: string;
}

export interface BindingRecallOutput {
  /** The recalled execution. */
  execution: BindingExecution;
}

export interface BindingSchemaMeta {
  /** A unique identifier for the component. */
  id: string;
  /** A human-readable name for the component. */
  name: string;
  /** The version of the component. */
  version: any;
  /** A description of the component. */
  description: string;
  /** A human-readable title for the component. */
  title: string;
  /** A description of when the component is used. */
  usage?: string;
  /** Deprecation information for the component. */
  deprecated?: any;
  /** Tags associated with the component. */
  tags?: Array<string>;
  /** Links associated with the component. */
  links: Array<any>;
  /** Examples of valid data for the schema. */
  examples: Array<any>;
}

export interface BindingSearchInput {
  /** Free-text query matched against indexed execution metadata. */
  query?: string;
  /** Filter by the user who performed the execution. */
  executedBy?: string;
  /** Filter by schema name or id. */
  schema?: string;
  /** Filter by generator name or id. */
  generator?: string;
  /** Filter by tags; an execution matches when any tag is present. */
  tags?: Array<string>;
  /** Optional embedding vector for semantic similarity search. */
  embedding?: Array<number>;
  /** Maximum number of results to return. */
  limit?: number;
}

export interface BindingSearchOutput {
  /** Matching executions ordered by relevance. */
  hits: Array<BindingExecutionSearchHit>;
}

export interface BindingStoreInput {
  /** The execution that produced the input. */
  execution: BindingExecution;
}

export interface BindingStoreOutput {
  /** Whether the store operation was successful. */
  success: boolean;
  /** Any warnings encountered during the store operation. */
  warnings: Array<BindingLog>;
}

export declare function createTokioRuntime(
  blockingThreads?: number | undefined | null
): void;

export declare function initTraceSubscriber(): TraceSubscriberGuard | null;

/** Error emitted from native side, it only contains kind and message, no stack trace. */
export interface NativeError {
  kind: string;
  message: string;
}

/**
 * Shutdown the tokio runtime manually.
 *
 * This is required for the wasm target with `tokio_unstable` cfg.
 * In the wasm runtime, the `park` threads will hang there until the tokio::Runtime is shutdown.
 */
export declare function shutdownAsyncRuntime(): void;

/**
 * Start the async runtime manually.
 *
 * This is required when the async runtime is shutdown manually.
 * Usually it's used in test.
 */
export declare function startAsyncRuntime(): void;
