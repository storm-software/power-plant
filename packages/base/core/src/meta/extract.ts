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

import { stringifyType } from "@power-plant/schema/codegen";
import { isSchemaOf } from "@power-plant/schema/type-checks";
import type {
  ExtractedSchemaEnvelope,
  JsonSchema
} from "@power-plant/schema/types";
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
import type { Meta, MetaInput, MetaLink, MetaValue } from "../types/meta";
import type { SchemaMeta, SchemaMetaExample, SchemaOf } from "../types/schema";

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
export function resolveMetaVersion<TSpec, TOptions extends object>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec, TOptions>>,
  input?: MetaValue<TSpec, TOptions, string | number | Date>
): MetaValue<TSpec, TOptions, string> {
  const value = input ?? meta?.version ?? schema?.version;
  if (isFunction(value)) {
    return async (spec: TSpec, options: TOptions) =>
      formatMetaVersion(await Promise.resolve(value(spec, options)));
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
export function resolveMetaName<TSpec, TOptions extends object>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec, TOptions>>,
  input?: MetaValue<TSpec, TOptions, string>
): MetaValue<TSpec, TOptions, string> {
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
export function resolveMetaId<TSpec, TOptions extends object>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec, TOptions>>
): MetaValue<TSpec, TOptions, string> {
  const name = resolveMetaName<TSpec, TOptions>(schema, meta);
  const version = resolveMetaVersion<TSpec, TOptions>(schema, meta);

  return name
    ? isFunction(name)
      ? isFunction(version)
        ? async (spec: TSpec, options: TOptions) =>
            `${kebabCase(await Promise.resolve(name(spec, options)))}@${await Promise.resolve(version(spec, options))}`
        : async (spec: TSpec, options: TOptions) =>
            `${kebabCase(await Promise.resolve(name(spec, options)))}@${version}`
      : isFunction(version)
        ? async (spec: TSpec, options: TOptions) =>
            `${kebabCase(name)}@${await Promise.resolve(version(spec, options))}`
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
export function resolveMetaTitle<TSpec, TOptions extends object>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec, TOptions>>,
  input?: MetaValue<TSpec, TOptions, string>
): MetaValue<TSpec, TOptions, string> {
  const value = input ?? meta.title ?? schema?.title;
  if (value !== undefined) {
    return value;
  }

  const name = meta.name;
  if (isFunction(name)) {
    return async (spec: TSpec, options: TOptions) => {
      return titleCase(await Promise.resolve(name(spec, options)));
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
export function resolveMetaDescription<TSpec, TOptions extends object>(
  template: MetaValue<TSpec, TOptions, string>,
  schema: JsonSchema,
  meta: Partial<Meta<TSpec, TOptions>>,
  input?: MetaValue<TSpec, TOptions, string>
): MetaValue<TSpec, TOptions, string> {
  meta.title ??= resolveMetaTitle<TSpec, TOptions>(schema, meta);

  const title = meta.title;
  const defaultDescription: Meta<TSpec, TOptions>["description"] = isFunction(
    title
  )
    ? async (spec: TSpec, options: TOptions) => {
        return isFunction(template)
          ? (await Promise.resolve(template(spec, options))).replaceAll(
              /\{\s*title\s*\}/g,
              await Promise.resolve(title(spec, options))
            )
          : template.replaceAll(
              /\{\s*title\s*\}/g,
              await Promise.resolve(title(spec, options))
            );
      }
    : isFunction(template)
      ? async (spec: TSpec, options: TOptions) =>
          (await Promise.resolve(template(spec, options))).replaceAll(
            /\{\s*title\s*\}/g,
            await Promise.resolve(title)
          )
      : template.replaceAll(/\{\s*title\s*\}/g, title);

  const resolved = input ?? meta.description ?? schema?.description;
  if (isFunction(resolved)) {
    const descriptionFn = resolved;

    return async (spec: TSpec, options: TOptions) => {
      const description = await Promise.resolve(descriptionFn(spec, options));
      if (isSetString(description)) {
        return description;
      }

      return isFunction(defaultDescription)
        ? Promise.resolve(defaultDescription(spec, options))
        : Promise.resolve(defaultDescription);
    };
  }

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
export function resolveMetaExample<TSpec, TOptions extends object>(
  schema: JsonSchema,
  meta: Partial<SchemaMeta<TSpec, TOptions>>,
  input?:
    | SchemaMetaExample<TSpec>
    | MetaValue<TSpec, TOptions, SchemaMetaExample<TSpec>[]>
): MetaValue<TSpec, TOptions, SchemaMetaExample<TSpec>[]> {
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
  if (isFunction(value)) {
    return async (spec: TSpec, options: TOptions) =>
      normalizeExamples(toArray(await Promise.resolve(value(spec, options))));
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
export function resolveMetaLinks<TSpec, TOptions extends object>(
  schema: JsonSchema,
  meta: Partial<Meta<TSpec, TOptions>>,
  input?: MetaValue<TSpec, TOptions, MetaLink[]>
): MetaValue<TSpec, TOptions, MetaLink[]> {
  return isFunction(input) || isFunction(meta.links)
    ? async (spec: TSpec, options: TOptions) =>
        getUnique(
          toArray(
            isFunction(input)
              ? await Promise.resolve(input(spec, options))
              : input
          )
            .concat(
              isFunction(meta.links)
                ? await Promise.resolve(meta.links(spec, options))
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

/**
 * Extracts and normalizes metadata for a source based on the provided schema and optional input.
 *
 * @param schema - The schema that the source is expected to conform to.
 * @param input - Optional metadata input to extract and normalize.
 * @returns The normalized source metadata.
 */
export function extractMeta<TSpec, TOptions extends object>(
  schema?: ExtractedSchemaEnvelope<TSpec> | SchemaOf<TSpec, TOptions>,
  input?: MetaInput<TSpec, TOptions>
): Meta<TSpec, TOptions> {
  const extractedSchema = isSchemaOf<TSpec>(schema)
    ? schema
    : (schema ?? ({ schema: {} } as ExtractedSchemaEnvelope<TSpec>));
  const meta = {} as Meta<TSpec, TOptions>;

  meta.name = resolveMetaName(extractedSchema?.schema, meta, input?.name);
  meta.version = resolveMetaVersion(
    extractedSchema?.schema,
    meta,
    input?.version
  );
  meta.id = resolveMetaId(extractedSchema?.schema, meta);
  meta.title = resolveMetaTitle(extractedSchema?.schema, meta, input?.title);
  meta.links = resolveMetaLinks(extractedSchema?.schema, meta, input?.links);

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
