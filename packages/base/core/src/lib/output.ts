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
  ExtractedSchemaEnvelope,
  SchemaEnvelopeOf,
  SchemaSourceConfig
} from "@power-plant/schema";
import { mergeMetadata } from "@power-plant/schema";
import { load } from "@stryke/resolve/load";
import { isLoadReference } from "@stryke/resolve/type-checks";
import { resolveMeta, resolveMetaDescription } from "../helpers/meta";
import { isOutputConfigObject } from "../helpers/type-checks";
import type {
  InferCreateOutputOptions,
  MetaConfig,
  Output,
  OutputConfig,
  OutputConfigObject,
  OutputFunction,
  SchemaConfigObject,
  SchemaOf
} from "../types";
import { createSchema } from "./schema";

/**
 * Extracts and normalizes output metadata from a given configuration. This function ensures that the metadata is in a consistent format, converting version numbers to strings and filtering out any invalid or empty tags.
 *
 * @param schema - The schema that the specification is expected to conform to.
 * @param config - The output metadata config to extract and normalize.
 * @returns The normalized output metadata.
 */
export function extractOutputMeta<TSpec>(
  schema: ExtractedSchemaEnvelope<TSpec> | SchemaOf<TSpec>,
  config?: MetaConfig
): MetaConfig {
  const jsonSchema = schema?.schema ?? {};
  const meta = resolveMeta(schema, config);

  meta.description = resolveMetaDescription(
    `Accepts a ${meta.title ?? ""} specification and processes it with a {title} output.`,
    jsonSchema,
    meta,
    config?.description
  );

  return meta;
}

/**
 * Normalizes any accepted output config into a concrete output descriptor.
 *
 * @param schema - The schema that the output config is expected to conform to.
 * @param config - The output config to normalize.
 * @param options - Optional options for resolving the output config.
 * @returns A promise that resolves to a normalized output descriptor.
 */
export async function createOutput<
  TSpec,
  TOptions extends object,
  TReturns = void
>(
  schema: SchemaOf<TSpec>,
  config: OutputConfig<TSpec, TOptions, TReturns>,
  options: InferCreateOutputOptions<typeof config> = {}
): Promise<Output<TSpec, TOptions, TReturns>> {
  const {
    output,
    meta,
    schema: configSchema
  } = isOutputConfigObject<TSpec, TOptions, TReturns>(config)
    ? config
    : { output: config, meta: {} };

  let resolvedSchema: SchemaOf<TSpec> = schema;
  if (configSchema) {
    let resolvedConfigSchema:
      | SchemaSourceConfig<TSpec>
      | SchemaEnvelopeOf<TSpec>
      | SchemaConfigObject<TSpec>
      | undefined;

    if (isLoadReference(configSchema)) {
      try {
        resolvedConfigSchema = await load<
          | SchemaSourceConfig<TSpec>
          | SchemaEnvelopeOf<TSpec>
          | SchemaConfigObject<TSpec>
        >(configSchema, options);
      } catch {
        // Do nothing
      }
    } else {
      resolvedConfigSchema = configSchema;
    }

    if (resolvedConfigSchema) {
      resolvedSchema = await createSchema<TSpec>(resolvedConfigSchema, options);
      resolvedSchema.schema = mergeMetadata<TSpec>(
        resolvedSchema.schema,
        schema.schema
      );
    }
  }

  let resolvedOutput!: OutputFunction<TSpec, TOptions, TReturns>;
  if (isLoadReference(output)) {
    try {
      const loaded = await load<
        | OutputFunction<TSpec, TOptions, TReturns>
        | OutputConfigObject<TSpec, TOptions, TReturns>
      >(output, options);

      if (isOutputConfigObject<TSpec, TOptions, TReturns>(loaded)) {
        resolvedOutput = await createOutput<TSpec, TOptions, TReturns>(
          resolvedSchema,
          loaded.output,
          options
        ).then(s => s.output);
      } else {
        resolvedOutput = loaded;
      }
    } catch {
      // Do nothing
    }
  }

  if (!resolvedOutput) {
    resolvedOutput = output as OutputFunction<TSpec, TOptions, TReturns>;
  }

  return {
    schema: resolvedSchema,
    output: resolvedOutput,
    meta: extractOutputMeta<TSpec>(resolvedSchema, meta)
  };
}
