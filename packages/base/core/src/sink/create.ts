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

import { extract } from "@power-plant/schema/extract";
import { mergeMetadata } from "@power-plant/schema/helpers";
import { resolveMetaDescription } from "@power-plant/schema/metadata";
import type {
  ExtractedSchema,
  Meta,
  MetaInput,
  SchemaOf
} from "@power-plant/schema/types";
import { load } from "@stryke/resolve/load";
import { isLoadInput } from "@stryke/resolve/type-checks";
import { extractMeta } from "../helpers/metadata";
import type { SinkFunction, SinkInputObject } from "../types";
import type { InferCreateSinkOptions, Sink, SinkInput } from "../types/sink";
import { isSinkInputObject } from "./helpers";

export function extractSinkMeta<TSpec>(
  schema: ExtractedSchema<TSpec>,
  input?: MetaInput<TSpec>
): Meta<TSpec> {
  const meta = extractMeta(schema, input);
  meta.description = resolveMetaDescription(
    `Accepts a ${schema?.meta?.title ? `${schema?.meta?.title} ` : ""}specification and processes it with a {title} sink.`,
    schema?.schema ?? {},
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
  schema: SchemaOf<TSpec>,
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

  let resolvedSchema: SchemaOf<TSpec> = schema;
  if (inputSchema) {
    resolvedSchema = await extract<TSpec>(inputSchema, options);
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
    meta: extractSinkMeta<TSpec>(resolvedSchema as ExtractedSchema<TSpec>, meta)
  };
}
