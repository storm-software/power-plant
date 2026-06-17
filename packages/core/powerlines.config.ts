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

import tsdown from "@powerlines/plugin-tsdown";
import type { UserConfig } from "powerlines";
import { defineConfig } from "powerlines/config";

const config: UserConfig = defineConfig({
  input: ["src/*.ts", "src/types/*.ts"],
  platform: "node",
  output: {
    format: ["cjs", "esm"]
  },
  plugins: [tsdown()]
});

export default config;
