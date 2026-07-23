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
import { fieldKindSchema, typeIdSchema } from "./shared";
import { capnpTypeSchema } from "./type";

/**
 * A Cap'n Proto struct field (slot or group).
 *
 * Fields are numbered consecutively from zero (`@N` ordinals). Union members
 * share the containing struct's ordinal space and carry a discriminant value.
 *
 * @see https://capnproto.org/language.html#structs
 * @see https://capnproto.org/language.html#unions
 * @see https://capnproto.org/language.html#groups
 */
export const fieldSchema = z.object({
  name: z.string(),
  ordinal: z.number(),
  codeOrder: z.number(),
  kind: fieldKindSchema,
  /**
   * Present when the field belongs to a union. `0xffff` / omitted means not in a union.
   */
  discriminantValue: z.optional(z.number()),
  documentation: z.optional(z.string()),
  /** Slot fields carry a type expression. */
  type: z.optional(capnpTypeSchema),
  hadExplicitDefault: z.optional(z.boolean()),
  /** Group fields reference another struct node (often `isGroup: true`). */
  groupId: z.optional(typeIdSchema)
});

export const enumerantSchema = z.object({
  name: z.string(),
  ordinal: z.number(),
  codeOrder: z.number(),
  documentation: z.optional(z.string())
});

export const methodSchema = z.object({
  name: z.string(),
  ordinal: z.number(),
  codeOrder: z.number(),
  documentation: z.optional(z.string()),
  paramStructTypeId: typeIdSchema,
  resultStructTypeId: typeIdSchema,
  implicitParameters: z.optional(z.array(z.string()))
});
