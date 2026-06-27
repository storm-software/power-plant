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
import type {
  InferCreateSourceOptions,
  Source,
  SourceFunction,
  SourceInput,
  SourceInputObject
} from "../types/source";
import { isSourceInputObject } from "./helpers";

export function extractSourceMeta<TSpec>(
  schema: ExtractedSchema<TSpec>,
  input?: MetaInput<TSpec>
): Meta<TSpec> {
  const meta = extractMeta(schema, input);
  meta.description = resolveMetaDescription(
    `Determines the ${schema?.meta?.displayName ? `${schema?.meta?.displayName} ` : ""}specification from a {displayName} source.`,
    schema?.schema ?? ({} as ExtractedSchema<TSpec>["schema"]),
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
  schema: SchemaOf<TSpec>,
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

  let resolvedSchema: SchemaOf<TSpec> = schema;
  if (inputSchema) {
    resolvedSchema = await extract<TSpec>(inputSchema, options);
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
    meta: extractSourceMeta<TSpec>(
      resolvedSchema as ExtractedSchema<TSpec>,
      meta
    )
  };
}
