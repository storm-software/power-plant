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
  OutputConfig,
  SchemaConfigObject,
  UserConfig
} from "@power-plant/core";
import { createExecute } from "@power-plant/core";
import type { SchemaSourceConfig } from "@power-plant/schema";
import {
  resolveChildInput,
  resolveChildOutput,
  resolveChildSchema,
  resolveGeneratorFunction,
  resolveInputValue,
  resolveOutputFunction,
  resolveSchemaOverride,
  unwrapSchemaSource
} from "./helpers";
import type {
  AnyGeneratorConfig,
  CombinedGeneratorConfig,
  CombinedOptions,
  CombinedReturns,
  CombinedSpec
} from "./types";

function buildCombinedSchema<
  TGenerators extends Record<string, AnyGeneratorConfig>
>(
  generators: TGenerators,
  schemaOverride?: CombinedGeneratorConfig<TGenerators>["schema"]
): SchemaConfigObject<CombinedSpec<TGenerators>> {
  if (schemaOverride !== undefined) {
    return resolveSchemaOverride<CombinedSpec<TGenerators>>(schemaOverride);
  }

  const properties: Record<string, SchemaSourceConfig | { type: "any" }> = {};

  for (const [key, config] of Object.entries(generators)) {
    properties[key] = unwrapSchemaSource(resolveChildSchema(config));
  }

  return {
    schema: {
      type: "object",
      properties,
      required: Object.keys(properties),
      additionalProperties: false
    }
  };
}

function buildCombinedInput<
  TGenerators extends Record<string, AnyGeneratorConfig>
>(
  generators: TGenerators,
  inputOverride?: CombinedGeneratorConfig<TGenerators>["input"]
): InputConfig<CombinedSpec<TGenerators>, CombinedOptions<TGenerators>> {
  if (inputOverride !== undefined) {
    return inputOverride;
  }

  return async (options: CombinedOptions<TGenerators>) => {
    const spec = {} as CombinedSpec<TGenerators>;

    for (const key of Object.keys(generators) as (keyof TGenerators &
      string)[]) {
      const childInput = resolveChildInput(generators[key]!);
      spec[key] = (await resolveInputValue(
        childInput,
        options,
        "combine",
        key
      )) as CombinedSpec<TGenerators>[typeof key];
    }

    return spec;
  };
}

function buildCombinedOutput<
  TGenerators extends Record<string, AnyGeneratorConfig>
>(
  generators: TGenerators,
  outputOverride?: CombinedGeneratorConfig<TGenerators>["output"]
): OutputConfig<
  CombinedSpec<TGenerators>,
  CombinedOptions<TGenerators>,
  CombinedReturns<TGenerators>
> {
  if (outputOverride !== undefined) {
    return outputOverride;
  }

  return async (
    spec: CombinedSpec<TGenerators>,
    options: CombinedOptions<TGenerators>,
    documents: Record<string, GeneratedDocument>
  ) => {
    const returns = {} as CombinedReturns<TGenerators>;

    for (const key of Object.keys(generators) as (keyof TGenerators &
      string)[]) {
      const outputFn = resolveOutputFunction<
        CombinedSpec<TGenerators>[typeof key],
        CombinedOptions<TGenerators>,
        CombinedReturns<TGenerators>[typeof key]
      >(
        resolveChildOutput(generators[key]!) as
          OutputConfig<any, any, any> | undefined,
        "combine",
        key
      );

      returns[key] = await outputFn(spec[key], options, documents);
    }

    return returns;
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

  return {
    meta,
    schema: buildCombinedSchema(generators, schema),
    input: buildCombinedInput(generators, input),
    output: buildCombinedOutput(generators, output),
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
