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

import { defineConfig } from "@storm-software/eslint";

Error.stackTraceLimit = Number.POSITIVE_INFINITY;

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig({
  name: "power-plant",
  tsdoc: {
    configFile: "@powerlines/tsdoc/recommended.json"
  },
  ignores: [
    "packages/base/engine/src/bindings.*",
    "packages/base/engine/src/power-plant-bindings.*",
    "packages/base/engine/src/wasi-worker-browser.mjs",
    "packages/base/engine/src/wasi-worker.mjs",
    "packages/base/engine/src/webcontainer-fallback.cjs"
  ]
});
