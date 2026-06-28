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
import type { SinkFunction, SinkInputObject } from "../types";
import type { SchemaOf } from "../types/schema";
import type {
  InferCreateSinkOptions,
  Sink,
  SinkInput,
  SinkMeta,
  SinkMetaInput
} from "../types/sink";
import { isSinkInputObject } from "./helpers";

/**
 * Extracts and normalizes {@link SinkMeta | sink metadata} from a given {@link SinkMetaInput}. This function ensures that the metadata is in a consistent format, converting version numbers to strings and filtering out any invalid or empty tags.
 *
 * @param schema - The schema that the sink input is expected to conform to.
 * @param input - The sink metadata input to extract and normalize.
 * @returns The normalized sink metadata.
 */
export function extractSinkMeta<TSpec, TOptions extends object>(
  schema: ExtractedSchemaEnvelope<TSpec> | SchemaOf<TSpec, TOptions>,
  input?: SinkMetaInput<TSpec, TOptions>
): SinkMeta<TSpec, TOptions> {
  const jsonSchema = schema?.schema ?? {};
  const meta = extractMeta<TSpec, TOptions>(schema, input) as SinkMeta<
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

  return meta;
}

/**
 * Normalizes any accepted sink input into a concrete sink descriptor.
 *
 * @param schema - The schema that the sink input is expected to conform to.
 * @param input - The sink input to normalize.
 * @param options - Optional options for resolving the sink input.
 * @returns A promise that resolves to a normalized sink descriptor.
 */
export async function createSink<
  TSpec,
  TOptions extends object,
  TReturns = void
>(
  schema: SchemaOf<TSpec, TOptions>,
  input: SinkInput<TSpec, TOptions, TReturns>,
  options: InferCreateSinkOptions<typeof input> = {}
): Promise<Sink<TSpec, TOptions, TReturns>> {
  const {
    sink,
    meta,
    schema: inputSchema
  } = isSinkInputObject<TSpec, TOptions, TReturns>(input)
    ? input
    : { sink: input, meta: {} };

  let resolvedSchema: SchemaOf<TSpec, TOptions> = schema;
  if (inputSchema) {
    resolvedSchema = await createSchema<TSpec, TOptions>(inputSchema, options);
    resolvedSchema.schema = mergeMetadata<TSpec>(
      resolvedSchema.schema,
      schema.schema
    );
  }

  let resolvedSink!: SinkFunction<TSpec, TOptions, TReturns>;
  if (isLoadInput(sink)) {
    try {
      const loaded = await load<
        | SinkFunction<TSpec, TOptions, TReturns>
        | SinkInputObject<TSpec, TOptions, TReturns>
      >(sink, options);

      if (isSinkInputObject<TSpec, TOptions, TReturns>(loaded)) {
        resolvedSink = await createSink<TSpec, TOptions, TReturns>(
          resolvedSchema,
          loaded.sink,
          options
        ).then(s => s.sink);
      } else {
        resolvedSink = loaded;
      }
    } catch {
      // Do nothing
    }
  }

  if (!resolvedSink) {
    resolvedSink = sink as SinkFunction<TSpec, TOptions, TReturns>;
  }

  return {
    schema: resolvedSchema,
    sink: resolvedSink,
    meta: extractSinkMeta<TSpec, TOptions>(resolvedSchema, meta)
  };
}
