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

import { extractSchemaWithSource } from "@power-plant/schema/extract";
import type {
  ExtractedSchemaEnvelope,
  SchemaEnvelopeOf,
  SchemaSourceInput
} from "@power-plant/schema/types";
import { isFunction } from "@stryke/type-checks/is-function";
import {
  extractMeta,
  resolveMetaDescription,
  resolveMetaExample
} from "../meta/extract";
import type {
  InferCreateSchemaOptions,
  SchemaInputObject,
  SchemaMeta,
  SchemaMetaInput,
  SchemaOf
} from "../types/schema";
import { isSchemaInputObject } from "./helpers";

/**
 * Extracts and normalizes {@link SchemaMeta | schema metadata} from a given {@link SchemaMetaInput}. This function ensures that the metadata is in a consistent format, converting version numbers to strings and filtering out any invalid or empty tags.
 *
 * @param schema - The schema from which to extract metadata.
 * @param input - The schema metadata input to extract and normalize.
 * @returns The normalized schema metadata.
 */
export function extractSchemaMeta<TSpec, TOptions extends object>(
  schema: ExtractedSchemaEnvelope<TSpec>,
  input?: SchemaMetaInput<TSpec, TOptions>
): SchemaMeta<TSpec, TOptions> {
  const jsonSchema = schema?.schema ?? {};
  const meta = extractMeta<TSpec, TOptions>(schema, input) as SchemaMeta<
    TSpec,
    TOptions
  >;

  meta.description = resolveMetaDescription(
    isFunction(meta.title)
      ? async (spec: TSpec, options: TOptions) => {
          const title = await Promise.resolve(
            (meta.title as (spec: TSpec, options: TOptions) => string)(
              spec,
              options
            )
          );

          return `Accepts a ${title ?? ""} specification and processes it with a {title} sink.`;
        }
      : `Accepts a ${meta.title ?? ""} specification and processes it with a {title} sink.`,
    jsonSchema,
    meta,
    input?.description
  );
  meta.examples = resolveMetaExample(jsonSchema, meta, input?.examples);

  return meta;
}

/**
 * Normalizes any accepted schema input into a concrete schema descriptor.
 *
 * @param input - The schema input to normalize.
 * @param options - Optional options for resolving the schema input.
 * @returns A promise that resolves to a normalized schema descriptor.
 */
export async function createSchema<TSpec, TOptions extends object>(
  input:
    | SchemaSourceInput<TSpec>
    | SchemaEnvelopeOf<TSpec>
    | SchemaInputObject<TSpec, TOptions>,
  options: InferCreateSchemaOptions<typeof input> = {}
): Promise<SchemaOf<TSpec, TOptions>> {
  const { meta, schema } = isSchemaInputObject<TSpec, TOptions>(input)
    ? input
    : { schema: input, meta: {} };

  const resolvedSchema = await extractSchemaWithSource<TSpec>(schema, options);

  return {
    ...resolvedSchema,
    meta: extractSchemaMeta<TSpec, TOptions>(resolvedSchema, meta)
  };
}
