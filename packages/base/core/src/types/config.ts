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

import type { DeepPartial } from "@stryke/types/base";
import type { Storage } from "unstorage";
import type { InputConfig } from "./input";
import type { OutputConfig } from "./output";
import type { Logger, Settings } from "./settings";

export interface UserConfig<
  TSpec = any,
  TOptions extends object = any,
  TReturns = any
> {
  /**
   * The current working directory.
   *
   * @defaultValue process.cwd()
   */
  cwd?: string;

  /**
   * Whether to enable debug mode.
   */
  debug?: true;

  /**
   * The path to the configuration file that will be used to load the settings.
   *
   * @defaultValue "power-plant.config.ts"
   */
  configFile?: string;

  /**
   * The settings to use for the application.
   */
  settings?: DeepPartial<Settings>;

  /**
   * The default [Unstorage](https://unstorage.unjs.io) storage instance to use for the application.
   *
   * @remarks
   * If not provided, a default storage instance will be created. If provided, it will be used for all input and output operations. This allows for a single storage instance to be used across the entire application. If you want to use different storage instances for different inputs and outputs, you can provide them in the input and output configurations instead of here.
   */
  storage?: Storage;

  /**
   * The logger to use for the application.
   */
  logger?: Partial<Logger>;

  /**
   * The input config that will override the generator's input.
   */
  input?: InputConfig<TSpec, TOptions>;

  /**
   * The output config that will override the generator's output.
   */
  output?: OutputConfig<TSpec, TOptions, TReturns>;
}

export interface UserConfigParams {
  cwd: string;
  mode: string;
}

export type UserConfigFnObject<
  TSpec = any,
  TOptions extends object = any,
  TReturns = any
> = (
  config: UserConfig<TSpec, TOptions, TReturns>
) => UserConfig<TSpec, TOptions, TReturns>;
export type UserConfigFnPromise<
  TSpec = any,
  TOptions extends object = any,
  TReturns = any
> = (
  params: UserConfigParams
) => Promise<
  | UserConfig<TSpec, TOptions, TReturns>
  | UserConfig<TSpec, TOptions, TReturns>[]
>;
export type UserConfigFn<
  TSpec = any,
  TOptions extends object = any,
  TReturns = any
> = (
  params: UserConfigParams
) =>
  | UserConfig<TSpec, TOptions, TReturns>
  | UserConfig<TSpec, TOptions, TReturns>[]
  | Promise<
      | UserConfig<TSpec, TOptions, TReturns>
      | UserConfig<TSpec, TOptions, TReturns>[]
    >;
export type UserConfigExport<
  TSpec = any,
  TOptions extends object = any,
  TReturns = any
> =
  | UserConfig<TSpec, TOptions, TReturns>
  | UserConfig<TSpec, TOptions, TReturns>[]
  | Promise<
      | UserConfig<TSpec, TOptions, TReturns>
      | UserConfig<TSpec, TOptions, TReturns>[]
    >
  | UserConfigFnObject<TSpec, TOptions, TReturns>
  | UserConfigFnPromise<TSpec, TOptions, TReturns>
  | UserConfigFn<TSpec, TOptions, TReturns>;
