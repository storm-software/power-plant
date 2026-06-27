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

import { toArray } from "@stryke/convert/to-array";
import { formatYYYYMMDD } from "@stryke/date/format";
import { isValidTimestamp } from "@stryke/date/validate";
import { getUnique } from "@stryke/helpers/get-unique";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isDate } from "@stryke/type-checks/is-date";
import { isFunction } from "@stryke/type-checks/is-function";
import { isNumber } from "@stryke/type-checks/is-number";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { nanoid } from "@stryke/unique-id/nanoid";
import { stringifyType } from "./codegen";
import { JSON_SCHEMA_METADATA_KEYS } from "./constants";
import type {
  JsonSchema,
  JsonSchemaMetadataKeywords,
  JsonSchemaPrimitiveType,
  JsonSchemaType,
  Meta,
  MetaLink,
  MetaValue,
  SchemaMeta,
  SchemaMetaExample
} from "./types";

interface JsonSchemaTypeView {
  type?: JsonSchemaType | readonly JsonSchemaType[];
}

/**
 * Applies Powerlines schema metadata onto a JSON Schema fragment.
 *
 * @param schema - The JSON Schema fragment to apply metadata to.
 * @param metadata - The Powerlines schema metadata to apply.
 * @returns A new JSON Schema fragment with the metadata applied.
 */
export function applyJsonSchemaMetadata(
  schema: JsonSchema,
  metadata: JsonSchemaMetadataKeywords | undefined
): JsonSchema {
  if (!metadata || !isSetObject(schema)) {
    return schema;
  }

  const result: JsonSchema = { ...schema };
  const mutableResult = result as Record<string, unknown>;
  for (const key of JSON_SCHEMA_METADATA_KEYS) {
    const value = metadata[key];
    if (value !== undefined && value !== null) {
      mutableResult[key] = value;
    }
  }

  return result;
}

/**
 * Normalizes the JSON Schema `type` keyword to a string array.
 *
 * @remarks
 * This function ensures that the `type` keyword of a JSON Schema fragment is always represented as an array of strings, even if it was originally defined as a single string. This normalization simplifies type checking and processing of JSON Schemas by providing a consistent format for the `type` information.
 *
 * @param schema - The JSON Schema fragment to read types from.
 * @returns An array of JSON Schema primitive type names defined in the `type` keyword, or an empty array if no valid types are found.
 */
export function readSchemaTypes(
  schema?: JsonSchema
): JsonSchemaPrimitiveType[] {
  if (!isSetObject(schema)) {
    return [];
  }

  const objectSchema = schema as JsonSchemaTypeView;

  if (Array.isArray(objectSchema.type)) {
    return objectSchema.type.filter(
      (type: JsonSchemaPrimitiveType): type is JsonSchemaPrimitiveType =>
        isSetString(type)
    );
  }
  if (
    isSetString(objectSchema.type) &&
    objectSchema.type !== "object" &&
    objectSchema.type !== "array"
  ) {
    return [objectSchema.type];
  }
  return [];
}

/**
 * Returns the primary non-null JSON Schema type name for a fragment.
 *
 * @param schema - The JSON Schema fragment to check.
 * @returns The primary non-null JSON Schema type name, or `undefined` if none is found.
 */
export function getPrimarySchemaType(
  schema?: JsonSchema
): JsonSchemaPrimitiveType | undefined {
  if (!isSetObject(schema)) {
    return undefined;
  }

  return readSchemaTypes(schema).find(type => type !== "null");
}

export function formatMetaVersion(value: string | number | Date): string {
  return isDate(value)
    ? formatYYYYMMDD(value)
    : isNumber(value)
      ? isValidTimestamp(value) && value > 1_000_000_000
        ? formatYYYYMMDD(new Date(value))
        : value.toString()
      : isSetString(value)
        ? value
        : "1.0";
}

/**
 * Extracts the version information from a given input, which can be a string, number, or Date object. The function returns a string representation of the version in the format "YYYYMMDD" for Date inputs, or as a string for valid timestamp numbers. If the input is a string, it is returned as-is. If the input is invalid or not provided, a default version of "1.0" is returned.
 *
 * @param input - The input from which to extract the version. It can be a string, number, undefined, or Date object.
 * @returns A string representing the extracted version information.
 */
export function resolveMetaVersion<TSpec>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec>>,
  input?: MetaValue<TSpec, string | number | Date>
): MetaValue<TSpec, string> {
  const value = input ?? meta?.version ?? schema?.version;
  if (isFunction(value)) {
    return async (spec: TSpec) =>
      formatMetaVersion(await Promise.resolve(value(spec)));
  }

  return formatMetaVersion(value as string | number | Date);
}

/**
 * Resolves a metadata name using explicit input, metadata, or schema fallbacks.
 *
 * @param schema - The JSON Schema fragment to read fallback values from.
 * @param meta - Metadata values that may already include a name.
 * @param input - An explicit name value to prioritize when provided.
 * @returns The resolved metadata name.
 */
export function resolveMetaName<TSpec>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec>>,
  input?: MetaValue<TSpec, string>
): MetaValue<TSpec, string> {
  return (
    input ??
    meta.name ??
    (isSetString(schema?.name)
      ? schema.name
      : isSetString(schema?.displayName)
        ? schema.displayName
        : schema.$id
          ? kebabCase(schema.$id)
          : stringifyType(schema))
  );
}

/**
 * Resolves a stable metadata identifier in the format `<name>@<version>`.
 *
 * @param schema - The JSON Schema fragment used to infer fallback values.
 * @param meta - Metadata values used to resolve name and version.
 * @returns The resolved metadata identifier, or a generated id when no name is available.
 */
export function resolveMetaId<TSpec>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec>>
): MetaValue<TSpec, string> {
  const name = resolveMetaName<TSpec>(schema, meta);
  const version = resolveMetaVersion<TSpec>(schema, meta);

  return name
    ? isFunction(name)
      ? isFunction(version)
        ? async (spec: TSpec) =>
            `${kebabCase(await Promise.resolve(name(spec)))}@${await Promise.resolve(version(spec))}`
        : async (spec: TSpec) =>
            `${kebabCase(await Promise.resolve(name(spec)))}@${version}`
      : isFunction(version)
        ? async (spec: TSpec) =>
            `${kebabCase(name)}@${await Promise.resolve(version(spec))}`
        : `${kebabCase(name)}@${version}`
    : nanoid();
}

/**
 * Resolves a human-readable display name for metadata.
 *
 * @param schema - The JSON Schema fragment to read fallback display values from.
 * @param meta - Metadata values that may already include a display name.
 * @param input - An explicit display name value to prioritize when provided.
 * @returns The resolved metadata display name.
 */
export function resolveMetaDisplayName<TSpec>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec>>,
  input?: MetaValue<TSpec, string>
): MetaValue<TSpec, string> {
  const value = input ?? meta.displayName ?? schema?.displayName;
  if (value !== undefined) {
    return value;
  }

  const name = meta.name;
  if (isFunction(name)) {
    return async (spec: TSpec) => {
      return titleCase(await Promise.resolve(name(spec)));
    };
  }

  return titleCase(name ?? stringifyType(schema));
}

/**
 * Resolves a metadata description from explicit input, metadata, or schema values.
 *
 * @param template - A template string used to generate a default description when no explicit description is provided.
 * @param schema - The JSON Schema fragment to read fallback description values from.
 * @param meta - Metadata values that may already include a description.
 * @param input - An explicit description value to prioritize when provided.
 * @returns The resolved description, if available.
 */
export function resolveMetaDescription<TSpec>(
  template: string,
  schema: JsonSchema,
  meta: Partial<Meta<TSpec>>,
  input?: MetaValue<TSpec, string>
): MetaValue<TSpec, string> {
  meta.displayName ??= resolveMetaDisplayName(schema, meta);

  const defaultDescription: Meta<TSpec>["description"] = isFunction(
    meta.displayName
  )
    ? async (spec: TSpec) => {
        return template.replaceAll(
          /\{\s*displayName\s*\}/g,
          await Promise.resolve(
            (meta.displayName as (spec: TSpec) => string)(spec)
          )
        );
      }
    : template.replaceAll(/\{\s*displayName\s*\}/g, meta.displayName);

  let result = input ?? meta.description ?? schema?.description;
  if (isFunction(result)) {
    result = async (spec: TSpec) => {
      const description = await Promise.resolve(
        (result as (spec: TSpec) => string)(spec)
      );
      if (isSetString(description)) {
        return description;
      }

      return isFunction(defaultDescription)
        ? defaultDescription(spec)
        : defaultDescription;
    };
  } else {
    result = isSetString(result) ? result : defaultDescription;
  }

  return result;
}

/**
 * Resolves and normalizes metadata examples into a consistent object format.
 *
 * @typeParam TSpec - The schema specification type associated with example values.
 * @param schema - The JSON Schema fragment to read fallback examples from.
 * @param meta - Metadata values that may already include examples.
 * @param input - Explicit examples to prioritize when provided.
 * @returns A normalized list of examples with generated descriptions when needed.
 */
export function resolveMetaExample<TSpec>(
  schema: JsonSchema,
  meta: Partial<SchemaMeta<TSpec>>,
  input?:
    | SchemaMetaExample<TSpec>
    | MetaValue<TSpec, SchemaMetaExample<TSpec>[]>
): MetaValue<TSpec, SchemaMetaExample<TSpec>[]> {
  const normalizeExamples = (examples: unknown[]): SchemaMetaExample<TSpec>[] =>
    examples
      .map((example: unknown, i: number) =>
        isSetString(example)
          ? { description: `Example #${i + 1}`, value: example }
          : isSetObject(example) &&
              "value" in example &&
              isSetString(example.value)
            ? {
                description:
                  (example as { description?: string }).description ||
                  `Example #${i + 1}`,
                value: example.value
              }
            : undefined
      )
      .filter(Boolean) as SchemaMetaExample<TSpec>[];

  const value = input ?? meta.examples ?? schema?.examples ?? [];
  if (isFunction(value)) {
    return async (spec: TSpec) =>
      normalizeExamples(toArray(await Promise.resolve(value(spec))));
  }

  return normalizeExamples(toArray(value));
}

/**
 * Resolves and de-duplicates metadata links from input, metadata, and schema docs.
 *
 * @param schema - The JSON Schema fragment to read fallback documentation links from.
 * @param meta - Metadata values that may already include links.
 * @param input - Explicit links to prioritize when provided.
 * @returns A unique list of metadata links.
 */
export function resolveMetaLinks<TSpec>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec>>,
  input?: MetaValue<TSpec, MetaLink[]>
): MetaValue<TSpec, MetaLink[]> {
  return isFunction(input) || isFunction(meta.links)
    ? async (spec: TSpec) =>
        getUnique(
          toArray(
            isFunction(input) ? await Promise.resolve(input(spec)) : input
          )
            .concat(
              isFunction(meta.links)
                ? await Promise.resolve(meta.links(spec))
                : (meta.links ?? [])
            )
            .concat(schema?.docs ?? [])
        )
    : getUnique(
        toArray(input)
          .concat(meta.links ?? [])
          .concat(schema?.docs ?? [])
      );
}
