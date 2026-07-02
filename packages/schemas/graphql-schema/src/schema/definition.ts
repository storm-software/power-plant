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
import {
  directiveApplicationSchema,
  enumValueDefinitionSchema,
  fieldDefinitionSchema,
  inputValueDefinitionSchema
} from "./value";

export const schemaDefinitionSchema = z.object({
  query: z.optional(typeNameSchema),
  mutation: z.optional(typeNameSchema),
  subscription: z.optional(typeNameSchema),
  description: z.optional(z.string()),
  directives: z.optional(z.array(directiveApplicationSchema))
});

export const directiveLocationSchema = z.enum([
  "QUERY",
  "MUTATION",
  "SUBSCRIPTION",
  "FIELD",
  "FRAGMENT_DEFINITION",
  "FRAGMENT_SPREAD",
  "INLINE_FRAGMENT",
  "SCHEMA",
  "SCALAR",
  "OBJECT",
  "FIELD_DEFINITION",
  "ARGUMENT_DEFINITION",
  "INTERFACE",
  "UNION",
  "ENUM",
  "ENUM_VALUE",
  "INPUT_OBJECT",
  "INPUT_FIELD_DEFINITION"
]);

export const directiveDefinitionSchema = z.object({
  name: z.string().check(z.minLength(1, "Directive name is required")),
  description: z.optional(z.string()),
  locations: z
    .array(directiveLocationSchema)
    .check(
      z.refine(
        value => value.length > 0,
        "At least one directive location must be defined"
      )
    ),
  args: z.optional(z.array(inputValueDefinitionSchema)),
  isRepeatable: z.optional(z.boolean()),
  directives: z.optional(z.array(directiveApplicationSchema))
});

const typeDefinitionBaseSchema = z.object({
  name: typeNameSchema,
  description: z.optional(z.string()),
  directives: z.optional(z.array(directiveApplicationSchema))
});

export const scalarTypeDefinitionSchema = z.extend(typeDefinitionBaseSchema, {
  kind: z.literal("SCALAR")
});

export const objectTypeDefinitionSchema = z.extend(typeDefinitionBaseSchema, {
  kind: z.literal("OBJECT"),
  interfaces: z.optional(z.array(typeNameSchema)),
  fields: z
    .array(fieldDefinitionSchema)
    .check(
      z.refine(
        value => value.length > 0,
        "Object types must define at least one field"
      )
    )
});

export const interfaceTypeDefinitionSchema = z.extend(
  typeDefinitionBaseSchema,
  {
    kind: z.literal("INTERFACE"),
    interfaces: z.optional(z.array(typeNameSchema)),
    fields: z
      .array(fieldDefinitionSchema)
      .check(
        z.refine(
          value => value.length > 0,
          "Interface types must define at least one field"
        )
      )
  }
);

export const unionTypeDefinitionSchema = z.extend(typeDefinitionBaseSchema, {
  kind: z.literal("UNION"),
  types: z
    .array(typeNameSchema)
    .check(
      z.refine(
        value => value.length > 0,
        "Union types must include at least one member type"
      )
    )
});

export const enumTypeDefinitionSchema = z.extend(typeDefinitionBaseSchema, {
  kind: z.literal("ENUM"),
  values: z
    .array(enumValueDefinitionSchema)
    .check(
      z.refine(
        value => value.length > 0,
        "Enum types must define at least one value"
      )
    )
});

export const inputObjectTypeDefinitionSchema = z.extend(
  typeDefinitionBaseSchema,
  {
    kind: z.literal("INPUT_OBJECT"),
    fields: z
      .array(inputValueDefinitionSchema)
      .check(
        z.refine(
          value => value.length > 0,
          "Input object types must define at least one field"
        )
      )
  }
);

export const typeDefinitionSchema = z.discriminatedUnion("kind", [
  scalarTypeDefinitionSchema,
  objectTypeDefinitionSchema,
  interfaceTypeDefinitionSchema,
  unionTypeDefinitionSchema,
  enumTypeDefinitionSchema,
  inputObjectTypeDefinitionSchema
]);
