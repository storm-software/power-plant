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
import { typeNameSchema } from "./shared";

export const deprecatedSchema = z.boolean();

export const directiveApplicationSchema = z.object({
  name: z.string().check(z.minLength(1, "Directive name is required")),
  args: z.optional(z.record(z.string(), z.unknown()))
});

export const typeReferenceSchema: z.ZodMiniType<TypeReference> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("NAMED"),
      name: typeNameSchema
    }),
    z.object({
      kind: z.literal("LIST"),
      ofType: typeReferenceSchema
    }),
    z.object({
      kind: z.literal("NON_NULL"),
      ofType: typeReferenceSchema
    })
  ])
);

export const inputValueDefinitionSchema = z.object({
  name: z.string().check(z.minLength(1, "Argument name is required")),
  description: z.optional(z.string()),
  type: typeReferenceSchema,
  defaultValue: z.optional(z.string()),
  deprecated: z.optional(deprecatedSchema),
  deprecationReason: z.optional(z.string()),
  directives: z.optional(z.array(directiveApplicationSchema))
});

export const fieldDefinitionSchema = z.object({
  name: z.string().check(z.minLength(1, "Field name is required")),
  description: z.optional(z.string()),
  type: typeReferenceSchema,
  args: z.optional(z.array(inputValueDefinitionSchema)),
  deprecated: z.optional(deprecatedSchema),
  deprecationReason: z.optional(z.string()),
  directives: z.optional(z.array(directiveApplicationSchema))
});

export const enumValueDefinitionSchema = z.object({
  name: z.string().check(z.minLength(1, "Enum value name is required")),
  description: z.optional(z.string()),
  deprecated: z.optional(deprecatedSchema),
  deprecationReason: z.optional(z.string()),
  directives: z.optional(z.array(directiveApplicationSchema))
});

export type TypeReference =
  | { kind: "NAMED"; name: string }
  | { kind: "LIST"; ofType: TypeReference }
  | { kind: "NON_NULL"; ofType: TypeReference };

export function collectNamedTypeReferences(
  typeReference: TypeReference
): string[] {
  if (typeReference.kind === "NAMED") {
    return [typeReference.name];
  }

  return collectNamedTypeReferences(typeReference.ofType);
}
