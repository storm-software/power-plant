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
import type { DTCGSchema } from "@power-plant/dtcg-schema";
import schema from "@power-plant/dtcg-schema";
import { input } from "./input";
import type { Options } from "./types";

export type { Options } from "./types";
export { toTokenFilename } from "./utilities";

export default defineInput<DTCGSchema, Options>({
  meta: {
    name: "terrazzo-input",
    description:
      "An input extension that reads the specification from a Design Tokens Community Group (DTCG) schema document and parses it into a Design Tokens format using Terrazzo.",
    usage:
      "Reads the Design Tokens Community Group (DTCG) schema from a file path, remote URL, or schema loader source configured via inputPath.",
    version: "1.0",
    tags: ["dtcg"],
    links: [
      {
        href: "https://terrazzo.app",
        description: "Terrazzo"
      },
      {
        href: "https://terrazzo.app/docs/guides/dtcg/",
        description: "Terrazzo - DTCG Guide"
      },
      {
        href: "https://terrazzo.app/docs/reference/js-api/",
        description: "Terrazzo - JS API"
      }
    ]
  },
  schema,
  input
});
