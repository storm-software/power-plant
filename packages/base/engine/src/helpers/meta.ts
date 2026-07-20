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

import type {
  MetaConfig,
  MetaLink,
  SchemaMetaConfig,
  SchemaMetaExample,
  SchemaOf
} from "@power-plant/core";
import type { ExtractedSchemaEnvelope, JsonSchema } from "@power-plant/schema";
import { isSchemaOf } from "@power-plant/schema";
import { stringifyType } from "@power-plant/schema/codegen";
import { toArray } from "@stryke/convert/to-array";
import { formatYYYYMMDD } from "@stryke/date/format";
import { isValidTimestamp } from "@stryke/date/validate";
import { getUnique } from "@stryke/helpers/get-unique";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isDate } from "@stryke/type-checks/is-date";
import { isNumber } from "@stryke/type-checks/is-number";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { uuid } from "@stryke/unique-id/uuid";

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
export function resolveMetaVersion(
  schema: JsonSchema,
  meta: Partial<MetaConfig>,
  input?: string | number | Date
): string {
  const value = input ?? meta?.version ?? schema?.version;

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
export function resolveMetaName(
  schema: JsonSchema,
  meta: Partial<MetaConfig>,
  input?: string
): string {
  return (
    input ??
    meta.name ??
    (isSetString(schema?.name)
      ? schema.name
      : isSetString(schema?.title)
        ? schema.title
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
export function resolveMetaId(
  schema: JsonSchema,
  meta: Partial<MetaConfig>
): string {
  const name = resolveMetaName(schema, meta);
  const version = resolveMetaVersion(schema, meta);

  return name ? `${kebabCase(name)}@${version}` : uuid();
}

/**
 * Resolves a human-readable display name for metadata.
 *
 * @param schema - The JSON Schema fragment to read fallback display values from.
 * @param meta - Metadata values that may already include a display name.
 * @param input - An explicit display name value to prioritize when provided.
 * @returns The resolved metadata display name.
 */
export function resolveMetaTitle(
  schema: JsonSchema,
  meta: Partial<MetaConfig>,
  input?: string
): string {
  const value = input ?? meta.title ?? schema?.title;
  if (value !== undefined) {
    return value;
  }

  return titleCase(meta.name ?? stringifyType(schema));
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
export function resolveMetaDescription(
  template: string,
  schema: JsonSchema,
  meta: Partial<MetaConfig>,
  input?: string
): string {
  meta.title ??= resolveMetaTitle(schema, meta);

  const title = meta.title ?? "";
  const defaultDescription = template.replaceAll(/\{\s*title\s*\}/g, title);
  const resolved = input ?? meta.description ?? schema?.description;

  return isSetString(resolved) ? resolved : defaultDescription;
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
  meta: Partial<SchemaMetaConfig<TSpec>>,
  input?: SchemaMetaExample<TSpec> | SchemaMetaExample<TSpec>[]
): SchemaMetaExample<TSpec>[] {
  const normalizeExamples = (examples: unknown[]): SchemaMetaExample<TSpec>[] =>
    examples
      .map((example: unknown, i: number) =>
        isSetString(example)
          ? {
              name: `example-${i + 1}`,
              description: `Example Specification #${i + 1}`,
              value: example
            }
          : isSetObject(example) &&
              "value" in example &&
              isSetString(example.value)
            ? {
                name: `example-${i + 1}`,
                description:
                  (example as { description?: string }).description ||
                  `Example Specification #${i + 1}`,

                value: example.value
              }
            : undefined
      )
      .filter(Boolean) as SchemaMetaExample<TSpec>[];

  const value = input ?? meta.examples ?? schema?.examples ?? [];

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
export function resolveMetaLinks(
  schema: JsonSchema,
  meta: Partial<MetaConfig>,
  input?: MetaLink[]
): MetaLink[] {
  return getUnique(
    toArray(input)
      .concat(meta.links ?? [])
      .concat(schema?.docs ?? [])
  );
}

/**
 * Extracts and normalizes metadata for a specification based on the provided schema and optional configuration.
 *
 * @param schema - The schema that the specification is expected to conform to.
 * @param config - Optional metadata configuration to extract and normalize.
 * @returns The normalized specification metadata.
 */
export function resolveMeta<TSpec>(
  schema: ExtractedSchemaEnvelope<TSpec> | SchemaOf<TSpec>,
  config?: MetaConfig
): MetaConfig {
  const extractedSchema = isSchemaOf<TSpec>(schema)
    ? schema
    : (schema ?? ({ schema: {} } as ExtractedSchemaEnvelope<TSpec>));
  const meta = {} as MetaConfig;

  meta.name = resolveMetaName(extractedSchema.schema, meta, config?.name);
  meta.version = resolveMetaVersion(
    extractedSchema?.schema,
    meta,
    config?.version
  );
  meta.title = resolveMetaTitle(extractedSchema?.schema, meta, config?.title);
  meta.links = resolveMetaLinks(extractedSchema?.schema, meta, config?.links);

  if (config?.deprecated) {
    meta.deprecated = config?.deprecated;
  }
  if (config?.usage) {
    meta.usage = config?.usage;
  }
  if (config?.tags) {
    meta.tags = config?.tags;
  }

  return meta;
}
