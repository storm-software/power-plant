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

/* eslint-disable */

import { createEngine } from "@power-plant/engine";
import { tool } from "ai";
import { z } from "zod/mini";

const engine = createEngine();

export const generate = tool({
  description:
    "Generate text (including source code, documentation, and more) with Power Plant generators.",
  inputSchema: z.object({
    generator: z.string(),
    spec: z.any(),
    options: z.optional(z.record(z.string(), z.any()))
  }),
  execute: async ({ generator, spec, options }) => {
    return engine.execute(generator, { ...options, spec });
  }
});
