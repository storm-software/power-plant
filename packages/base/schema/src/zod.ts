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
import { JSON_SCHEMA_TYPES } from "./constants";
import type { JsonSchema, JsonSchemaMap } from "./types";

const jsonSchemaType = z.enum(JSON_SCHEMA_TYPES);

const jsonSchemaEnumValue = z.union([
  z.string(),
  z.number(),
  z.bigint(),
  z.boolean(),
  z.null()
]);

const jsonSchemaNumeric = z.union([z.number(), z.bigint()]);

const jsonSchemaDeprecated = z.union([
  z.boolean(),
  z.string(),
  z.object({
    message: z.optional(z.string()),
    since: z.optional(z.string()),
    alternative: z.optional(z.string())
  })
]);

const jsonSchemaExample = z.union([
  z.unknown(),
  z.object({
    name: z.optional(z.string()),
    description: z.optional(z.string()),
    value: z.unknown()
  })
]);

const nonNegativeInt = z.number().check(z.int(), z.nonnegative());

export const referenceSchema = z.object({
  $ref: z.string().check(z.minLength(1, "Reference must be a non-empty URI"))
});

export function refOr<T extends z.ZodMiniType>(schema: T) {
  return z.union([referenceSchema, schema]);
}

const jsonSchemaKeywords = z.object({
  $id: z.optional(z.string()),
  $schema: z.optional(z.string()),
  $vocabulary: z.optional(z.record(z.string(), z.boolean())),
  $comment: z.optional(z.string()),
  $anchor: z.optional(z.string()),
  $dynamicRef: z.optional(z.string()),
  $dynamicAnchor: z.optional(z.string()),
  name: z.optional(z.string()),
  version: z.optional(z.union([z.string(), z.number()])),
  title: z.optional(z.string()),
  description: z.optional(z.string()),
  docs: z.optional(z.string()),
  examples: z.optional(z.array(jsonSchemaExample)),
  alias: z.optional(z.array(z.string())),
  tags: z.optional(z.array(z.string())),
  deprecated: z.optional(jsonSchemaDeprecated),
  hidden: z.optional(z.boolean()),
  ignore: z.optional(z.boolean()),
  internal: z.optional(z.boolean()),
  runtime: z.optional(z.boolean()),
  readOnly: z.optional(z.boolean()),
  writeOnly: z.optional(z.boolean())
});

export const jsonSchema: z.ZodMiniType<JsonSchema> = z.lazy(() => {
  const jsonSchemaMapItems: z.ZodMiniType<JsonSchemaMap["items"]> = z.object({
    type: z.literal("array"),
    prefixItems: z.tuple([jsonSchema, jsonSchema]),
    items: z.optional(z.literal(false)),
    minItems: z.literal(2),
    maxItems: z.literal(2)
  });

  const jsonSchemaDocument = z.extend(jsonSchemaKeywords, {
    $ref: z.optional(z.string()),
    $defs: z.optional(z.record(z.string(), jsonSchema)),

    type: z.optional(z.union([jsonSchemaType, z.array(jsonSchemaType)])),
    const: z.optional(z.unknown()),
    enum: z.optional(z.array(jsonSchemaEnumValue)),
    format: z.optional(z.string()),
    default: z.optional(z.unknown()),

    allOf: z.optional(z.array(jsonSchema)),
    anyOf: z.optional(z.array(jsonSchema)),
    oneOf: z.optional(z.array(jsonSchema)),
    not: z.optional(jsonSchema),
    if: z.optional(jsonSchema),
    then: z.optional(jsonSchema),
    else: z.optional(jsonSchema),

    properties: z.optional(z.record(z.string(), jsonSchema)),
    patternProperties: z.optional(z.record(z.string(), jsonSchema)),
    additionalProperties: z.optional(z.union([z.boolean(), jsonSchema])),
    required: z.optional(z.array(z.string())),
    propertyNames: z.optional(jsonSchema),
    dependencies: z.optional(
      z.record(z.string(), z.union([z.array(z.string()), jsonSchema]))
    ),
    dependentRequired: z.optional(z.record(z.string(), z.array(z.string()))),
    dependentSchemas: z.optional(z.record(z.string(), jsonSchema)),
    minProperties: z.optional(nonNegativeInt),
    maxProperties: z.optional(nonNegativeInt),
    primaryKey: z.optional(z.array(z.string())),
    databaseSchema: z.optional(z.string()),
    unevaluatedProperties: z.optional(z.union([z.boolean(), jsonSchema])),

    prefixItems: z.optional(z.array(jsonSchema)),
    items: z.optional(z.union([jsonSchema, jsonSchemaMapItems])),
    contains: z.optional(jsonSchema),
    minItems: z.optional(nonNegativeInt),
    maxItems: z.optional(nonNegativeInt),
    uniqueItems: z.optional(z.boolean()),
    minContains: z.optional(nonNegativeInt),
    maxContains: z.optional(nonNegativeInt),
    unevaluatedItems: z.optional(z.union([z.boolean(), jsonSchema])),

    minLength: z.optional(nonNegativeInt),
    maxLength: z.optional(nonNegativeInt),
    pattern: z.optional(z.string()),
    contentMediaType: z.optional(z.string()),
    contentEncoding: z.optional(z.string()),
    contentSchema: z.optional(z.string()),

    minimum: z.optional(jsonSchemaNumeric),
    maximum: z.optional(jsonSchemaNumeric),
    exclusiveMinimum: z.optional(jsonSchemaNumeric),
    exclusiveMaximum: z.optional(jsonSchemaNumeric),
    multipleOf: z.optional(jsonSchemaNumeric)
  });

  return z.union([referenceSchema, jsonSchemaDocument]);
});
