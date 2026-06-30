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
  Context,
  Generator,
  GeneratorConfig,
  GeneratorConfigObject,
  InferCreateGeneratorOptions,
  SchemaConfigObject,
  UserConfig
} from "@power-plant/core";
import { callAsyncContext } from "@power-plant/core";
import type { SchemaEnvelopeOf, SchemaSourceConfig } from "@power-plant/schema";
import { load } from "@stryke/resolve/load";
import { isFunction } from "@stryke/type-checks/is-function";
import { isGeneratorConfigObject } from "../helpers/type-checks";
import { createInput } from "./input";
import { createOutput } from "./output";
import { createSchema } from "./schema";

/**
 * Creates a generator from raw schema/input/output configurations and resolves all descriptors.
 *
 * @remarks
 * This function is used to create a generator from raw schema, input, and output configurations. It resolves all descriptors and returns a fully constructed generator that can be used to generate output based on the provided schema and options.
 *
 * @template TSpec - The type of the specification that the generator will produce.
 * @template TOptions - The type of the options that will be passed to the generator during generation.
 * @param config - The generator configuration containing schema, input, output, and optional meta information.
 * @param options - Optional extraction options for schema, input, and output.
 * @returns A promise that resolves to a fully constructed generator.
 */
export async function createGenerator<
  TSpec,
  TOptions extends object,
  TReturns = void
>(
  context: Context,
  config: GeneratorConfig<TSpec, TOptions, TReturns>,
  options: InferCreateGeneratorOptions<typeof config> = {}
): Promise<Generator<TSpec, TOptions, TReturns>> {
  let configObject!: GeneratorConfigObject<TSpec, TOptions, TReturns>;
  if (isGeneratorConfigObject<TSpec, TOptions, TReturns>(config)) {
    configObject = config;
  } else {
    configObject = await load<GeneratorConfigObject<TSpec, TOptions, TReturns>>(
      config,
      options
    );
  }

  const schema = await createSchema<TSpec, TOptions>(
    configObject.schema as
      | SchemaSourceConfig<TSpec>
      | SchemaEnvelopeOf<TSpec>
      | SchemaConfigObject<TSpec, TOptions>,
    options
  );
  const [input, output] = await Promise.all([
    createInput<TSpec, TOptions>(schema, configObject.input, options),
    createOutput<TSpec, TOptions, TReturns>(
      schema,
      configObject.output,
      options
    )
  ]);

  const generate = async (options: TOptions & UserConfig) => {
    return callAsyncContext(
      { ...context, settings: { ...context.settings, ...options } },
      async () => {
        const spec = isFunction(input.input)
          ? await (
              input.input as unknown as (
                options: TOptions
              ) => TSpec | Promise<TSpec>
            )(options)
          : input.input;

        return output.output(spec, options);
      }
    );
  };

  return {
    meta: configObject.meta,
    schema,
    input,
    output,
    generate
  };
}
