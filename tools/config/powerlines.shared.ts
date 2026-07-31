/* -------------------------------------------------------------------

                  🗲 Storm Software - Shell Shock

 This code was released as part of the Shell Shock project. Shell Shock
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/shell-shock.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/shell-shock
 Documentation:            https://docs.stormsoftware.com/projects/shell-shock
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import type { UserConfig } from "powerlines";
import { defineConfig as definePowerlinesConfig } from "powerlines/config";

export type PowerlinesOptions = Partial<UserConfig> & Pick<UserConfig, "name">;

export const DEFAULT_OPTIONS: Omit<Partial<UserConfig>, "name"> = {
  skipCache: true,
  platform: "node",
  resolve: {
    skipNodeModulesBundle: true
  },
  output: {
    format: ["cjs", "esm"],
    minify: false
  }
};

export function defineConfig(
  options: PowerlinesOptions | PowerlinesOptions[]
): UserConfig | UserConfig[] {
  return Array.isArray(options)
    ? definePowerlinesConfig(
        options.map(option => ({
          ...DEFAULT_OPTIONS,
          ...option
        }))
      )
    : definePowerlinesConfig({
        ...DEFAULT_OPTIONS,
        ...options
      });
}

export default defineConfig(DEFAULT_OPTIONS);
