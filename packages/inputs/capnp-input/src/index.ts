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

import type { CapnpSchema } from "@power-plant/capnp-schema";
import schema from "@power-plant/capnp-schema";
import { defineInput } from "@power-plant/core";
import { input } from "./input";
import type { Options } from "./types";

export { input } from "./input";
export type { Options } from "./types";
export {
  formatLoadError,
  normalizeInputPaths,
  toAbsolutePath,
  toCapnpSchema,
  toFileUrl,
  toGeneratedFileEntries,
  toTypeId
} from "./utilities";

export default defineInput<CapnpSchema, Options>({
  meta: {
    name: "capnp-input",
    description:
      "An input extension that reads Cap'n Proto schema (`.capnp`) files and converts them into a Cap'n Proto schema document using `@stryke/capnp` `capnpc`.",
    usage:
      "Reads one or more Cap'n Proto schema files (or globs) configured via inputPath and returns the compiled schema document.",
    version: "1.0",
    tags: ["capnp", "capnproto", "capnpc"],
    links: [
      {
        href: "https://capnproto.org",
        description: "Cap'n Proto"
      },
      {
        href: "https://capnproto.org/language.html",
        description: "Cap'n Proto Schema Language"
      },
      {
        href: "https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-capnp/src/index.ts",
        description: "Powerlines Cap'n Proto plugin"
      }
    ]
  },
  schema,
  input
});
