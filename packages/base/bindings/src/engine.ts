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

import type { GeneratorConfig, UserConfig } from "@power-plant/core";
import { callAsyncSessionContext } from "@power-plant/core";
import { uuid } from "@stryke/unique-id/uuid";
import { createSessionContext } from "./lib/context";
import { createGenerator } from "./lib/generator";
import { NativeBindingEngine } from "./native";
import type { Engine, InferEngineOptions } from "./types/engine";

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
export async function createEngine(
  userConfig: UserConfig = {}
): Promise<Engine> {
  const context = await createSessionContext(userConfig);
  const bindings = new NativeBindingEngine(context);

  const execute = async <TSpec, TOptions extends object, TReturns = void>(
    config: GeneratorConfig<TSpec, TOptions, TReturns>,
    options: InferEngineOptions<typeof config> &
      TOptions = {} as InferEngineOptions<typeof config> & TOptions
  ): Promise<TReturns> =>
    callAsyncSessionContext<TReturns>(context, async () => {
      const executionId = uuid();
      const { generator } = await createGenerator<TSpec, TOptions, TReturns>(
        executionId,
        context,
        config,
        options
      );

      const { documents, returns } = await generator(options);
      if (!context.settings.skipStorage) {
        await bindings.store({
          executionId,
          documents,
          meta: {
            executedAt: new Date(),
            executedBy: context.settings.userId
          }
        } as any);
      }

      return returns;
    });

  return {
    execute
  };
}
