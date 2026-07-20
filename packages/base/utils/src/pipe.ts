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
  PipeGeneratorConfig,
  PipeOptions,
  PipeReturns,
  PipeSpec
} from "./types";

/**
 * Pipes an ordered list of bare input configs into one tuple {@link InputConfigObject}.
 *
 * @remarks
 * Missing (`undefined`) entries are skipped at resolve time (slot stays
 * `undefined`; array length preserved). An empty list yields a noop input that
 * resolves to `[]`. Child schemas become `prefixItems` aligned with the list.
 */
export function pipeInputs<
  TSpec extends any[],
  TOptions extends object = object
>(inputs: {
  [I in keyof TSpec]: InputConfig<TSpec[I], TOptions> | undefined;
}): InputConfigObject<TSpec, TOptions> {
  const prefixItems = (inputs as (InputConfig<any, any> | undefined)[]).map(
    input => unwrapInputSchemaSource(input)
  );

  return {
    schema: {
      type: "array",
      prefixItems,
      items: false,
      minItems: prefixItems.length,
      maxItems: prefixItems.length
    },
    input: async options => {
      const spec = [] as unknown as TSpec;
      const list = inputs as (InputConfig<any, TOptions> | undefined)[];

      for (let index = 0; index < list.length; index++) {
        const input = list[index];
        if (input === undefined) {
          continue;
        }

        (spec as unknown[])[index] = await resolveInputValue(
          input,
          options,
          "pipe",
          index
        );
      }

      return spec;
    }
  };
}

/**
 * Pipes an ordered list of bare output configs into one {@link OutputConfigObject}.
 *
 * @remarks
 * Every output runs in order with its own `spec[i]` slice; the last return
 * value is kept. An empty list yields `undefined`. Child schemas become
 * `prefixItems` aligned with the list.
 */
export function pipeOutputs<
  TSpec extends any[],
  TOptions extends object = object,
  TReturns = void
>(outputs: {
  [I in keyof TSpec]: OutputConfig<TSpec[I], TOptions, any> | undefined;
}): OutputConfigObject<TSpec, TOptions, TReturns> {
  const list = outputs as (OutputConfig<any, TOptions, any> | undefined)[];
  const prefixItems = list.map(output => unwrapOutputSchemaSource(output));

  return {
    schema: {
      type: "array",
      prefixItems,
      items: false,
      minItems: prefixItems.length,
      maxItems: prefixItems.length
    },
    output: async (spec, options, documents) => {
      if (list.length === 0) {
        return undefined as TReturns;
      }

      let lastReturns: TReturns = undefined as TReturns;

      for (let index = 0; index < list.length; index++) {
        const slice = (spec as unknown[])[index] as TSpec[number];
        const outputFn = resolveOutputFunction<
          TSpec[number],
          TOptions,
          TReturns
        >(list[index], "pipe", index);

        lastReturns = await outputFn(slice, options, documents);
      }

      return lastReturns;
    }
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

  const childInputs = generators.map(child => resolveChildInput(child)) as {
    [I in keyof PipeSpec<TGenerators>]:
      | InputConfig<PipeSpec<TGenerators>[I], PipeOptions<TGenerators>>
      | undefined;
  };

  const childOutputs = generators.map(child => resolveChildOutput(child)) as {
    [I in keyof PipeSpec<TGenerators>]:
      | OutputConfig<PipeSpec<TGenerators>[I], PipeOptions<TGenerators>, any>
      | undefined;
  };

  return {
    meta,
    schema:
      schema !== undefined
        ? resolveSchemaOverride<PipeSpec<TGenerators>>(schema)
        : undefined,
    input:
      input ??
      pipeInputs<PipeSpec<TGenerators>, PipeOptions<TGenerators>>(childInputs),
    output:
      output ??
      pipeOutputs<
        PipeSpec<TGenerators>,
        PipeOptions<TGenerators>,
        PipeReturns<TGenerators>
      >(childOutputs),
    generator: buildPipeGenerator(generators)
  };
}

/**
 * Pipes multiple generator configs into one sequential execution.
 *
 * @remarks
 * `config.generator` is an ordered array of child generator configs.
 * Spec / schema / input shapes are a tuple aligned with that array.
 * Child generators run in array order; documents are merged; every child
 * output runs (own spec slice) and returns come from the last generator only.
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
