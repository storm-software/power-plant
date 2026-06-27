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

import type { StandardJSONSchemaV1 } from "@standard-schema/spec";
import { extractFileReference } from "@stryke/convert/extract-file-reference";
import { murmurhash } from "@stryke/hash";
import { deepClone } from "@stryke/helpers/deep-clone";
import { isStandardJsonSchema } from "@stryke/json";
import { findFileExtensionSafe } from "@stryke/path/find";
import { VALID_OBJECT_SOURCE_EXTENSIONS } from "@stryke/resolve/constants";
import { loadSafe } from "@stryke/resolve/load";
import type { InferLoadOptions } from "@stryke/resolve/types";
import { list } from "@stryke/string-format/list";
import { isSetString } from "@stryke/type-checks";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import type { FileReferenceInput } from "@stryke/types";
import {
  extractJsonSchema as extractJsonSchemaZod,
  isZod3Type
} from "@stryke/zod";
import { toJsonSchema } from "@valibot/to-json-schema";
import { createGenerator } from "ts-json-schema-generator/dist/factory/generator";
import type { Config as TsJsonSchemaGeneratorConfig } from "ts-json-schema-generator/dist/src/Config.js";
import type * as z3 from "zod/v3";
import {
  resolveMetaDescription,
  resolveMetaDisplayName,
  resolveMetaExample,
  resolveMetaId,
  resolveMetaLinks,
  resolveMetaName,
  resolveMetaVersion
} from "./metadata";
import {
  isFileReference,
  isJsonSchema,
  isJsonSchemaObject,
  isSchema,
  isSchemaOf,
  isSchemaWithSource,
  isUntypedInput,
  isUntypedInputStrict,
  isUntypedSchema,
  isUntypedSchemaStrict,
  isValibotSchema
} from "./type-checks";
import type {
  ExtractedSchema,
  InferExtractOptions,
  JsonSchema,
  SchemaInput,
  SchemaInputVariant,
  SchemaInputWithMeta,
  SchemaMeta,
  SchemaMetaInput,
  SchemaOf,
  SchemaSource,
  SchemaSourceInput,
  SchemaSourceVariant,
  UntypedInputObject,
  UntypedSchema,
  ValibotSchema
} from "./types";

const SCHEMA_BUNDLE_BASE_URI = "https://power-plant.invalid/";

interface UnwrappedSchemaInput<TSpec = any> {
  input: SchemaInput<TSpec>;
  meta?: SchemaMetaInput<TSpec>;
}

function isSchemaInputWithMeta<TSpec = any>(
  input: SchemaInput<TSpec>
): input is SchemaInputWithMeta<TSpec> {
  if (!isSetObject(input) || !("schema" in input)) {
    return false;
  }

  if ("hash" in input || "variant" in input || "source" in input) {
    return false;
  }

  return Object.keys(input).every(key => key === "schema" || key === "meta");
}

function unwrapSchemaInput<TSpec = any>(
  input: SchemaInput<TSpec>
): UnwrappedSchemaInput<TSpec> {
  if (isSchemaInputWithMeta(input)) {
    return {
      input: input.schema as SchemaInput<TSpec>,
      meta: isSetString(input.meta) ? { description: input.meta } : input.meta
    };
  }

  return {
    input
  };
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
    if (isUntypedInput(value)) {
      return convertUntypedInputToJsonSchema(value);
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

function convertUntypedInputToJsonSchema(
  input: UntypedInputObject
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

    if (isUntypedInput(value)) {
      properties[key] = convertUntypedInputToJsonSchema(value);
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
  variant: SchemaInputVariant,
  input: SchemaInput
): string {
  const { input: unwrappedInput } = unwrapSchemaInput(input);

  if (isSchemaWithSource(unwrappedInput) || isSchema(unwrappedInput)) {
    return murmurhash({ variant, input: unwrappedInput.schema });
  }

  if (isSetString(unwrappedInput)) {
    return murmurhash({ variant, input: unwrappedInput });
  } else if (typeof unwrappedInput === "boolean") {
    return murmurhash({ variant, input: unwrappedInput });
  } else if (isSetObject(unwrappedInput)) {
    if (isZod3Type(unwrappedInput)) {
      return murmurhash({ variant, input: unwrappedInput._def });
    } else if (isStandardJsonSchema(unwrappedInput)) {
      return murmurhash({ variant, input: unwrappedInput["~standard"] });
    } else if (isJsonSchema(unwrappedInput)) {
      return murmurhash({ variant, input: unwrappedInput });
    } else if (isValibotSchema(unwrappedInput)) {
      return murmurhash({
        variant,
        input: convertValibotSchemaToJsonSchema(unwrappedInput)
      });
    } else if (isUntypedInput(unwrappedInput)) {
      return murmurhash({
        variant,
        input: convertUntypedInputToJsonSchema(unwrappedInput)
      });
    } else if (isUntypedSchema(unwrappedInput)) {
      return murmurhash({
        variant,
        input: convertUntypedSchemaToJsonSchema(unwrappedInput)
      });
    }
  }

  throw new Error(
    `Failed to create an input hash for the provided schema definition input. The input must be a Zod schema, a Standard JSON Schema, a JSON Schema object, a Valibot BaseSchema, or a reflected Deepkit Type object.`
  );
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
    if (isUntypedInputStrict(schema)) {
      return convertUntypedInputToJsonSchema(schema);
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
  input: SchemaSourceInput
): SchemaSourceVariant {
  if (isSetObject(input)) {
    if (isZod3Type(input)) {
      return "zod3";
    } else if (isUntypedInputStrict(input) || isUntypedSchemaStrict(input)) {
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
export function extractVariant(input: SchemaInput): SchemaInputVariant {
  const { input: unwrappedInput } = unwrapSchemaInput(input);

  if (isSchemaWithSource(unwrappedInput) || isSchema(unwrappedInput)) {
    return unwrappedInput.variant;
  }

  if (isSetString(unwrappedInput) || isFileReference(unwrappedInput)) {
    return "file-reference";
  }

  return extractResolvedVariant(unwrappedInput as SchemaSourceInput);
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
  input: SchemaSourceInput,
  variant?: SchemaInputVariant
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
  input: SchemaSourceInput
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
      schema: input as UntypedInputObject | UntypedSchema
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
  }

  throw new Error(
    `Failed to extract source information from the provided input. The input must be a Zod schema, a Standard JSON Schema, a JSON Schema object, an untyped schema, or a reflected Deepkit Type object.`
  );
}

/**
 * Resolves a type definition to a JSON Schema. This function passes the provided file reference to ts-json-schema-generator, using the referenced export name as the target type when one is provided.
 *
 * @param input - The type definition to compile. This can be either a string or a {@link FileReference} object.
 * @param options - Optional overrides reserved for API compatibility.
 * @returns A promise that resolves to the generated JSON Schema.
 */
export async function extractTSType(
  input: FileReferenceInput,
  options: InferLoadOptions<typeof input> = {}
): Promise<JsonSchema> {
  const fileReference = extractFileReference(input);
  if (!fileReference) {
    throw new Error(
      `Failed to extract a file reference from the provided input. The input must be a string or an object with a "file" property that specifies the file path and optional export name.`
    );
  }

  const exportName = fileReference.export ?? "*";

  try {
    const generatorConfig: TsJsonSchemaGeneratorConfig = {
      path: fileReference.file,
      type: exportName,
      expose: "export",
      jsDoc: "extended",
      ...options
    };

    const generator = createGenerator(generatorConfig);

    return generator.createSchema(exportName) as JsonSchema;
  } catch (error) {
    throw new Error(
      `Failed to generate a JSON schema for "${fileReference.file}" using the type "${exportName}". Error: ${(error as Error).message}`
    );
  }
}

/**
 * Extracts and normalizes {@link SchemaMeta | schema metadata} from a given {@link SchemaMetaInput}. This function ensures that the metadata is in a consistent format, converting version numbers to strings and filtering out any invalid or empty tags.
 *
 * @param schema - The schema from which to extract metadata.
 * @param input - The schema metadata input to extract and normalize.
 * @returns The normalized schema metadata.
 */
export function extractSchemaMeta<TSpec = any>(
  schema: SchemaOf<TSpec>,
  input?: SchemaMetaInput<TSpec>
): SchemaMeta<TSpec> {
  const jsonSchema = schema.schema;
  const meta = (schema.meta ?? {}) as SchemaMeta<TSpec>;

  meta.name = resolveMetaName(jsonSchema, meta, input?.name);
  meta.version = resolveMetaVersion(jsonSchema, meta, input?.version);
  meta.id = resolveMetaId(jsonSchema, meta);
  meta.displayName = resolveMetaDisplayName(
    jsonSchema,
    meta,
    input?.displayName
  );
  meta.description = resolveMetaDescription(
    "A schema that describes the shape of the {displayName} specification.",
    schema.schema,
    meta,
    input?.description
  );
  meta.examples = resolveMetaExample(schema.schema, meta, input?.examples);
  meta.links = resolveMetaLinks(schema.schema, meta, input?.links);

  if (input?.deprecated) {
    meta.deprecated = input?.deprecated;
  }
  if (input?.usage) {
    meta.usage = input?.usage;
  }
  if (input?.tags) {
    meta.tags = input?.tags;
  }

  return meta;
}

/**
 * Extracts a JSON Schema from a given schema definition input, which can be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, or a {@link FileReferenceInput} to an exported TypeScript type definition or any of the previous options. If the input is a {@link FileReferenceInput} (e.g. a file path with an export), the source code will be bundled with [esbuild](esbuild.github.io) using [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) to obtain the actual schema definition before extraction.
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
 * // Resolve a schema definition from an untyped schema
 * const schema6 = await extract(context, untypedSchema);
 * ```
 *
 * @see https://zod.dev/
 * @see https://valibot.dev/
 * @see https://standardschema.dev/json-schema#what-schema-libraries-support-this-spec
 * @see https://json-schema.org/
 * @see https://ajv.js.org/json-type-definition.html
 * @see https://github.com/vega/ts-json-schema-generator
 * @see https://github.com/unjs/untyped
 * @see https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
 *
 * @param input - The schema definition input to extract, which can be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, or a {@link FileReferenceInput} to an exported TypeScript type definition or any of the previous options.
 * @param options - Optional overrides for the configuration used during extraction.
 * @returns A promise that resolves to the extracted and normalized schema as a JSON Schema object.
 * @throws Will throw an error if the input is not a valid schema definition or if the extraction process fails to produce a valid schema.
 */
export async function extractSchemaWithSource<TSpec = any>(
  input: SchemaInput,
  options: InferExtractOptions<typeof input> = {}
): Promise<ExtractedSchema<TSpec>> {
  const { input: unwrappedInput, meta } = unwrapSchemaInput(input);

  if (isSchemaWithSource(unwrappedInput)) {
    return {
      ...unwrappedInput,
      meta: extractSchemaMeta(unwrappedInput, meta)
    } as ExtractedSchema<TSpec>;
  }

  if (isSchema(unwrappedInput)) {
    return {
      ...unwrappedInput,
      meta: extractSchemaMeta(unwrappedInput, meta),
      source: {
        hash: extractHash("json-schema", unwrappedInput.schema),
        variant: "json-schema",
        schema: unwrappedInput.schema
      }
    } as ExtractedSchema<TSpec>;
  }

  let source: SchemaSource;
  let resolvedMeta: SchemaMetaInput<TSpec> | undefined = meta;

  const variant = extractVariant(unwrappedInput);
  const hash = extractHash(variant, unwrappedInput);

  if (variant === "file-reference") {
    const fileReference = extractFileReference(
      unwrappedInput as FileReferenceInput
    );
    if (!fileReference) {
      throw new Error(
        `Failed to extract a valid file reference from the provided input "${JSON.stringify(
          unwrappedInput
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

    let resolved = await loadSafe<SchemaInput>(
      unwrappedInput as FileReferenceInput,
      options
    );
    resolved ??= await extractTSType(
      unwrappedInput as FileReferenceInput,
      options
    );

    const { input: resolvedInput, meta: resolvedInputMeta } =
      unwrapSchemaInput(resolved);
    if (!resolvedMeta) {
      resolvedMeta = resolvedInputMeta;
    } else if (resolvedInputMeta) {
      resolvedMeta = {
        ...resolvedInputMeta,
        ...resolvedMeta
      };
    }

    if (isSchemaWithSource(resolvedInput)) {
      source = resolvedInput.source;
    } else if (isSchema(resolvedInput)) {
      source = {
        hash: extractHash("json-schema", resolvedInput.schema),
        variant: "json-schema",
        schema: resolvedInput.schema
      };
    } else {
      source = extractSource(
        extractResolvedVariant(resolvedInput as SchemaSourceInput),
        resolvedInput as SchemaSourceInput
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
    source = extractSource(variant, unwrappedInput as SchemaSourceInput);
  } else {
    throw new Error(
      `Invalid schema definition input "${
        variant
      }". The variant must be one of "file-reference", "json-schema", "standard-schema", "zod3", "valibot", "untyped", or "reflection".`
    );
  }

  const extracted = {
    variant,
    source,
    schema: await extractSchema(source.schema, source.variant),
    hash,
    meta: {}
  } as ExtractedSchema<TSpec>;
  extracted.meta = extractSchemaMeta(extracted as SchemaOf<any>, resolvedMeta);

  return extracted;
}

/**
 * Extracts a JSON Schema from a given schema definition input, which can be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, or a {@link FileReferenceInput} to an exported TypeScript type definition or any of the previous options. If the input is a {@link FileReferenceInput} (e.g. a file path with an export), the source code will be bundled with [esbuild](esbuild.github.io) using [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator) to obtain the actual schema definition before extraction.
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
 * // Resolve a schema definition from an untyped schema
 * const schema6 = await extract(context, untypedSchema);
 * ```
 *
 * @see https://zod.dev/
 * @see https://valibot.dev/
 * @see https://standardschema.dev/json-schema#what-schema-libraries-support-this-spec
 * @see https://json-schema.org/
 * @see https://ajv.js.org/json-type-definition.html
 * @see https://github.com/vega/ts-json-schema-generator
 * @see https://github.com/unjs/untyped
 * @see https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
 *
 * @param input - The schema definition input to extract, which can be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, or a {@link FileReferenceInput} to an exported TypeScript type definition or any of the previous options.
 * @param options - Optional overrides for the configuration used during extraction.
 * @returns A promise that resolves to the extracted and normalized schema as a JSON Schema object.
 * @throws Will throw an error if the input is not a valid schema definition or if the extraction process fails to produce a valid schema.
 */
export async function extract<TSpec = any>(
  input: SchemaInput<TSpec>,
  options: InferExtractOptions<typeof input> = {}
): Promise<SchemaOf<TSpec>> {
  const unwrapped = unwrapSchemaInput<TSpec>(input);
  const unwrappedInput = unwrapped.input as SchemaOf<TSpec>;

  if (isSchemaWithSource(unwrappedInput) || isSchemaOf<TSpec>(unwrappedInput)) {
    return {
      ...unwrappedInput,
      meta: extractSchemaMeta<TSpec>(unwrappedInput, unwrapped.meta)
    } as SchemaOf<TSpec>;
  }

  const result = await extractSchemaWithSource<TSpec>(input, options);
  result.meta = extractSchemaMeta(result as SchemaOf<any>, unwrapped.meta);

  if (!result?.schema) {
    throw new Error(
      `Failed to extract a valid schema from the provided input. The input must be a Zod schema, a Valibot schema, any Standard JSON Schema type, a plain JSON Schema object, an untyped schema, or a reflected Deepkit Type object.`
    );
  }

  return result;
}
