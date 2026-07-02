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
import type { FileSystemInterface } from "@stryke/types/fs";
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
   * The file system to use for the application.
   */
  fs?: Partial<FileSystemInterface>;

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
