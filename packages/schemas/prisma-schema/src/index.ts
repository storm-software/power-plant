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
import type * as z from "zod/mini";
import packageJson from "../package.json";
import { prismaSchema } from "./schema";

export * from "./schema";
export type PrismaSchema = z.infer<typeof prismaSchema>;

export default defineSchema<PrismaSchema>({
  meta: {
    name: "prisma-schema",
    title: "Prisma Schema",
    version: packageJson.version,
    description:
      "A Prisma DMMF (Data Model Meta Format) document describing models, enums, and client operation mappings from a Prisma schema.",
    spec: "A Prisma DMMF document.",
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
        href: "https://github.com/prisma/prisma/blob/main/packages/dmmf/src/dmmf.ts",
        description: "Prisma DMMF type definitions"
      }
    ]
  },
  schema: prismaSchema
});
