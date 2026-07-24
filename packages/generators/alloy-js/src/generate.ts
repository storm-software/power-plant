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

import type { Children } from "@alloy-js/core";
import type {
  GeneratedDocument,
  GeneratorConfigObject,
  GeneratorFunctionResult,
  OutputConfig,
  UserConfig
} from "@power-plant/core";
import { execute } from "@power-plant/core";
import noop from "@power-plant/noop-output";
import { render } from "./render";

/**
 * Execute Alloy-js template components through a Power Plant execution context.
 *
 * @remarks
 * Creates an execution context via `execute`, then renders the Alloy-js template components with `render`. Use this as the top-level entry point; use `render` when already inside a running generator.
 *
 * @example
 * ```tsx
 * import { generate } from "@power-plant/alloy-js/generate";
 *
 * await generate(<> ... </>);
 * ```
 *
 * @param template - The Alloy-js template components to render.
 * @param config - A generator configuration object.
 * @param options - Engine options for the execution context.
 * @returns A promise that resolves when generation is complete.
 */
export async function generate<
  TSpec = any,
  TOptions extends object = object,
  TGeneratorConfig extends Omit<
    GeneratorConfigObject<TSpec, TOptions, any>,
    "generator"
  > = Omit<
    GeneratorConfigObject<TSpec, TOptions, Record<string, GeneratedDocument>>,
    "generator"
  >,
  TReturns = TGeneratorConfig["output"] extends OutputConfig<
    TSpec,
    TOptions,
    infer TOutputReturns
  >
    ? TOutputReturns
    : any
>(
  template: Children,
  config: TGeneratorConfig = {} as TGeneratorConfig,
  options: UserConfig & TOptions = {} as UserConfig & TOptions
): Promise<TReturns> {
  return execute<TSpec, TOptions, TReturns>(
    {
      output: noop as OutputConfig<TSpec, TOptions, TReturns>,
      ...config,
      generator: async (): Promise<
        GeneratorFunctionResult<TSpec, TOptions>
      > => {
        return render<TSpec, TOptions, TReturns>(template);
      }
    },
    options
  );
}
