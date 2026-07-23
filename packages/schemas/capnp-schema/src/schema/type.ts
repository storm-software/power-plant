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
import { builtinTypeKindSchema, typeIdSchema } from "./shared";

export type CapnpType =
  | { kind: z.infer<typeof builtinTypeKindSchema> }
  | { kind: "list"; elementType: CapnpType }
  | { kind: "enum"; typeId: string; typeName?: string }
  | { kind: "struct"; typeId: string; typeName?: string }
  | { kind: "interface"; typeId: string; typeName?: string };

/**
 * Cap'n Proto type expression.
 *
 * @see https://capnproto.org/language.html#built-in-types
 */
export const capnpTypeSchema: z.ZodMiniType<CapnpType> = z.lazy(() =>
  z.union([
    z.object({
      kind: builtinTypeKindSchema
    }),
    z.object({
      kind: z.literal("list"),
      elementType: capnpTypeSchema
    }),
    z.object({
      kind: z.literal("enum"),
      typeId: typeIdSchema,
      typeName: z.optional(z.string())
    }),
    z.object({
      kind: z.literal("struct"),
      typeId: typeIdSchema,
      typeName: z.optional(z.string())
    }),
    z.object({
      kind: z.literal("interface"),
      typeId: typeIdSchema,
      typeName: z.optional(z.string())
    })
  ])
);
