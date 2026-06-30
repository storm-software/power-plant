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
import type { InferLoadOptions, LoadReference } from "@stryke/resolve/types";

export type InferEngineOptions<
  TGeneratorConfig extends GeneratorConfig<any, any, any>
> = TGeneratorConfig extends LoadReference
  ? InferLoadOptions<TGeneratorConfig> & UserConfig
  : UserConfig;

export interface Engine {
  execute: <TSpec, TOptions extends object, TReturns = void>(
    generatorConfig: GeneratorConfig<TSpec, TOptions, TReturns>,
    options: InferEngineOptions<typeof generatorConfig> & TOptions
  ) => Promise<TReturns>;
}
