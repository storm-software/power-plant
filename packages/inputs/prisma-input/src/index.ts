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
import type { PrismaSchema } from "@power-plant/prisma-schema";
import schema from "@power-plant/prisma-schema";
import { input } from "./input";
import type { Options } from "./types";

export { input } from "./input";
export type { Options } from "./types";
export {
  formatLoadError,
  normalizeInputPaths,
  toAbsolutePath,
  toFileUrl,
  toSchemaFiles
} from "./utilities";

export default defineInput<PrismaSchema, Options>({
  meta: {
    name: "prisma-input",
    description:
      "An input extension that reads Prisma schema (`.prisma`) files and converts them into a Prisma DMMF document using `@prisma/internals`.",
    usage:
      "Reads one or more Prisma schema files (or globs) configured via inputPath and returns the DMMF document.",
    version: "1.0",
    tags: ["prisma", "dmmf"],
    links: [
      {
        href: "https://www.prisma.io",
        description: "Prisma"
      },
      {
        href: "https://www.prisma.io/docs/orm/prisma-schema",
        description: "Prisma Schema"
      },
      {
        href: "https://github.com/prisma/prisma",
        description: "Prisma GitHub Repository"
      }
    ]
  },
  schema,
  input
});
