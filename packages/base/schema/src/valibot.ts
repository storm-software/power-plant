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

import * as v from "valibot";
import { JSON_SCHEMA_TYPES } from "./constants";
import type { JsonSchema, JsonSchemaMap } from "./types";

const jsonSchemaType = v.picklist(JSON_SCHEMA_TYPES);

const jsonSchemaEnumValue = v.union([
  v.string(),
  v.number(),
  v.bigint(),
  v.boolean(),
  v.null()
]);

const jsonSchemaNumeric = v.union([v.number(), v.bigint()]);

const jsonSchemaDeprecated = v.union([
  v.boolean(),
  v.string(),
  v.object({
    message: v.optional(v.string()),
    since: v.optional(v.string()),
    alternative: v.optional(v.string())
  })
]);

const jsonSchemaExample = v.union([
  v.unknown(),
  v.object({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    value: v.unknown()
  })
]);

const nonNegativeInt = v.pipe(v.number(), v.integer(), v.minValue(0));

export const referenceSchema = v.object({
  $ref: v.pipe(v.string(), v.minLength(1, "Reference must be a non-empty URI"))
});

export function refOr<TSchema extends v.GenericSchema>(schema: TSchema) {
  return v.union([referenceSchema, schema]);
}

const jsonSchemaKeywords = v.object({
  $id: v.optional(v.string()),
  $schema: v.optional(v.string()),
  $vocabulary: v.optional(v.record(v.string(), v.boolean())),
  $comment: v.optional(v.string()),
  $anchor: v.optional(v.string()),
  $dynamicRef: v.optional(v.string()),
  $dynamicAnchor: v.optional(v.string()),
  name: v.optional(v.string()),
  version: v.optional(v.union([v.string(), v.number()])),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  docs: v.optional(v.string()),
  examples: v.optional(v.array(jsonSchemaExample)),
  alias: v.optional(v.array(v.string())),
  tags: v.optional(v.array(v.string())),
  deprecated: v.optional(jsonSchemaDeprecated),
  hidden: v.optional(v.boolean()),
  ignore: v.optional(v.boolean()),
  internal: v.optional(v.boolean()),
  runtime: v.optional(v.boolean()),
  readOnly: v.optional(v.boolean()),
  writeOnly: v.optional(v.boolean())
});

export const jsonSchema: v.GenericSchema<JsonSchema> = v.lazy(() => {
  const jsonSchemaMapItems: v.GenericSchema<JsonSchemaMap["items"]> = v.object({
    type: v.literal("array"),
    prefixItems: v.tuple([jsonSchema, jsonSchema]),
    items: v.optional(v.literal(false)),
    minItems: v.literal(2),
    maxItems: v.literal(2)
  });

  const jsonSchemaDocument = v.object({
    ...jsonSchemaKeywords.entries,
    $ref: v.optional(v.string()),
    $defs: v.optional(v.record(v.string(), jsonSchema)),

    type: v.optional(v.union([jsonSchemaType, v.array(jsonSchemaType)])),
    const: v.optional(v.unknown()),
    enum: v.optional(v.array(jsonSchemaEnumValue)),
    format: v.optional(v.string()),
    default: v.optional(v.unknown()),

    allOf: v.optional(v.array(jsonSchema)),
    anyOf: v.optional(v.array(jsonSchema)),
    oneOf: v.optional(v.array(jsonSchema)),
    not: v.optional(jsonSchema),
    if: v.optional(jsonSchema),
    then: v.optional(jsonSchema),
    else: v.optional(jsonSchema),

    properties: v.optional(v.record(v.string(), jsonSchema)),
    patternProperties: v.optional(v.record(v.string(), jsonSchema)),
    additionalProperties: v.optional(v.union([v.boolean(), jsonSchema])),
    required: v.optional(v.array(v.string())),
    propertyNames: v.optional(jsonSchema),
    dependencies: v.optional(
      v.record(v.string(), v.union([v.array(v.string()), jsonSchema]))
    ),
    dependentRequired: v.optional(v.record(v.string(), v.array(v.string()))),
    dependentSchemas: v.optional(v.record(v.string(), jsonSchema)),
    minProperties: v.optional(nonNegativeInt),
    maxProperties: v.optional(nonNegativeInt),
    primaryKey: v.optional(v.array(v.string())),
    databaseSchema: v.optional(v.string()),
    unevaluatedProperties: v.optional(v.union([v.boolean(), jsonSchema])),

    prefixItems: v.optional(v.array(jsonSchema)),
    items: v.optional(v.union([jsonSchema, jsonSchemaMapItems])),
    contains: v.optional(jsonSchema),
    minItems: v.optional(nonNegativeInt),
    maxItems: v.optional(nonNegativeInt),
    uniqueItems: v.optional(v.boolean()),
    minContains: v.optional(nonNegativeInt),
    maxContains: v.optional(nonNegativeInt),
    unevaluatedItems: v.optional(v.union([v.boolean(), jsonSchema])),

    minLength: v.optional(nonNegativeInt),
    maxLength: v.optional(nonNegativeInt),
    pattern: v.optional(v.string()),
    contentMediaType: v.optional(v.string()),
    contentEncoding: v.optional(v.string()),
    contentSchema: v.optional(v.string()),

    minimum: v.optional(jsonSchemaNumeric),
    maximum: v.optional(jsonSchemaNumeric),
    exclusiveMinimum: v.optional(jsonSchemaNumeric),
    exclusiveMaximum: v.optional(jsonSchemaNumeric),
    multipleOf: v.optional(jsonSchemaNumeric)
  });

  return v.union([referenceSchema, jsonSchemaDocument]);
});
