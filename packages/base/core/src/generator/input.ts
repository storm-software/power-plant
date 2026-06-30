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

import type { ExtractedSchemaEnvelope } from "@power-plant/schema";
import { mergeMetadata } from "@power-plant/schema";
import { load } from "@stryke/resolve/load";
import { isLoadReference } from "@stryke/resolve/type-checks";
import { isFunction } from "@stryke/type-checks/is-function";
import { extractMeta, resolveMetaDescription } from "../helpers/meta";
import { isInputConfigObject } from "../helpers/type-checks";
import type { InputConfigObject } from "../types";
import type {
  InferCreateInputOptions,
  Input,
  InputConfig,
  InputFunction,
  InputMeta,
  InputMetaConfig
} from "../types/input";
import type { SchemaOf } from "../types/schema";
import { createSchema } from "./schema";

/**
 * Extracts and normalizes {@link InputMeta | input metadata} from a given {@link InputMetaConfig}. This function ensures that the metadata is in a consistent format, converting version numbers to strings and filtering out any invalid or empty tags.
 *
 * @param schema - The schema that the input input is expected to conform to.
 * @param input - The input metadata input to extract and normalize.
 * @returns The normalized input metadata.
 */
export function extractInputMeta<TSpec, TOptions extends object>(
  schema: ExtractedSchemaEnvelope<TSpec> | SchemaOf<TSpec, TOptions>,
  input?: InputMetaConfig<TSpec, TOptions>
): InputMeta<TSpec, TOptions> {
  const jsonSchema = schema?.schema ?? {};
  const meta = extractMeta<TSpec, TOptions>(schema, input) as InputMeta<
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

          return `Determines the ${title ?? ""} specification from a {title} input.`;
        }
      : `Determines the ${meta.title ?? ""} specification from a {title} input.`,
    jsonSchema,
    meta,
    input?.description
  );

  return meta;
}

/**
 * Normalizes any accepted input configuration into a concrete input descriptor.
 *
 * @param schema - The schema that the specification is expected to conform to.
 * @param config - The input configuration to normalize.
 * @param options - Optional options for resolving the input configuration.
 * @returns A promise that resolves to a normalized input descriptor.
 */
export async function createInput<TSpec, TOptions extends object>(
  schema: SchemaOf<TSpec, TOptions>,
  config: InputConfig<TSpec, TOptions>,
  options: InferCreateInputOptions<typeof config> = {}
): Promise<Input<TSpec, TOptions>> {
  const {
    input,
    meta,
    schema: inputSchema
  } = isInputConfigObject<TSpec, TOptions>(config)
    ? config
    : { input: config, meta: {} };

  let resolvedSchema: SchemaOf<TSpec, TOptions> = schema;
  if (inputSchema) {
    resolvedSchema = await createSchema<TSpec, TOptions>(inputSchema, options);
    resolvedSchema.schema = mergeMetadata<TSpec>(
      resolvedSchema.schema,
      schema.schema
    );
  }

  let resolvedInput!: InputFunction<TSpec, TOptions> | TSpec;
  if (isLoadReference(input)) {
    try {
      const loaded = await load<
        | InputFunction<TSpec, TOptions>
        | TSpec
        | InputConfigObject<TSpec, TOptions>
      >(input, options);

      if (isInputConfigObject<TSpec, TOptions>(loaded)) {
        resolvedInput = await createInput<TSpec, TOptions>(
          resolvedSchema,
          loaded.input,
          options
        ).then(s => s.input);
      } else {
        resolvedInput = loaded;
      }
    } catch {
      // Do nothing
    }
  }

  if (!resolvedInput) {
    resolvedInput = input as InputFunction<TSpec, TOptions> | TSpec;
  }

  return {
    schema: resolvedSchema,
    input: resolvedInput,
    meta: extractInputMeta<TSpec, TOptions>(resolvedSchema, meta)
  };
}
