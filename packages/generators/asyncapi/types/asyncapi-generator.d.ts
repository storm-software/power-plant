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

declare module "@asyncapi/generator" {
  import type { AsyncAPIDocumentInterface } from "@asyncapi/parser";

  /**
   * Optional parameter with private registry configuration.
   */
  export interface GeneratorRegistryOptions {
    /**
     * Parameter to pass npm registry url.
     */
    url?: string;

    /**
     * Optional parameter to pass npm registry username and password encoded with base64, formatted like `username:password` value should be encoded.
     */
    auth?: string;

    /**
     * Optional parameter to pass npm registry auth token that you can grab from `.npmrc` file.
     */
    token?: string;
  }

  /**
   * Object with hooks to disable. The key is a hook type. If key has `true` value, then the generator skips all hooks from the given type. If the value associated with a key is a string with the name of a single hook, then the generator skips only this single hook name. If the value associated with a key is an array of strings, then the generator skips only hooks from the array.
   */
  export type GeneratorDisabledHooks = Record<
    string,
    boolean | string | string[]
  >;

  /**
   * Configuration options for the AsyncAPI generator.
   */
  export interface GeneratorOptions {
    /**
     * Optional parameters to pass to the template. Each template define their own params.
     */
    templateParams?: Record<string, unknown>;

    /**
     * Name of the file to use as the entry point for the rendering process. Use in case you want to use only a specific template file. Note: this potentially avoids rendering every file in the template.
     */
    entrypoint?: string;

    /**
     * List of globs to skip when regenerating the template.
     */
    noOverwriteGlobs?: string[];

    /**
     * Object with hooks to disable.
     */
    disabledHooks?: GeneratorDisabledHooks;

    /**
     * Type of output. Can be either `'fs'` (default) or `'string'`. Only available when entrypoint is set.
     *
     * @defaultValue "fs"
     */
    output?: "fs" | "string";

    /**
     * Force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir.
     *
     * @defaultValue false
     */
    forceWrite?: boolean;

    /**
     * Install the template and its dependencies, even when the template has already been installed.
     *
     * @defaultValue false
     */
    install?: boolean;

    /**
     * Enable more specific errors in the console. At the moment it only shows specific errors about filters. Keep in mind that as a result errors about template are less descriptive.
     *
     * @defaultValue false
     */
    debug?: boolean;

    /**
     * Whether to compile the template or use the cached transpiled version provided by template in `__transpiled` folder.
     *
     * @defaultValue true
     */
    compile?: boolean;

    /**
     * Optional parameter to map schema references from a base url to a local base folder e.g. `url=https://schema.example.com/crm/` `folder=./test/docs/`.
     */
    mapBaseUrlToFolder?: Record<string, string>;

    /**
     * Optional parameter with private registry configuration.
     */
    registry?: GeneratorRegistryOptions;
  }

  /**
   * AsyncAPI Parser parse options.
   *
   * @see {@link https://github.com/asyncapi/parser | @asyncapi/parser}
   */
  export type GeneratorParseOptions = Record<string, unknown>;

  /**
   * Alias for {@link GeneratorOptions}.
   */
  export type UserConfig = GeneratorOptions;

  /**
   * Metadata returned alongside rendered template content.
   */
  export interface TemplateRenderResultMetadata {
    /**
     * File permissions to apply when writing the rendered file.
     */
    permissions?: number;

    /**
     * Override file name for the rendered output.
     */
    fileName?: string;
  }

  /**
   * Result of rendering a single template file.
   */
  export interface TemplateRenderResult {
    /**
     * Rendered file content.
     */
    content: string;

    /**
     * Optional metadata for the rendered file.
     */
    metadata?: TemplateRenderResultMetadata;
  }

  /**
   * Template package information returned after installation or setup.
   */
  export interface GeneratorTemplatePackageInfo {
    /**
     * Installed template package name.
     */
    templatePkgName: string;

    /**
     * Installed template package path.
     */
    templatePkgPath: string;
  }

  /**
   * Optional filter for {@link listBakedInTemplates}.
   */
  export interface BakedInTemplateFilter {
    /**
     * Filter by template type (e.g. `'client'`, `'docs'`).
     */
    type?: string;

    /**
     * Filter by stack (e.g. `'quarkus'`, `'express'`).
     */
    stack?: string;

    /**
     * Filter by protocol (e.g. `'websocket'`, `'http'`).
     */
    protocol?: string;

    /**
     * Filter by target language or format (e.g. `'javascript'`, `'html'`).
     */
    target?: string;
  }

  /**
   * Core template metadata bundled with `@asyncapi/generator`.
   */
  export interface BakedInTemplate {
    /**
     * Template name to pass to the {@link Generator} constructor.
     */
    name: string;

    /**
     * Template type (e.g. `'client'`, `'docs'`).
     */
    type: string;

    /**
     * Supported protocol (e.g. `'websocket'`, `'kafka'`).
     */
    protocol: string;

    /**
     * Target language or format (e.g. `'javascript'`, `'java'`).
     */
    target: string;

    /**
     * Optional stack (e.g. `'quarkus'`).
     */
    stack?: string;

    /**
     * Optional path to the template on disk.
     */
    path?: string;
  }

  /**
   * Loaded template configuration from `.ageneratorrc` or `package.json`.
   */
  export type GeneratorTemplateConfig = Record<string, unknown>;

  /**
   * Hook function registered for a template lifecycle event.
   */
  export type GeneratorHook = (
    generator: Generator,
    hookArguments?: unknown
  ) => Promise<unknown> | unknown;

  /**
   * Hooks object with hook functions grouped by hook type.
   */
  export type GeneratorHooks = Record<string, GeneratorHook[]>;

  export class Generator {
    /**
     * Instantiates a new Generator object.
     *
     * @param templateName - Name of the template to generate.
     * @param targetDir - Path to the directory where the files will be generated.
     * @param options - Generator configuration options.
     *
     * @example
     * ```js
     * const path = require('path');
     * const generator = new Generator('@asyncapi/html-template', path.resolve(__dirname, 'example'));
     * ```
     *
     * @example Passing custom params to the template
     * ```js
     * const path = require('path');
     * const generator = new Generator('@asyncapi/html-template', path.resolve(__dirname, 'example'), {
     *   templateParams: {
     *     sidebarOrganization: 'byTags'
     *   }
     * });
     * ```
     */
    constructor(
      templateName: string,
      targetDir: string,
      options?: GeneratorOptions
    );

    /**
     * Generates files from a given template and an AsyncAPI document.
     *
     * @param asyncapiDocument - AsyncAPI document object to use as source.
     * @param parseOptions - AsyncAPI Parser parse options. Remember to use the right options for the right parser depending on the template you are using.
     * @returns A promise that resolves when the generation is completed.
     *
     * @example
     * ```js
     * await generator.generate(myAsyncAPIdocument);
     * console.log('Done!');
     * ```
     *
     * @example
     * ```js
     * generator
     *   .generate(myAsyncAPIdocument)
     *   .then(() => {
     *     console.log('Done!');
     *   })
     *   .catch(console.error);
     * ```
     *
     * @example Using async/await
     * ```js
     * try {
     *   await generator.generate(myAsyncAPIdocument);
     *   console.log('Done!');
     * } catch (e) {
     *   console.error(e);
     * }
     * ```
     */
    generate(
      asyncapiDocument: AsyncAPIDocumentInterface | string,
      parseOptions?: GeneratorParseOptions
    ): Promise<void>;

    /**
     * Whether to compile the template or use the cached transpiled version provided by template in `__transpiled` folder.
     */
    compile: boolean;

    /**
     * Npm registry information.
     */
    registry: GeneratorRegistryOptions;

    /**
     * Name of the template to generate.
     */
    templateName: string;

    /**
     * Path to the directory where the files will be generated.
     */
    targetDir: string;

    /**
     * Name of the file to use as the entry point for the rendering process.
     */
    entrypoint?: string;

    /**
     * List of globs to skip when regenerating the template.
     */
    noOverwriteGlobs: string[];

    /**
     * Object with hooks to disable.
     */
    disabledHooks: GeneratorDisabledHooks;

    /**
     * Type of output. Can be either `'fs'` (default) or `'string'`.
     */
    output: "fs" | "string";

    /**
     * Force writing of the generated files to given directory even if it is a git repo with unstaged files or not empty dir.
     */
    forceWrite: boolean;

    /**
     * Enable more specific errors in the console.
     */
    debug: boolean;

    /**
     * Install the template and its dependencies, even when the template has already been installed.
     */
    install: boolean;

    /**
     * The template configuration.
     */
    templateConfig: GeneratorTemplateConfig;

    /**
     * Hooks object with hooks functions grouped by the hook type.
     */
    hooks: GeneratorHooks;

    /**
     * Maps schema URL to folder.
     */
    mapBaseUrlToFolder: Record<string, string>;

    /**
     * The template parameters. The structure for this object is based on each individual template.
     */
    templateParams: Record<string, unknown>;

    /**
     * Parsed AsyncAPI document used during generation.
     */
    asyncapi?: AsyncAPIDocumentInterface | string;

    /**
     * Original AsyncAPI input before parsing transformations.
     */
    originalAsyncAPI?: AsyncAPIDocumentInterface | string;

    /**
     * Path to the installed template package.
     */
    templateDir?: string;

    /**
     * Path to the template content directory.
     */
    templateContentDir?: string;

    /**
     * Validates the provided AsyncAPI document.
     *
     * @param asyncapiDocument - The AsyncAPI document to be validated.
     * @throws Throws an error if the document is not valid.
     */
    validateAsyncAPIDocument(
      asyncapiDocument: AsyncAPIDocumentInterface | string
    ): void;

    /**
     * Sets up the output configuration based on the specified output type.
     *
     * @throws If `output` is set to `'string'` without providing `entrypoint`.
     */
    setupOutput(): Promise<void>;

    /**
     * Sets up the file system (FS) output configuration.
     *
     * This function creates the target directory if it does not exist and verifies
     * the target directory if `forceWrite` is not enabled.
     *
     * @throws If verification of the target directory fails and `forceWrite` is not enabled.
     */
    setupFSOutput(): Promise<void>;

    /**
     * Sets the log level based on the debug option.
     *
     * If the debug option is enabled, the log level is set to `'debug'`.
     */
    setLogLevel(): void;

    /**
     * Installs and sets up the template for code generation.
     *
     * @returns A promise that resolves to an object containing the name and path of the installed template.
     */
    installAndSetupTemplate(): Promise<GeneratorTemplatePackageInfo>;

    /**
     * Configures the template workflow based on provided parsing options.
     *
     * This function performs the following steps:
     * 1. Parses the input AsyncAPI document using the specified parse options.
     * 2. Validates the template configuration and parameters.
     * 3. Configures the template based on the parsed AsyncAPI document.
     * 4. Registers filters, hooks, and launches the `'generate:before'` hook if applicable.
     *
     * @param parseOptions - Options for parsing the AsyncAPI document.
     */
    configureTemplateWorkflow(
      parseOptions?: GeneratorParseOptions
    ): Promise<void>;

    /**
     * Handles the logic for the template entrypoint.
     *
     * If an entrypoint is specified:
     * - Resolves the absolute path of the entrypoint file.
     * - Throws an error if the entrypoint file doesn't exist.
     * - Generates a file or renders content based on the output type.
     *
     * If no entrypoint is specified, generates the directory structure.
     *
     * @returns Rendered content when `output` is `'string'`, otherwise `undefined`.
     */
    handleEntrypoint(): Promise<
      string | TemplateRenderResult | TemplateRenderResult[] | undefined
    >;

    /**
     * Executes the `'generate:after'` hook.
     */
    executeAfterHook(): Promise<void>;

    /**
     * Parse the generator input based on the template `templateConfig.apiVersion` value.
     *
     * @param asyncapiDocument - AsyncAPI document or string to parse.
     * @param parseOptions - AsyncAPI Parser parse options.
     */
    parseInput(
      asyncapiDocument: AsyncAPIDocumentInterface | string,
      parseOptions?: GeneratorParseOptions
    ): Promise<void>;

    /**
     * Configure the templates based on the desired renderer.
     */
    configureTemplate(): Promise<void>;

    /**
     * Generates files from a given template and AsyncAPI string.
     *
     * @param asyncapiString - AsyncAPI string to use as source.
     * @param parseOptions - AsyncAPI Parser parse options.
     * @deprecated Use the `generate` function instead. Just change the function name and it works out of the box.
     */
    generateFromString(
      asyncapiString: string,
      parseOptions?: GeneratorParseOptions
    ): Promise<void>;

    /**
     * Generates files from a given template and AsyncAPI file stored on an external server.
     *
     * @param asyncapiURL - Link to AsyncAPI file.
     */
    generateFromURL(asyncapiURL: string): Promise<void>;

    /**
     * Generates files from a given template and AsyncAPI file.
     *
     * @param asyncapiFile - AsyncAPI file to use as source.
     */
    generateFromFile(asyncapiFile: string): Promise<void>;

    /**
     * Returns the content of a given template file.
     *
     * @param templateName - Name of the template to generate.
     * @param filePath - Path to the file to render. Relative to the template directory.
     * @param templatesDir - Path to the directory where the templates are installed.
     *
     * @example
     * ```js
     * const Generator = require('@asyncapi/generator');
     * const content = await Generator.getTemplateFile('@asyncapi/html-template', 'partials/content.html');
     * ```
     */
    static getTemplateFile(
      templateName: string,
      filePath: string,
      templatesDir?: string
    ): Promise<string>;

    /**
     * Default path to the directory where templates are installed.
     */
    static readonly DEFAULT_TEMPLATES_DIR: string;

    /**
     * Folder name for cached transpiled template code.
     */
    static readonly TRANSPILED_TEMPLATE_LOCATION: string;
  }

  /**
   * List core templates, optionally filter by type, stack, protocol, or target.
   *
   * Use the name of returned templates as input for the `generate` method for template generation.
   * Such core templates code is part of the `@asyncapi/generator` package.
   *
   * @param filter - Optional filter object.
   */
  export function listBakedInTemplates(
    filter?: BakedInTemplateFilter
  ): BakedInTemplate[];
}
