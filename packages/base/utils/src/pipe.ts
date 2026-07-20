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
  PipeGeneratorConfig,
  PipeOptions,
  PipeReturns,
  PipeSpec
} from "./types";

function buildPipeSchema<TGenerators extends AnyGeneratorConfig[]>(
  generators: TGenerators,
  schemaOverride?: PipeGeneratorConfig<TGenerators>["schema"]
): SchemaConfigObject<PipeSpec<TGenerators>> {
  if (schemaOverride !== undefined) {
    return resolveSchemaOverride<PipeSpec<TGenerators>>(schemaOverride);
  }

  const prefixItems = generators.map(config =>
    unwrapSchemaSource(resolveChildSchema(config))
  );

  return {
    schema: {
      type: "array",
      prefixItems,
      items: false,
      minItems: prefixItems.length,
      maxItems: prefixItems.length
    }
  };
}

function buildPipeInput<TGenerators extends AnyGeneratorConfig[]>(
  generators: TGenerators,
  inputOverride?: PipeGeneratorConfig<TGenerators>["input"]
): InputConfig<PipeSpec<TGenerators>, PipeOptions<TGenerators>> {
  if (inputOverride !== undefined) {
    return inputOverride;
  }

  return async (options: PipeOptions<TGenerators>) => {
    const spec = [] as unknown as PipeSpec<TGenerators>;

    for (let index = 0; index < generators.length; index++) {
      const childInput = resolveChildInput(generators[index]!);
      (spec as unknown[])[index] = await resolveInputValue(
        childInput,
        options,
        "pipe",
        index
      );
    }

    return spec;
  };
}

function buildPipeOutput<TGenerators extends AnyGeneratorConfig[]>(
  generators: TGenerators,
  outputOverride?: PipeGeneratorConfig<TGenerators>["output"]
): OutputConfig<
  PipeSpec<TGenerators>,
  PipeOptions<TGenerators>,
  PipeReturns<TGenerators>
> {
  if (outputOverride !== undefined) {
    return outputOverride;
  }

  return async (
    spec: PipeSpec<TGenerators>,
    options: PipeOptions<TGenerators>,
    documents: Record<string, GeneratedDocument>
  ) => {
    if (generators.length === 0) {
      return undefined as PipeReturns<TGenerators>;
    }

    const lastIndex = generators.length - 1;
    const lastSpec = (spec as unknown[])[
      lastIndex
    ] as PipeSpec<TGenerators>[number];
    const outputFn = resolveOutputFunction<
      typeof lastSpec,
      PipeOptions<TGenerators>,
      PipeReturns<TGenerators>
    >(
      resolveChildOutput(generators[lastIndex]!) as
        OutputConfig<any, any, any> | undefined,
      "pipe",
      lastIndex
    );

    return outputFn(lastSpec, options, documents);
  };
}

function buildPipeGenerator<TGenerators extends AnyGeneratorConfig[]>(
  generators: TGenerators
): GeneratorFunction<PipeSpec<TGenerators>, PipeOptions<TGenerators>> {
  return async (spec, options) => {
    const documents: Record<string, GeneratedDocument> = {};

    for (let index = 0; index < generators.length; index++) {
      const generatorFn = resolveGeneratorFunction<
        PipeSpec<TGenerators>[number],
        PipeOptions<TGenerators>
      >(generators[index]!, "pipe", index);

      const childDocuments = await generatorFn(
        (spec as unknown[])[index] as PipeSpec<TGenerators>[number],
        options
      );
      Object.assign(documents, childDocuments);
    }

    return documents;
  };
}

function toExecutableConfig<TGenerators extends AnyGeneratorConfig[]>(
  config: PipeGeneratorConfig<TGenerators>
): GeneratorConfigObject<
  PipeSpec<TGenerators>,
  PipeOptions<TGenerators>,
  PipeReturns<TGenerators>
> {
  const { generator, meta, schema, input, output } = config;
  const generators = generator as TGenerators;

  return {
    meta,
    schema: buildPipeSchema(generators, schema),
    input: buildPipeInput(generators, input),
    output: buildPipeOutput(generators, output),
    generator: buildPipeGenerator(generators)
  };
}

/**
 * Pipes multiple generator configs into one sequential execution.
 *
 * @remarks
 * `config.generator` is an ordered array of child generator configs.
 * Spec / schema / input shapes are a tuple aligned with that array.
 * Child generators run in array order; documents are merged; returns come
 * from the last generator only.
 *
 * @example
 * ```ts
 * import { defineGenerator } from "@power-plant/core";
 * import { pipe } from "@power-plant/utils";
 *
 * const result = await pipe({
 *   generator: [
 *     defineGenerator({
 *       schema: z.object({ name: z.string() }),
 *       input: { name: "User" },
 *       generator: (spec) => ({ ... }),
 *     }),
 *     defineGenerator({
 *       schema: z.object({ module: z.string() }),
 *       input: { module: "User" },
 *       generator: (spec) => ({ ... }),
 *     }),
 *   ],
 * });
 * // result: returns from the last generator only
 * ```
 *
 * @param config - Pipe generator configuration.
 * @param options - Options shared by every child generator.
 * @returns Returns from the last generator in the array.
 */
export async function pipe<TGenerators extends AnyGeneratorConfig[]>(
  config: PipeGeneratorConfig<TGenerators>,
  options: UserConfig & PipeOptions<TGenerators> = {} as UserConfig &
    PipeOptions<TGenerators>
): Promise<PipeReturns<TGenerators>> {
  const execute = await createExecute(options);
  const executable = toExecutableConfig(config);

  return execute(executable, options);
}
