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

import { defineInput } from "@power-plant/core";
import { load } from "@stryke/resolve/load";
import packageJson from "../package.json" with { type: "json" };
import type { Options } from "./types";

export default defineInput<any, Options>({
  meta: {
    name: "file",
    version: packageJson.version
  },
  input: async (options: Options) => {
    const { path, ...rest } = options;

    return load(path, rest);
  }
});
