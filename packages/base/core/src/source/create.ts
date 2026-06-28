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

import { mergeMetadata } from "@power-plant/schema/helpers";
import type { ExtractedSchemaEnvelope } from "@power-plant/schema/types";
import { load } from "@stryke/resolve/load";
import { isLoadInput } from "@stryke/resolve/type-checks";
import { isFunction } from "@stryke/type-checks/is-function";
import { extractMeta, resolveMetaDescription } from "../meta/extract";
import { createSchema } from "../schema/create";
import type { SourceFunction, SourceInputObject } from "../types";
import type { SchemaOf } from "../types/schema";
import type {
  InferCreateSourceOptions,
  Source,
  SourceInput,
  SourceMeta,
  SourceMetaInput
} from "../types/source";
import { isSourceInputObject } from "./helpers";

/**
 * Extracts and normalizes {@link SourceMeta | source metadata} from a given {@link SourceMetaInput}. This function ensures that the metadata is in a consistent format, converting version numbers to strings and filtering out any invalid or empty tags.
 *
 * @param schema - The schema that the source input is expected to conform to.
 * @param input - The source metadata input to extract and normalize.
 * @returns The normalized source metadata.
 */
export function extractSourceMeta<TSpec, TOptions extends object>(
  schema: ExtractedSchemaEnvelope<TSpec> | SchemaOf<TSpec, TOptions>,
  input?: SourceMetaInput<TSpec, TOptions>
): SourceMeta<TSpec, TOptions> {
  const jsonSchema = schema?.schema ?? {};
  const meta = extractMeta<TSpec, TOptions>(schema, input) as SourceMeta<
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

          return `Determines the ${title ?? ""} specification from a {title} source.`;
        }
      : `Determines the ${meta.title ?? ""} specification from a {title} source.`,
    jsonSchema,
    meta,
    input?.description
  );

  return meta;
}

/**
 * Normalizes any accepted source input into a concrete source descriptor.
 *
 * @param schema - The schema that the source input is expected to conform to.
 * @param input - The source input to normalize.
 * @param options - Optional options for resolving the source input.
 * @returns A promise that resolves to a normalized source descriptor.
 */
export async function createSource<TSpec, TOptions extends object>(
  schema: SchemaOf<TSpec, TOptions>,
  input: SourceInput<TSpec, TOptions>,
  options: InferCreateSourceOptions<typeof input> = {}
): Promise<Source<TSpec, TOptions>> {
  const {
    source,
    meta,
    schema: inputSchema
  } = isSourceInputObject<TSpec, TOptions>(input)
    ? input
    : { source: input, meta: {} };

  let resolvedSchema: SchemaOf<TSpec, TOptions> = schema;
  if (inputSchema) {
    resolvedSchema = await createSchema<TSpec, TOptions>(inputSchema, options);
    resolvedSchema.schema = mergeMetadata<TSpec>(
      resolvedSchema.schema,
      schema.schema
    );
  }

  let resolvedSource!: SourceFunction<TSpec, TOptions> | TSpec;
  if (isLoadInput(source)) {
    try {
      const loaded = await load<
        | SourceFunction<TSpec, TOptions>
        | TSpec
        | SourceInputObject<TSpec, TOptions>
      >(source, options);

      if (isSourceInputObject<TSpec, TOptions>(loaded)) {
        resolvedSource = await createSource<TSpec, TOptions>(
          resolvedSchema,
          loaded.source,
          options
        ).then(s => s.source);
      } else {
        resolvedSource = loaded;
      }
    } catch {
      // Do nothing
    }
  }

  if (!resolvedSource) {
    resolvedSource = source as SourceFunction<TSpec, TOptions> | TSpec;
  }

  return {
    schema: resolvedSchema,
    source: resolvedSource,
    meta: extractSourceMeta<TSpec, TOptions>(resolvedSchema, meta)
  };
}
