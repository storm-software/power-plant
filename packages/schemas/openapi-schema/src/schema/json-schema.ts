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

import { referenceSchema } from "./reference";

const jsonSchemaType = z.enum([
  "array",
  "boolean",
  "integer",
  "null",
  "number",
  "object",
  "string"
]);

type JsonSchema = z.infer<typeof jsonSchemaBase> & {
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | JsonSchema[];
  additionalProperties?: boolean | JsonSchema;
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  prefixItems?: JsonSchema[];
};

const jsonSchemaBase = z.object({
  $ref: z.optional(z.string()),
  type: z.optional(z.union([jsonSchemaType, z.array(jsonSchemaType)])),
  format: z.optional(z.string()),
  title: z.optional(z.string()),
  description: z.optional(z.string()),
  default: z.optional(z.unknown()),
  enum: z.optional(z.array(z.unknown())),
  const: z.optional(z.unknown()),
  nullable: z.optional(z.boolean()),
  readOnly: z.optional(z.boolean()),
  writeOnly: z.optional(z.boolean()),
  deprecated: z.optional(z.boolean()),
  example: z.optional(z.unknown()),
  examples: z.optional(z.array(z.unknown())),
  required: z.optional(z.array(z.string())),
  minimum: z.optional(z.number()),
  maximum: z.optional(z.number()),
  exclusiveMinimum: z.optional(z.number()),
  exclusiveMaximum: z.optional(z.number()),
  minLength: z.optional(z.number().check(z.int(), z.nonnegative())),
  maxLength: z.optional(z.number().check(z.int(), z.nonnegative())),
  pattern: z.optional(z.string()),
  minItems: z.optional(z.number().check(z.int(), z.nonnegative())),
  maxItems: z.optional(z.number().check(z.int(), z.nonnegative())),
  uniqueItems: z.optional(z.boolean()),
  minProperties: z.optional(z.number().check(z.int(), z.nonnegative())),
  maxProperties: z.optional(z.number().check(z.int(), z.nonnegative())),
  multipleOf: z.optional(z.number())
});

export const jsonSchema: z.ZodMiniType<JsonSchema> = z.lazy(() =>
  z.union([
    referenceSchema,
    z.extend(jsonSchemaBase, {
      properties: z.optional(z.record(z.string(), jsonSchema)),
      items: z.optional(z.union([jsonSchema, z.array(jsonSchema)])),
      additionalProperties: z.optional(z.union([z.boolean(), jsonSchema])),
      allOf: z.optional(z.array(jsonSchema)),
      anyOf: z.optional(z.array(jsonSchema)),
      oneOf: z.optional(z.array(jsonSchema)),
      not: z.optional(jsonSchema),
      prefixItems: z.optional(z.array(jsonSchema))
    })
  ])
);

export type JsonSchemaObject = z.infer<typeof jsonSchema>;
