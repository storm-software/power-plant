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

export const referenceSchema = z.object({
  $ref: z.string().check(z.minLength(1, "Reference must be a non-empty URI"))
});

export type Reference = z.infer<typeof referenceSchema>;

export function refOr<T extends z.ZodMiniType>(schema: T) {
  return z.union([referenceSchema, schema]);
}
