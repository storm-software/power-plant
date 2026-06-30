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

import type { EnvPaths } from "@stryke/env/get-env-paths";

export interface Settings {
  /**
   * The mode to use for the application.
   *
   * @defaultValue "production"
   */
  mode: "development" | "production" | "test";

  /**
   * The log level to use for the application.
   *
   * @defaultValue "warn"
   */
  logLevel: "debug" | "info" | "warn" | "error" | "silent";

  /**
   * The paths to use for the application.
   */
  paths: EnvPaths;

  /**
   * The user ID to use for the application.
   */
  userId: string;

  /**
   * The tenant ID to use for the application.
   */
  tenantId: string;

  /**
   * Whether to skip {@link Execution | execution metadata} storage after completing generation.
   *
   * @defaultValue false
   */
  skipStorage: boolean;

  /**
   * Whether to skip tracing.
   *
   * @defaultValue false
   */
  skipTracing: boolean;
}

export interface Logger {
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}
