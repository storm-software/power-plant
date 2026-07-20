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

import { uuid } from "@stryke/unique-id/uuid";
import { callAsyncSessionContext } from "./context";
import { createSessionContext } from "./lib/context";
import { extractExecution } from "./lib/extract";
import { createGenerator } from "./lib/generator";
import type { UserConfig } from "./types/config";
import type {
  ExecuteFunction,
  ExecutionMeta,
  InferEngineOptions
} from "./types/execution";
import type { GeneratedDocument, GeneratorConfig } from "./types/generator";

/**
 * Creates an execution function that can be used to execute a generator.
 *
 * @remarks
 * This function is used to create an execution function that can be used to execute a generator. It creates a new execution context and returns an execution function that can be used to execute the generator with the given configuration and options.
 *
 *
 * @example
 * ```ts
 * import { createExecute } from "@power-plant/core";
 *
 * // First, create an execution function with a custom configuration
 * const execute = await createExecute({
 *  ...
 * });
 *
 * // Then, execute the generator
 * const result = await execute("my-generator", {
 *  ...
 * });
 * ```
 *
 * @example
 * ```ts
 * import { createExecute } from "@power-plant/core";
 *
 * // First, create an execution function with a custom configuration
 * const execute = await createExecute({
 *  ...
 * });
 *
 * // Then, execute the generator
 * const result = await execute({
 *  generator: (spec, options) => { ... },
 *  ...
 * });
 * ```
 *
 * @template TSpec - The type of the specification that the generator will produce.
 * @template TOptions - The type of the options that will be passed to the generator during generation.
 * @template TReturns - The type of the returns that the generator will produce.
 * @param userConfig - The user configuration for the engine.
 * @returns A promise that resolves to an execution function.
 */
export async function createExecute(
  userConfig: UserConfig = {}
): Promise<ExecuteFunction> {
  const context = await createSessionContext(userConfig);

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

      const {
        documents,
        returns,
        spec,
        options: returnedOptions
      } = await generator(options);

      const execution = await extractExecution(
        {
          documents: Object.fromEntries(
            Object.entries(documents).map(([path, document]) => [
              path,
              {
                ...document,
                path,
                meta: {
                  executionId
                }
              } as GeneratedDocument
            ])
          ),
          meta: {
            executionId,
            executedAt: new Date(),
            executedBy: context.session.user
          } as ExecutionMeta<TSpec>
        },
        spec,
        returnedOptions
      );

      context.session.executions.push(execution);

      return returns;
    });

  return execute;
}

/**
 * Executes a generator with a given configuration and options.
 *
 * @remarks
 * This function is used to execute a generator with a given configuration and options. It creates a new execution context and returns an execution function that can be used to execute the generator with the given configuration and options.
 *
 * @example
 * ```ts
 * import { execute } from "@power-plant/core";
 *
 * // Create and execute the generator
 * const result = await execute("my-generator", {
 *  ...
 * });
 * ```
 *
 * @example
 * ```ts
 * import { execute } from "@power-plant/core";
 *
 * // Create and execute the generator
 * const result = await execute({
 *  generator: (spec, options) => { ... },
 * }, {
 *  ...
 * });
 * ```
 *
 * @template TSpec - The type of the specification that the generator will produce.
 * @template TOptions - The type of the options that will be passed to the generator during generation.
 * @template TReturns - The type of the returns that the generator will produce.
 * @param config - The configuration for the generator.
 * @param options - The options for the generator.
 * @returns A promise that resolves to the returns of the generator.
 */
export async function execute<TSpec, TOptions extends object, TReturns = void>(
  config: GeneratorConfig<TSpec, TOptions, TReturns>,
  options: InferEngineOptions<typeof config> &
    TOptions = {} as InferEngineOptions<typeof config> & TOptions
): Promise<TReturns> {
  const innerExecute = await createExecute(options);

  return innerExecute<TSpec, TOptions, TReturns>(config, options);
}
