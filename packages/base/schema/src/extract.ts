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

import type { Type } from "@deepkit/type";
import { isType, reflect, stringifyType } from "@deepkit/type";
import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import { extractFileReference } from "@stryke/convert/extract-file-reference";
import { resolveSafe } from "@stryke/fs/resolve";
import { murmurhash } from "@stryke/hash";
import { deepClone } from "@stryke/helpers/deep-clone";
import { omit } from "@stryke/helpers/omit";
import { isStandardJsonSchema } from "@stryke/json";
import { appendPath } from "@stryke/path/append";
import {
  findFileDotExtensionSafe,
  findFileExtensionSafe,
  findFilePath
} from "@stryke/path/find";
import { joinPaths } from "@stryke/path/join";
import { VALID_OBJECT_SOURCE_EXTENSIONS } from "@stryke/resolve/constants";
import { loadSafe } from "@stryke/resolve/load";
import type { InferLoadOptions } from "@stryke/resolve/types";
import { list } from "@stryke/string-format/list";
import { isSetString } from "@stryke/type-checks";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import type { FileReferenceInput, FileSystemInterface } from "@stryke/types";
import {
  extractJsonSchema as extractJsonSchemaZod,
  isZod3Type
} from "@stryke/zod";
import { toJsonSchema } from "@valibot/to-json-schema";
import type { Plugin } from "esbuild";
import { build } from "esbuild";
import { createJiti } from "jiti";
import { readFile } from "node:fs/promises";
import ts, { DiagnosticCategory } from "typescript";
import type * as z3 from "zod/v3";
import {
  Cache,
  DeclarationTransformer,
  ReflectionTransformer
} from "./deepkit";
import { reflectionToJsonSchema } from "./reflection";
import { mapStorageToFileSystem } from "./storage";
import {
  isFileReference,
  isJsonSchema,
  isJsonSchemaObject,
  isSchema,
  isSchemaOf,
  isSchemaWithSource,
  isUntypedConfig,
  isUntypedConfigStrict,
  isUntypedSchema,
  isUntypedSchemaStrict,
  isValibotSchema
} from "./type-checks";
import type {
  BaseExtractOptions,
  ExtractedSchemaEnvelope,
  InferExtractOptions,
  JsonSchema,
  SchemaConfig,
  SchemaConfigVariant,
  SchemaEnvelopeOf,
  SchemaSource,
  SchemaSourceConfig,
  SchemaSourceVariant,
  UntypedConfigObject,
  UntypedSchema,
  ValibotSchema
} from "./types";

const SCHEMA_BUNDLE_BASE_URI = "https://power-plant.invalid/";

function isWrappedSchemaConfig<TSpec = any>(
  input: SchemaConfig<TSpec>
): input is { schema: SchemaConfig<TSpec> } {
  if (!isSetObject(input) || !("schema" in input)) {
    return false;
  }

  if ("hash" in input || "variant" in input || "source" in input) {
    return false;
  }

  return true;
}

function unwrapSchemaConfig<TSpec = any>(
  input: SchemaConfig<TSpec>
): SchemaConfig<TSpec> {
  if (isWrappedSchemaConfig(input)) {
    return input.schema as SchemaConfig<TSpec>;
  }

  return input;
}

function normalizeUri(uri: string): string {
  return uri.endsWith("#") ? uri.slice(0, -1) : uri;
}

function stripUriFragment(uri: string): string {
  const hashIndex = uri.indexOf("#");

  return hashIndex >= 0 ? uri.slice(0, hashIndex) : uri;
}

function escapeJsonPointerToken(token: string): string {
  return token.replaceAll("~", "~0").replaceAll("/", "~1");
}

function toJsonPointer(path: string[]): string {
  if (path.length === 0) {
    return "";
  }

  return `/${path.map(segment => escapeJsonPointerToken(segment)).join("/")}`;
}

function resolveUri(reference: string, baseUri: string): string {
  try {
    return normalizeUri(new URL(reference, baseUri).toString());
  } catch {
    return normalizeUri(reference);
  }
}

function collectReferenceTargets(
  value: unknown,
  path: string[],
  baseUri: string,
  uriToPointer: Map<string, string>,
  dynamicUriToFragment: Map<string, string>
): void {
  if (!isSetObject(value)) {
    return;
  }

  const schema = value as Record<string, unknown>;
  const pointer = toJsonPointer(path);

  const currentBaseUri = isSetString(schema.$id)
    ? resolveUri(schema.$id, baseUri)
    : baseUri;

  const currentDocumentUri = stripUriFragment(currentBaseUri);

  uriToPointer.set(currentBaseUri, pointer);
  uriToPointer.set(currentDocumentUri, pointer);

  if (isSetString(schema.$anchor)) {
    uriToPointer.set(`${currentDocumentUri}#${schema.$anchor}`, pointer);
  }

  if (isSetString(schema.$dynamicAnchor)) {
    const dynamicTarget = `${currentDocumentUri}#${schema.$dynamicAnchor}`;
    uriToPointer.set(dynamicTarget, pointer);
    dynamicUriToFragment.set(dynamicTarget, `#${schema.$dynamicAnchor}`);
  }

  for (const [key, child] of Object.entries(schema)) {
    if (Array.isArray(child)) {
      child.forEach((entry, index) => {
        collectReferenceTargets(
          entry,
          [...path, key, String(index)],
          currentBaseUri,
          uriToPointer,
          dynamicUriToFragment
        );
      });
      continue;
    }

    collectReferenceTargets(
      child,
      [...path, key],
      currentBaseUri,
      uriToPointer,
      dynamicUriToFragment
    );
  }
}

function rewriteReferenceTargets(
  value: unknown,
  path: string[],
  baseUri: string,
  uriToPointer: Map<string, string>,
  dynamicUriToFragment: Map<string, string>
): void {
  if (!isSetObject(value)) {
    return;
  }

  const schema = value as Record<string, unknown>;

  const currentBaseUri = isSetString(schema.$id)
    ? resolveUri(schema.$id, baseUri)
    : baseUri;

  if (isSetString(schema.$ref)) {
    const resolvedRefUri = resolveUri(schema.$ref, currentBaseUri);
    const pointer =
      uriToPointer.get(resolvedRefUri) ??
      uriToPointer.get(stripUriFragment(resolvedRefUri));

    if (pointer !== undefined) {
      schema.$ref = pointer.length > 0 ? `#${pointer}` : "#";
    }
  }

  if (isSetString(schema.$dynamicRef)) {
    const resolvedDynamicRefUri = resolveUri(
      schema.$dynamicRef,
      currentBaseUri
    );
    const dynamicFragment = dynamicUriToFragment.get(resolvedDynamicRefUri);

    if (dynamicFragment) {
      schema.$dynamicRef = dynamicFragment;
    } else {
      const pointer =
        uriToPointer.get(resolvedDynamicRefUri) ??
        uriToPointer.get(stripUriFragment(resolvedDynamicRefUri));

      if (pointer !== undefined) {
        schema.$dynamicRef = pointer.length > 0 ? `#${pointer}` : "#";
      }
    }
  }

  for (const [key, child] of Object.entries(schema)) {
    if (Array.isArray(child)) {
      child.forEach((entry, index) => {
        rewriteReferenceTargets(
          entry,
          [...path, key, String(index)],
          currentBaseUri,
          uriToPointer,
          dynamicUriToFragment
        );
      });
      continue;
    }

    rewriteReferenceTargets(
      child,
      [...path, key],
      currentBaseUri,
      uriToPointer,
      dynamicUriToFragment
    );
  }
}

/**
 * Bundles all external references in a JSON Schema into a single schema document by collecting all reference targets and rewriting the references to point to the bundled definitions. This ensures that the resulting schema is self-contained and can be used independently without relying on external documents.
 *
 * @param schema - The JSON Schema to bundle references for.
 * @returns A new JSON Schema with all references bundled and rewritten to point to the bundled definitions.
 */
export function bundleReferences(schema: JsonSchema): JsonSchema {
  if (!isSetObject(schema)) {
    return schema;
  }

  const bundledSchema = deepClone(schema) as Record<string, unknown>;
  const baseUri = isSetString(bundledSchema.$id)
    ? resolveUri(bundledSchema.$id, SCHEMA_BUNDLE_BASE_URI)
    : SCHEMA_BUNDLE_BASE_URI;

  const uriToPointer = new Map<string, string>();
  const dynamicUriToFragment = new Map<string, string>();

  collectReferenceTargets(
    bundledSchema,
    [],
    baseUri,
    uriToPointer,
    dynamicUriToFragment
  );

  rewriteReferenceTargets(
    bundledSchema,
    [],
    baseUri,
    uriToPointer,
    dynamicUriToFragment
  );

  return bundledSchema;
}

function convertNestedUntypedSchema(value: unknown): unknown {
  if (isUntypedSchema(value)) {
    return convertUntypedSchemaToJsonSchema(value);
  }

  if (isSetObject(value)) {
    if (isUntypedConfig(value)) {
      return convertUntypedConfigToJsonSchema(value);
    }

    const nested = value as Record<string, unknown>;
    if ("$schema" in nested && isUntypedSchema(nested.$schema)) {
      return convertUntypedSchemaToJsonSchema(nested.$schema);
    }
  }

  return value;
}

function convertNestedUntypedSchemaArray(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map(item => convertNestedUntypedSchema(item));
}

function convertValibotSchemaToJsonSchema(schema: unknown): JsonSchema {
  return toJsonSchema(schema as never, {
    target: "draft-2020-12"
  }) as JsonSchema;
}

function convertUntypedSchemaToJsonSchema(
  schema: UntypedSchema | Record<string, unknown>
): JsonSchema {
  const source = schema as Record<string, unknown>;
  const jsonSchema: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (
      key === "tsType" ||
      key === "markdownType" ||
      key === "tags" ||
      key === "args" ||
      key === "resolve"
    ) {
      continue;
    }

    if (key === "id" && isSetString(value)) {
      jsonSchema.$id = value;
      continue;
    }

    if (
      key === "properties" ||
      key === "patternProperties" ||
      key === "dependentSchemas" ||
      key === "$defs" ||
      key === "definitions"
    ) {
      if (!isSetObject(value)) {
        jsonSchema[key] = value;
        continue;
      }

      jsonSchema[key] = Object.fromEntries(
        Object.entries(value).map(([propertyKey, propertyValue]) => [
          propertyKey,
          convertNestedUntypedSchema(propertyValue)
        ])
      );
      continue;
    }

    if (
      key === "items" ||
      key === "contains" ||
      key === "if" ||
      key === "then" ||
      key === "else" ||
      key === "not" ||
      key === "propertyNames" ||
      key === "additionalProperties" ||
      key === "unevaluatedProperties"
    ) {
      jsonSchema[key] = convertNestedUntypedSchema(value);
      continue;
    }

    if (key === "oneOf" || key === "anyOf" || key === "allOf") {
      jsonSchema[key] = convertNestedUntypedSchemaArray(value);
      continue;
    }

    jsonSchema[key] = value;
  }

  return jsonSchema;
}

function convertUntypedConfigToJsonSchema(
  input: UntypedConfigObject
): JsonSchema {
  const inputObject = input as Record<string, unknown>;
  const base = isUntypedSchema(inputObject.$schema)
    ? convertUntypedSchemaToJsonSchema(inputObject.$schema)
    : {};
  const properties: Record<string, JsonSchema> = {};

  for (const [key, value] of Object.entries(inputObject)) {
    if (key.startsWith("$")) {
      continue;
    }

    if (!isSetObject(value)) {
      continue;
    }

    if (isUntypedConfig(value)) {
      properties[key] = convertUntypedConfigToJsonSchema(value);
      continue;
    }

    const nested = value as Record<string, unknown>;
    if ("$schema" in nested && isUntypedSchema(nested.$schema)) {
      properties[key] = convertUntypedSchemaToJsonSchema(nested.$schema);
      continue;
    }

    if (isUntypedSchema(value)) {
      properties[key] = convertUntypedSchemaToJsonSchema(value);
    }
  }

  if (!isJsonSchemaObject(base)) {
    throw new Error(
      `Failed to convert untyped input to JSON Schema. The base schema must be a valid JSON Schema object.`
    );
  }

  const baseProperties = isSetObject(base.properties) ? base.properties : {};
  const mergedProperties = {
    ...baseProperties,
    ...properties
  };

  return {
    ...base,
    type: base.type ?? "object",
    ...(Object.keys(mergedProperties).length > 0
      ? { properties: mergedProperties }
      : {})
  };
}

/**
 * Creates a hash string for a given schema definition input.
 */
export function extractHash(
  variant: SchemaConfigVariant,
  input: SchemaConfig
): string {
  const unwrappedConfig = unwrapSchemaConfig(input);

  if (isSchemaWithSource(unwrappedConfig) || isSchema(unwrappedConfig)) {
    return murmurhash({ variant, input: unwrappedConfig.schema });
  }

  if (isSetString(unwrappedConfig)) {
    return murmurhash({ variant, input: unwrappedConfig });
  } else if (typeof unwrappedConfig === "boolean") {
    return murmurhash({ variant, input: unwrappedConfig });
  } else if (isSetObject(unwrappedConfig)) {
    if (isZod3Type(unwrappedConfig)) {
      return murmurhash({ variant, input: unwrappedConfig._def });
    } else if (isType(unwrappedConfig)) {
      return murmurhash({ variant, input: stringifyType(unwrappedConfig) });
    } else if (isStandardJsonSchema(unwrappedConfig)) {
      return murmurhash({ variant, input: unwrappedConfig["~standard"] });
    } else if (isJsonSchema(unwrappedConfig)) {
      return murmurhash({ variant, input: unwrappedConfig });
    } else if (isValibotSchema(unwrappedConfig)) {
      return murmurhash({
        variant,
        input: convertValibotSchemaToJsonSchema(unwrappedConfig)
      });
    } else if (isUntypedConfig(unwrappedConfig)) {
      return murmurhash({
        variant,
        input: convertUntypedConfigToJsonSchema(unwrappedConfig)
      });
    } else if (isUntypedSchema(unwrappedConfig)) {
      return murmurhash({
        variant,
        input: convertUntypedSchemaToJsonSchema(unwrappedConfig)
      });
    }
  }

  throw new Error(
    `Failed to create an input hash for the provided schema definition input. The input must be a Zod schema, a Standard JSON Schema, a JSON Schema object, a Valibot BaseSchema, or a reflected Deepkit Type object.`
  );
}

/**
 * Converts a reflected Deepkit {@link Type} into a JSON Schema (draft-2020-12) representation.
 */
export function extractReflection(reflection: Type): JsonSchema | undefined {
  if (!isType(reflection)) {
    return undefined;
  }

  return reflectionToJsonSchema(reflection);
}

/**
 * Extracts a JSON Schema from Zod, Standard Schema, Valibot, untyped, or JSON Schema inputs.
 *
 * @param schema - The schema input to extract a JSON Schema from.
 * @returns The extracted JSON Schema, or `undefined` if the input is not a supported schema type.
 */
export function extractJsonSchema(schema: unknown): JsonSchema | undefined {
  if (isSetObject(schema)) {
    if (isZod3Type(schema)) {
      return extractJsonSchemaZod(schema, {
        target: "draft-2020-12"
      }) as JsonSchema;
    }
    if (isUntypedConfigStrict(schema)) {
      return convertUntypedConfigToJsonSchema(schema);
    }
    if (isUntypedSchemaStrict(schema)) {
      return convertUntypedSchemaToJsonSchema(schema);
    }
    if (isStandardJsonSchema(schema)) {
      return schema["~standard"].jsonSchema.input({
        target: "draft-2020-12"
      });
    }
    if (isValibotSchema(schema)) {
      return convertValibotSchemaToJsonSchema(schema);
    }
    if (isJsonSchema(schema)) {
      return schema;
    }
  }

  return undefined;
}

/**
 * Resolves the concrete source variant for a schema source input.
 *
 * @param input - The schema source input to inspect.
 * @returns The resolved schema source variant.
 * @throws Will throw an error when the input cannot be mapped to a supported source variant.
 */
export function extractResolvedVariant(
  input: SchemaSourceConfig
): SchemaSourceVariant {
  if (isSetObject(input)) {
    if (isZod3Type(input)) {
      return "zod3";
    } else if (isType(input)) {
      return "reflection";
    } else if (isUntypedConfigStrict(input) || isUntypedSchemaStrict(input)) {
      return "untyped";
    } else if (isStandardJsonSchema(input)) {
      return "standard-schema";
    } else if (isJsonSchema(input)) {
      return "json-schema";
    } else if (isValibotSchema(input)) {
      return "valibot";
    }
  }

  throw new Error(
    `Failed to determine the variant of the provided schema definition input. The input must be a Zod schema, a Standard JSON Schema, a JSON Schema object, a Valibot BaseSchema, a reflected Deepkit Type object, or an Untyped schema.`
  );
}

/**
 * Determines the top-level input variant for schema extraction.
 *
 * @param input - The schema input to classify.
 * @returns The resolved schema input variant.
 */
export function extractVariant(input: SchemaConfig): SchemaConfigVariant {
  const unwrappedConfig = unwrapSchemaConfig(input);

  if (isSchemaWithSource(unwrappedConfig) || isSchema(unwrappedConfig)) {
    return unwrappedConfig.variant;
  }

  if (isSetString(unwrappedConfig) || isFileReference(unwrappedConfig)) {
    return "file-reference";
  }

  return extractResolvedVariant(unwrappedConfig as SchemaSourceConfig);
}

/**
 * Extracts and normalizes a JSON Schema from a concrete schema source input.
 *
 * @param input - The schema source input to extract from.
 * @param variant - Optional source variant override. When omitted, the variant is inferred from the input.
 * @returns A promise that resolves to a bundled JSON Schema.
 * @throws Will throw an error if no valid JSON Schema can be extracted from the input.
 */
export async function extractSchema(
  input: SchemaSourceConfig,
  variant?: SchemaConfigVariant
): Promise<JsonSchema> {
  if (isSchemaWithSource(input)) {
    return input.schema;
  }

  const resolvedVariant = variant ?? extractResolvedVariant(input);

  let schema: JsonSchema | undefined;
  if (
    resolvedVariant === "zod3" ||
    resolvedVariant === "json-schema" ||
    resolvedVariant === "standard-schema" ||
    resolvedVariant === "untyped" ||
    resolvedVariant === "valibot"
  ) {
    schema = extractJsonSchema(input);
  } else if (resolvedVariant === "reflection") {
    schema = extractReflection(input as Type);
  }

  if (schema) {
    return bundleReferences(schema);
  }

  throw new Error(
    `Failed to extract a valid schema from the provided input. The input must be a Zod schema, a Standard JSON Schema, a JSON Schema object, a Valibot BaseSchema, an untyped schema, or a reflected Deepkit Type object.`
  );
}

/**
 * Builds source metadata for a schema input using a known source variant.
 *
 * @param variant - The schema source variant associated with the input.
 * @param input - The schema source input to wrap.
 * @returns The normalized schema source payload, including the source hash and variant.
 * @throws Will throw an error if the provided variant is unsupported.
 */
export function extractSource(
  variant: SchemaSourceVariant,
  input: SchemaSourceConfig
): SchemaSource {
  if (variant === "zod3") {
    return {
      hash: extractHash(variant, input),
      variant: "zod3",
      schema: input as z3.ZodTypeAny
    };
  } else if (variant === "untyped") {
    return {
      hash: extractHash(variant, input),
      variant: "untyped",
      schema: input as UntypedConfigObject | UntypedSchema
    };
  } else if (variant === "standard-schema") {
    return {
      hash: extractHash(variant, input),
      variant: "standard-schema",
      schema: input as StandardJSONSchemaV1
    };
  } else if (variant === "json-schema") {
    return {
      hash: extractHash(variant, input),
      variant: "json-schema",
      schema: input as JsonSchema
    };
  } else if (variant === "valibot") {
    return {
      hash: extractHash(variant, input),
      variant: "valibot",
      schema: input as ValibotSchema
    };
  } else if (variant === "reflection") {
    return {
      hash: extractHash(variant, input),
      variant: "reflection",
      schema: input as Type
    };
  }

  throw new Error(
    `Failed to extract source information from the provided input. The input must be a Zod schema, a Standard JSON Schema, a JSON Schema object, an untyped schema, or a reflected Deepkit Type object.`
  );
}

const deepkitCache = new Cache();

function rewriteTypeOnlyImports(source: string): string {
  return source
    .replaceAll(/\bimport\s+type\s+/g, "import ")
    .replaceAll(/\bexport\s+type\s+\*\s+from/g, "export * from")
    .replaceAll(/\bexport\s+type\s+\{/g, "export {");
}

function resolveReflectionConfig(options: BaseExtractOptions) {
  return {
    reflection: options.reflection ?? "default",
    exclude: options.exclude
  };
}

function getCompilerOptions(options: BaseExtractOptions): ts.CompilerOptions {
  const cwd = options.cwd || process.cwd();
  const tsconfigPath = options.tsconfig
    ? appendPath(options.tsconfig, cwd)
    : joinPaths(cwd, "tsconfig.json");

  try {
    const raw = ts.sys.readFile(tsconfigPath);
    if (raw) {
      const parsed = ts.parseConfigFileTextToJson(tsconfigPath, raw);
      if (parsed.config) {
        const result = ts.parseJsonConfigFileContent(
          parsed.config,
          ts.sys,
          findFilePath(tsconfigPath) || cwd,
          {},
          tsconfigPath
        );

        return {
          ...result.options,
          noEmit: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true
        };
      }
    }
  } catch {
    // Fall through to defaults when tsconfig is missing or invalid.
  }

  return {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strictNullChecks: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    skipLibCheck: true,
    esModuleInterop: true,
    noEmit: true
  };
}

function transpileWithDeepkit(
  code: string,
  fileName: string,
  options: BaseExtractOptions
): ts.TranspileOutput {
  const reflectionConfig = resolveReflectionConfig(options);
  deepkitCache.tick();

  return ts.transpileModule(code, {
    compilerOptions: getCompilerOptions(options),
    fileName,
    transformers: {
      before: [
        context =>
          new ReflectionTransformer(context, deepkitCache).withReflection(
            reflectionConfig
          )
      ],
      after: [
        context =>
          new DeclarationTransformer(context, deepkitCache).withReflection(
            reflectionConfig
          )
      ]
    }
  });
}

async function readSourceFile(
  path: string,
  fs?: FileSystemInterface
): Promise<string | undefined> {
  try {
    if (fs?.promises?.readFile) {
      return await fs.promises.readFile(path, "utf8");
    }

    return await readFile(path, "utf8");
  } catch {
    return undefined;
  }
}

function createDeepkitPlugin(
  options: BaseExtractOptions & { fs?: FileSystemInterface }
): Plugin {
  return {
    name: "power-plant:deepkit",
    setup(pluginBuild) {
      pluginBuild.onLoad({ filter: /\.(m|c)?tsx?$/ }, async args => {
        if (args.pluginData?.isReflected) {
          const contents = await readSourceFile(args.path, options.fs);
          if (!contents) {
            return null;
          }

          return {
            contents,
            loader: "ts",
            pluginData: { isReflected: true }
          };
        }

        const raw = await readSourceFile(args.path, options.fs);
        if (!raw) {
          return null;
        }

        const result = transpileWithDeepkit(
          rewriteTypeOnlyImports(raw),
          args.path,
          options
        );

        if (result.diagnostics?.length) {
          const errors = result.diagnostics.filter(
            diagnostic => diagnostic.category === DiagnosticCategory.Error
          );
          if (errors.length > 0) {
            const errorMessage = `Deepkit Type reflection transpilation errors: ${
              args.path
            } \n ${errors
              .map(
                diagnostic =>
                  `-${diagnostic.file ? `${diagnostic.file.fileName}:` : ""} ${
                    typeof diagnostic.messageText === "string"
                      ? diagnostic.messageText
                      : diagnostic.messageText.messageText
                  } (at ${diagnostic.start}:${diagnostic.length})`
              )
              .join("\n")}`;
            options.logger?.error?.(errorMessage);
            throw new Error(errorMessage);
          }
        }

        return {
          contents: result.outputText,
          loader: "ts",
          pluginData: { isReflected: true }
        };
      });
    }
  };
}

/**
 * Resolves a type definition to a JSON Schema. Bundles the TypeScript module
 * graph with esbuild using `@deepkit/type-compiler` reflection transformers,
 * then converts the reflected Deepkit {@link Type} via {@link reflectionToJsonSchema}.
 *
 * @param input - The type definition to compile. This can be either a string or a {@link FileReference} object.
 * @param options - Optional overrides for reflection and file resolution.
 * @returns A promise that resolves to the generated JSON Schema.
 * @see https://deepkit.io/en/documentation/runtime-types/reflection
 */
export async function extractTSType(
  input: FileReferenceInput,
  options: InferLoadOptions<typeof input> & BaseExtractOptions = {}
): Promise<JsonSchema> {
  const fileReference = extractFileReference(input);
  if (!fileReference) {
    throw new Error(
      `Failed to extract a file reference from the provided input. The input must be a string or an object with a "file" property that specifies the file path and optional export name.`
    );
  }

  const exportName = fileReference.export ?? "default";
  const resolvedPath = await resolveSafe(fileReference.file, {
    fs: options.fs
  });
  const filePath = resolvedPath || fileReference.file;
  const cwd = options.cwd || process.cwd();

  try {
    options.logger?.debug?.(
      `Generating JSON schema for bundled "${filePath}" using the type "${exportName}"`
    );

    const result = await build({
      platform: "node",
      format: "esm",
      logLevel: "silent",
      entryPoints: [filePath],
      write: false,
      sourcemap: false,
      splitting: false,
      treeShaking: true,
      bundle: true,
      keepNames: true,
      metafile: false,
      minify: true,
      legalComments: "none",
      target: "es2022",
      absWorkingDir: cwd,
      plugins: [
        createDeepkitPlugin(
          options as BaseExtractOptions & { fs?: FileSystemInterface }
        )
      ]
    });

    if (result.errors.length > 0) {
      throw new Error(result.errors.map(error => error.text).join(", "));
    }

    const bundled = result.outputFiles?.filter(Boolean)[0]?.text;
    if (!isSetString(bundled)) {
      throw new Error(
        `No output files generated for "${filePath}". Please check the configuration and try again.`
      );
    }

    const evaluated = (await createJiti(cwd).evalModule(bundled, {
      filename: filePath,
      ext: findFileDotExtensionSafe(filePath) || ".ts"
    })) as Record<string, unknown>;

    let resolved = evaluated[exportName] ?? evaluated[`__Ω${exportName}`];
    if (resolved === undefined) {
      throw new Error(
        `The export "${exportName}" could not be resolved in the "${filePath}" module. ${
          Object.keys(evaluated).length === 0
            ? `After bundling, no exports were found in the module.`
            : `After bundling, the available exports were: ${Object.keys(
                evaluated
              ).join(", ")}.`
        }`
      );
    }

    try {
      const type = reflect(resolved);
      if (isType(type)) {
        resolved = type;
      }
    } catch {
      // If reflection fails, assume the resolved output is already usable.
    }

    if (isType(resolved)) {
      const schema = extractReflection(resolved);
      if (!schema) {
        throw new Error(
          `Failed to convert the reflected Deepkit type for "${exportName}" to JSON Schema.`
        );
      }

      return schema;
    }

    const schema = extractJsonSchema(resolved);
    if (!schema) {
      throw new Error(
        `The export "${exportName}" could not be converted to a JSON Schema.`
      );
    }

    return schema;
  } catch (error) {
    throw new Error(
      `Failed to generate a JSON schema for "${fileReference.file}"${
        resolvedPath && resolvedPath !== fileReference.file
          ? ` (resolved: ${resolvedPath})`
          : ""
      } using the type "${exportName}". Error: ${(error as Error).message}${
        (error as Error).stack ? `\n${(error as Error).stack}` : ""
      }`
    );
  }
}

/**
 * Extracts a JSON Schema from a given schema definition input, which can be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, a Deepkit Type object, or a {@link FileReferenceInput} to an exported TypeScript type definition or any of the previous options. If the input is a {@link FileReferenceInput} (e.g. a file path with an export), the source code will be bundled with [esbuild](https://esbuild.github.io) using [\@deepkit/type-compiler](https://deepkit.io/en/documentation/runtime-types/getting-started) reflection to obtain the actual schema definition before extraction.
 *
 * @example
 * ```ts
 * Resolve a schema definition from a JSON schema file
 * const schema1 = await extract(context, "./schemas/my-json-schema.json");
 * // Resolve a schema definition from a TypeScript module export
 * const schema2 = await extract(context, "./schemas.ts#MySchema");
 * // Resolve a schema definition from a JSON Schema object
 * const schema3 = await extract(context, schemaObject);
 * // Resolve a schema definition from a Zod schema
 * const schema4 = await extract(context, zodSchema);
 * // Resolve a schema definition from a Valibot schema
 * const schema5 = await extract(context, valibotSchema);
 * // Resolve a schema definition from a reflected Deepkit Type object
 * const schema6 = await extract(context, reflectionType);
 * ```
 *
 * @see https://zod.dev/
 * @see https://valibot.dev/
 * @see https://standardschema.dev/json-schema#what-schema-libraries-support-this-spec
 * @see https://json-schema.org/
 * @see https://ajv.js.org/json-type-definition.html
 * @see https://deepkit.io/en/documentation/runtime-types/reflection
 * @see https://github.com/unjs/untyped
 * @see https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
 *
 * @param input - The schema definition input to extract, which can be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, or a {@link FileReferenceInput} to an exported TypeScript type definition or any of the previous options.
 * @param options - Optional overrides for the configuration used during extraction.
 * @returns A promise that resolves to the extracted and normalized schema as a JSON Schema object.
 * @throws Will throw an error if the input is not a valid schema definition or if the extraction process fails to produce a valid schema.
 */
export async function extractSchemaWithSource<TSpec = any>(
  input: SchemaConfig,
  options: InferExtractOptions<typeof input> = {}
): Promise<ExtractedSchemaEnvelope<TSpec>> {
  const unwrappedConfig = unwrapSchemaConfig(input);

  if (isSchemaWithSource(unwrappedConfig)) {
    return unwrappedConfig as ExtractedSchemaEnvelope<TSpec>;
  }

  if (isSchema(unwrappedConfig)) {
    return {
      ...unwrappedConfig,
      source: {
        hash: extractHash("json-schema", unwrappedConfig.schema),
        variant: "json-schema",
        schema: unwrappedConfig.schema
      }
    } as ExtractedSchemaEnvelope<TSpec>;
  }

  let source: SchemaSource;

  const variant = extractVariant(unwrappedConfig);
  const hash = extractHash(variant, unwrappedConfig);

  if (variant === "file-reference") {
    const fileReference = extractFileReference(
      unwrappedConfig as FileReferenceInput
    );
    if (!fileReference) {
      throw new Error(
        `Failed to extract a valid file reference from the provided input "${JSON.stringify(
          unwrappedConfig
        )}". Please ensure that the input is correctly formatted as a file reference (e.g. "./schema.ts#MySchema") and that the file exists at the specified path.`
      );
    }

    const extension = findFileExtensionSafe(fileReference.file);
    if (extension && !VALID_OBJECT_SOURCE_EXTENSIONS.includes(extension)) {
      throw new Error(
        `The provided schema file input "${
          fileReference.file
        }" has an invalid file extension (.${
          extension
        }). Please ensure that the file has one of the following extensions: ${list(
          VALID_OBJECT_SOURCE_EXTENSIONS,
          { conjunction: "or" }
        )}.`
      );
    }

    let fs: FileSystemInterface | undefined;
    if (options.storage) {
      fs = mapStorageToFileSystem(options.storage);
    }

    const loadOptions = {
      ...omit(options, ["storage", "logger", "tsconfig"]),
      fs,
      cwd: options.cwd ?? undefined
    } as InferLoadOptions<FileReferenceInput>;

    let resolved = await loadSafe<SchemaConfig>(
      unwrappedConfig as FileReferenceInput,
      loadOptions
    );
    resolved ??= await extractTSType(unwrappedConfig as FileReferenceInput, {
      ...options,
      fs
    });

    try {
      const type = reflect(resolved);
      if (isType(type)) {
        resolved = type as SchemaConfig;
      }
    } catch {
      // If reflection fails, proceed with the resolved value as-is.
    }

    const resolvedConfig = unwrapSchemaConfig(resolved);
    if (isSchemaWithSource(resolvedConfig)) {
      source = resolvedConfig.source;
    } else if (isSchema(resolvedConfig)) {
      source = {
        hash: extractHash("json-schema", resolvedConfig.schema),
        variant: "json-schema",
        schema: resolvedConfig.schema
      };
    } else {
      source = extractSource(
        extractResolvedVariant(resolvedConfig as SchemaSourceConfig),
        resolvedConfig as SchemaSourceConfig
      );
    }
  } else if (
    [
      "json-schema",
      "standard-schema",
      "zod3",
      "untyped",
      "valibot",
      "reflection"
    ].includes(variant)
  ) {
    source = extractSource(variant, unwrappedConfig as SchemaSourceConfig);
  } else {
    throw new Error(
      `Invalid schema definition input "${
        variant
      }". The variant must be one of "file-reference", "json-schema", "standard-schema", "zod3", "valibot", "untyped", or "reflection".`
    );
  }

  return {
    variant,
    source,
    schema: await extractSchema(source.schema, source.variant),
    hash
  } as ExtractedSchemaEnvelope<TSpec>;
}

/**
 * Extracts a JSON Schema from a given schema definition input, which can be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, a Deepkit Type object, or a {@link FileReferenceInput} to an exported TypeScript type definition or any of the previous options. If the input is a {@link FileReferenceInput} (e.g. a file path with an export), the source code will be bundled with [esbuild](https://esbuild.github.io) using [\@deepkit/type-compiler](https://deepkit.io/en/documentation/runtime-types/getting-started) reflection to obtain the actual schema definition before extraction.
 *
 * @example
 * ```ts
 * Resolve a schema definition from a JSON schema file
 * const schema1 = await extract(context, "./schemas/my-json-schema.json");
 * // Resolve a schema definition from a TypeScript module export
 * const schema2 = await extract(context, "./schemas.ts#MySchema");
 * // Resolve a schema definition from a JSON Schema object
 * const schema3 = await extract(context, schemaObject);
 * // Resolve a schema definition from a Zod schema
 * const schema4 = await extract(context, zodSchema);
 * // Resolve a schema definition from a Valibot schema
 * const schema5 = await extract(context, valibotSchema);
 * // Resolve a schema definition from a reflected Deepkit Type object
 * const schema6 = await extract(context, reflectionType);
 * ```
 *
 * @see https://zod.dev/
 * @see https://valibot.dev/
 * @see https://standardschema.dev/json-schema#what-schema-libraries-support-this-spec
 * @see https://json-schema.org/
 * @see https://ajv.js.org/json-type-definition.html
 * @see https://deepkit.io/en/documentation/runtime-types/reflection
 * @see https://github.com/unjs/untyped
 * @see https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
 *
 * @param input - The schema definition input to extract, which can be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, or a {@link FileReferenceInput} to an exported TypeScript type definition or any of the previous options.
 * @param options - Optional overrides for the configuration used during extraction.
 * @returns A promise that resolves to the extracted and normalized schema as a JSON Schema object.
 * @throws Will throw an error if the input is not a valid schema definition or if the extraction process fails to produce a valid schema.
 */
export async function extract<TSpec = any>(
  input: SchemaConfig<TSpec>,
  options: InferExtractOptions<typeof input> = {}
): Promise<SchemaEnvelopeOf<TSpec>> {
  const unwrappedConfig = unwrapSchemaConfig<TSpec>(
    input
  ) as SchemaEnvelopeOf<TSpec>;

  if (
    isSchemaWithSource(unwrappedConfig) ||
    isSchemaOf<TSpec>(unwrappedConfig)
  ) {
    return unwrappedConfig;
  }

  const result = await extractSchemaWithSource<TSpec>(input, options);

  if (!result?.schema) {
    throw new Error(
      `Failed to extract a valid schema from the provided input. The input must be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, or a reflected Deepkit Type object.`
    );
  }

  return result;
}
