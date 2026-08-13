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

import { defineConfig } from "@power-plant/tools-config/powerlines.shared";
import { plugin as babel } from "@powerlines/plugin-babel";
import { plugin as tsdown } from "@powerlines/plugin-tsdown";
import { findFileExtension } from "@stryke/path/find";

const config = defineConfig({
  input: ["src/**/*.{ts,tsx}"],
  plugins: [tsdown(), babel()],
  babel: {
    skipConfigResolution: true,
    presets: [
      "@babel/preset-typescript",
      [
        "@alloy-js/babel-preset",
        {},
        (_: string, id: string) =>
          findFileExtension(id) === "tsx" || findFileExtension(id) === "jsx"
      ]
    ]
  },
  output: {
    minify: false
  },
  tsdown: {
    inputOptions: {
      transform: {
        jsx: "preserve"
      }
    }
  }
});

export default config;
