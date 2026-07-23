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

import * as z from "zod/mini";

export const fieldKindSchema = z.enum([
  "scalar",
  "object",
  "enum",
  "unsupported"
]);

export const fieldNamespaceSchema = z.enum(["model", "prisma"]);

export const fieldLocationSchema = z.enum([
  "scalar",
  "inputObjectTypes",
  "outputObjectTypes",
  "enumTypes",
  "fieldRefTypes"
]);

export const sortOrderSchema = z.enum(["asc", "desc"]);

export const indexTypeSchema = z.enum(["id", "normal", "unique", "fulltext"]);

export const deprecationSchema = z.object({
  sinceVersion: z.string(),
  reason: z.string(),
  plannedRemovalVersion: z.optional(z.string())
});

export const fieldDefaultSchema = z.object({
  name: z.string(),
  args: z.array(z.unknown())
});

export const fieldDefaultScalarSchema = z.union([
  z.string(),
  z.boolean(),
  z.number()
]);
