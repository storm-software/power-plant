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
import {
  fieldDefaultScalarSchema,
  fieldDefaultSchema,
  fieldKindSchema,
  fieldLocationSchema,
  fieldNamespaceSchema,
  indexTypeSchema,
  sortOrderSchema
} from "./shared";

export const fieldSchema = z.object({
  kind: fieldKindSchema,
  name: z.string(),
  isRequired: z.boolean(),
  isList: z.boolean(),
  isUnique: z.boolean(),
  isId: z.boolean(),
  isReadOnly: z.boolean(),
  isGenerated: z.optional(z.boolean()),
  isUpdatedAt: z.optional(z.boolean()),
  type: z.string(),
  nativeType: z.optional(
    z.nullable(z.tuple([z.string(), z.array(z.string())]))
  ),
  dbName: z.optional(z.nullable(z.string())),
  hasDefaultValue: z.boolean(),
  default: z.optional(
    z.union([
      fieldDefaultSchema,
      fieldDefaultScalarSchema,
      z.array(fieldDefaultScalarSchema)
    ])
  ),
  relationFromFields: z.optional(z.array(z.string())),
  relationToFields: z.optional(z.array(z.string())),
  relationOnDelete: z.optional(z.string()),
  relationOnUpdate: z.optional(z.string()),
  relationName: z.optional(z.string()),
  documentation: z.optional(z.string())
});

export const uniqueIndexSchema = z.object({
  name: z.string(),
  fields: z.array(z.string())
});

export const primaryKeySchema = z.object({
  name: z.nullable(z.string()),
  fields: z.array(z.string())
});

export const indexFieldSchema = z.object({
  name: z.string(),
  sortOrder: z.optional(sortOrderSchema),
  length: z.optional(z.number()),
  operatorClass: z.optional(z.string())
});

export const indexSchema = z.object({
  model: z.string(),
  type: indexTypeSchema,
  isDefinedOnField: z.boolean(),
  name: z.optional(z.string()),
  dbName: z.optional(z.string()),
  algorithm: z.optional(z.string()),
  clustered: z.optional(z.boolean()),
  fields: z.array(indexFieldSchema)
});

export const enumValueSchema = z.object({
  name: z.string(),
  dbName: z.nullable(z.string())
});

export const datamodelEnumSchema = z.object({
  name: z.string(),
  values: z.array(enumValueSchema),
  dbName: z.optional(z.nullable(z.string())),
  documentation: z.optional(z.string())
});

export const schemaEnumSchema = z.object({
  name: z.string(),
  values: z.array(z.string())
});

export const modelSchema = z.object({
  name: z.string(),
  dbName: z.nullable(z.string()),
  schema: z.nullable(z.string()),
  fields: z.array(fieldSchema),
  uniqueFields: z.array(z.array(z.string())),
  uniqueIndexes: z.array(uniqueIndexSchema),
  documentation: z.optional(z.string()),
  primaryKey: z.nullable(primaryKeySchema),
  isGenerated: z.optional(z.boolean())
});

export const typeRefSchema = z.object({
  isList: z.boolean(),
  type: z.string(),
  location: fieldLocationSchema,
  namespace: z.optional(fieldNamespaceSchema)
});

export const inputTypeRefSchema = typeRefSchema;
export const outputTypeRefSchema = typeRefSchema;
export const fieldRefAllowTypeSchema = typeRefSchema;

export const schemaArgSchema = z.object({
  name: z.string(),
  comment: z.optional(z.string()),
  isNullable: z.boolean(),
  isRequired: z.boolean(),
  inputTypes: z.array(inputTypeRefSchema),
  isParameterizable: z.optional(z.boolean()),
  requiresOtherFields: z.optional(z.array(z.string())),
  deprecation: z.optional(
    z.object({
      sinceVersion: z.string(),
      reason: z.string(),
      plannedRemovalVersion: z.optional(z.string())
    })
  )
});

export const schemaFieldSchema = z.object({
  name: z.string(),
  isNullable: z.optional(z.boolean()),
  outputType: outputTypeRefSchema,
  args: z.array(schemaArgSchema),
  deprecation: z.optional(
    z.object({
      sinceVersion: z.string(),
      reason: z.string(),
      plannedRemovalVersion: z.optional(z.string())
    })
  ),
  documentation: z.optional(z.string())
});

export const inputTypeSchema = z.object({
  name: z.string(),
  constraints: z.object({
    maxNumFields: z.nullable(z.number()),
    minNumFields: z.nullable(z.number()),
    fields: z.optional(z.array(z.string()))
  }),
  meta: z.optional(
    z.object({
      source: z.optional(z.string()),
      grouping: z.optional(z.string())
    })
  ),
  fields: z.array(schemaArgSchema)
});

export const outputTypeSchema = z.object({
  name: z.string(),
  fields: z.array(schemaFieldSchema)
});

export const fieldRefTypeSchema = z.object({
  name: z.string(),
  allowTypes: z.array(fieldRefAllowTypeSchema),
  fields: z.array(schemaArgSchema)
});
