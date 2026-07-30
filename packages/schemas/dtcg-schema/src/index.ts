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

import { defineSchema } from "@power-plant/core";
import packageJson from "../package.json";
import type { Tokens } from "./schema";
import { tokensSchema } from "./schema";

export * from "./schema";

export default defineSchema<Tokens>({
  meta: {
    name: "dtcg-schema",
    title: "Design Tokens Community Group (DTCG) Schema",
    version: packageJson.version,
    description:
      "A Design Tokens Community Group (DTCG) specification document used to describe Design Tokens.",
    spec: "A Design Tokens Community Group (DTCG) specification document.",
    tags: ["dtcg"],
    links: [
      {
        name: "Design Tokens Community Group (DTCG)",
        url: "https://www.w3.org/community/design-tokens/"
      },
      {
        name: "Design Tokens Format Module (DTCG)",
        url: "https://www.w3.org/community/design-tokens/format-module/"
      }
    ]
  },
  schema: tokensSchema
});
