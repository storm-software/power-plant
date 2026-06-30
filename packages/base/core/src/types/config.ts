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
import type { Logger, Settings } from "./settings";

export interface UserConfig {
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
}

export interface UserConfigParams {
  cwd: string;
  mode: string;
}

export type UserConfigFnObject = (
  params: UserConfigParams
) => UserConfig | UserConfig[];
export type UserConfigFnPromise = (
  params: UserConfigParams
) => Promise<UserConfig | UserConfig[]>;
export type UserConfigFn = (
  params: UserConfigParams
) => UserConfig | UserConfig[] | Promise<UserConfig | UserConfig[]>;
export type UserConfigExport =
  | UserConfig
  | UserConfig[]
  | Promise<UserConfig | UserConfig[]>
  | UserConfigFnObject
  | UserConfigFnPromise
  | UserConfigFn;
