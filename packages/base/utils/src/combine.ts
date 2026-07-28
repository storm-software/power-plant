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
  GeneratedDocument,
  GeneratorConfigObject,
  GeneratorFunction,
  InputConfig,
  InputConfigObject,
  OutputConfig,
  OutputConfigObject,
  UserConfig
} from "@power-plant/core";
import { createExecute } from "@power-plant/core";
import type { SchemaSourceConfig } from "@power-plant/schema";
import {
  resolveChildInput,
  resolveChildOutput,
  resolveGeneratorFunction,
  resolveInputValue,
  resolveOutputFunction,
  resolveSchemaOverride,
  unwrapInputSchemaSource,
  unwrapOutputSchemaSource
} from "./helpers";

import type {
  AnyGeneratorConfig,
  CombinedGeneratorConfig,
  CombinedOptions,
  CombinedReturns,
  CombinedSpec
} from "./types";

/**
 * Combines a map of bare input configs into one keyed {@link InputConfigObject}.
 *
 * @remarks
 * Missing (`undefined`) entries are skipped. An empty map yields a noop input
 * that resolves to `{}`. Child schemas are merged into an object schema keyed
 * the same way; children without a schema use `JSON_SCHEMA_ANY`.
 */
export function combineInputs<
  TSpec extends Record<string, any>,
  TOptions extends object = object
>(inputs: {
  [K in keyof TSpec]: InputConfig<TSpec[K], TOptions> | undefined;
}): InputConfigObject<TSpec, TOptions> {
  const properties: Record<string, SchemaSourceConfig> = {};

  for (const [key, input] of Object.entries(inputs)) {
    if (input === undefined) {
      continue;
    }

    properties[key] = unwrapInputSchemaSource(input);
  }

  const propertyKeys = Object.keys(properties);

  return {
    schema: {
      type: "object",
      properties,
      required: propertyKeys,
      additionalProperties: false
    },
    input: async options => {
      const spec = {} as TSpec;

      for (const key of Object.keys(inputs) as (keyof TSpec & string)[]) {
        const input = inputs[key];
        if (input === undefined) {
          continue;
        }

        spec[key] = await resolveInputValue(input, options, "combine", key);
      }

      return spec;
    }
  };
}

/**
 * Combines a map of bare output configs into one keyed {@link OutputConfigObject}.
 *
 * @remarks
 * An empty map yields a noop output that resolves to `{}`. Each child receives
 * its own keyed slice of the joined spec. Child schemas are merged into an
 * object schema keyed the same way.
 */
export function combineOutputs<
  TSpec extends Record<string, any>,
  TOptions extends object = object,
  TReturns extends { [K in keyof TSpec]: any } = {
    [K in keyof TSpec]: void;
  }
>(outputs: {
  [K in keyof TSpec]: OutputConfig<TSpec[K], TOptions, TReturns[K]> | undefined;
}): OutputConfigObject<TSpec, TOptions, TReturns> {
  const properties: Record<string, SchemaSourceConfig> = {};

  for (const [key, output] of Object.entries(outputs)) {
    properties[key] = unwrapOutputSchemaSource(output);
  }

  const propertyKeys = Object.keys(properties);

  return {
    schema: {
      type: "object",
      properties,
      required: propertyKeys,
      additionalProperties: false
    },
    output: async (spec, options, documents) => {
      const returns = {} as TReturns;

      for (const key of Object.keys(outputs) as (keyof TSpec & string)[]) {
        const outputFn = resolveOutputFunction<
          TSpec[typeof key],
          TOptions,
          TReturns[typeof key]
        >(outputs[key], "combine", key);

        returns[key] = await outputFn(spec[key], options, documents);
      }

      return returns;
    }
  };
}

function buildCombinedGenerator<
  TGenerators extends Record<string, AnyGeneratorConfig>
>(
  generators: TGenerators
): GeneratorFunction<CombinedSpec<TGenerators>, CombinedOptions<TGenerators>> {
  return async (spec, options) => {
    const documents: Record<string, GeneratedDocument> = {};

    for (const key of Object.keys(generators) as (keyof TGenerators &
      string)[]) {
      const generatorFn = resolveGeneratorFunction<
        CombinedSpec<TGenerators>[typeof key],
        CombinedOptions<TGenerators>
      >(generators[key]!, "combine", key);

      const childDocuments = await generatorFn(spec[key], options);
      Object.assign(documents, childDocuments);
    }

    return documents;
  };
}

function toExecutableConfig<
  TGenerators extends Record<string, AnyGeneratorConfig>
>(
  config: CombinedGeneratorConfig<TGenerators>
): GeneratorConfigObject<
  CombinedSpec<TGenerators>,
  CombinedOptions<TGenerators>,
  CombinedReturns<TGenerators>
> {
  const { generator: generators, meta, schema, input, output } = config;

  const childInputs = {} as {
    [K in keyof CombinedSpec<TGenerators>]:
      | InputConfig<CombinedSpec<TGenerators>[K], CombinedOptions<TGenerators>>
      | undefined;
  };
  const childOutputs = {} as {
    [K in keyof CombinedSpec<TGenerators>]:
      | OutputConfig<
          CombinedSpec<TGenerators>[K],
          CombinedOptions<TGenerators>,
          CombinedReturns<TGenerators>[K]
        >
      | undefined;
  };

  for (const key of Object.keys(generators) as (keyof TGenerators & string)[]) {
    childInputs[key] = resolveChildInput(generators[key]!) as
      | InputConfig<
          CombinedSpec<TGenerators>[typeof key],
          CombinedOptions<TGenerators>
        >
      | undefined;
    childOutputs[key] = resolveChildOutput(generators[key]!) as
      | OutputConfig<
          CombinedSpec<TGenerators>[typeof key],
          CombinedOptions<TGenerators>,
          CombinedReturns<TGenerators>[typeof key]
        >
      | undefined;
  }

  return {
    meta,
    schema:
      schema !== undefined
        ? resolveSchemaOverride<CombinedSpec<TGenerators>>(schema)
        : undefined,
    input:
      input ??
      combineInputs<CombinedSpec<TGenerators>, CombinedOptions<TGenerators>>(
        childInputs
      ),
    output:
      output ??
      combineOutputs<
        CombinedSpec<TGenerators>,
        CombinedOptions<TGenerators>,
        CombinedReturns<TGenerators>
      >(childOutputs),
    generator: buildCombinedGenerator(generators)
  };
}

/**
 * Combines multiple generator configs into one execution with a joined spec.
 *
 * @remarks
 * `config.generator` is a string-keyed map of child generator configs.
 * Spec / schema / input / output shapes are joined by those same keys
 * (e.g. `{ typescript: TsSpec; python: PySpec }`). Child generators run in
 * key order; documents are merged; returns are keyed the same way.
 *
 * @example
 * ```ts
 * import { defineGenerator } from "@power-plant/core";
 * import { combine } from "@power-plant/utils";
 *
 * const result = await combine({
 *   generator: {
 *     typescript: defineGenerator({
 *       schema: z.object({ name: z.string() }),
 *       input: { name: "User" },
 *       generator: (spec) => ({ ... }),
 *     }),
 *     python: defineGenerator({
 *       schema: z.object({ module: z.string() }),
 *       input: { module: "User" },
 *       generator: (spec) => ({ ... }),
 *     }),
 *   },
 * });
 * // result: { typescript: ..., python: ... }
 * ```
 *
 * @param config - Combined generator configuration.
 * @param options - Options shared by every child generator.
 * @returns Joined returns keyed by generator name.
 */
export async function combine<
  TGenerators extends Record<string, AnyGeneratorConfig>
>(
  config: CombinedGeneratorConfig<TGenerators>,
  options: UserConfig & CombinedOptions<TGenerators> = {} as UserConfig &
    CombinedOptions<TGenerators>
): Promise<CombinedReturns<TGenerators>> {
  const execute = await createExecute(options);
  const executable = toExecutableConfig(config);

  return execute(executable, options);
}
