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
  datamodelEnumSchema,
  fieldRefTypeSchema,
  indexSchema,
  inputTypeSchema,
  modelSchema,
  outputTypeSchema,
  schemaEnumSchema
} from "./field";

/**
 * Prisma DMMF datamodel section — models, enums, composite types, and indexes.
 *
 * @see https://github.com/prisma/prisma/blob/main/packages/dmmf/src/dmmf.ts
 */
export const datamodelSchema = z.object({
  models: z.array(modelSchema),
  enums: z.array(datamodelEnumSchema),
  types: z.array(modelSchema),
  indexes: z.array(indexSchema)
});

/**
 * Prisma DMMF schema section — GraphQL-like query/mutation type graphs.
 *
 * @see https://github.com/prisma/prisma/blob/main/packages/dmmf/src/dmmf.ts
 */
export const dmmfSchemaTypesSchema = z.object({
  rootQueryType: z.optional(z.string()),
  rootMutationType: z.optional(z.string()),
  inputObjectTypes: z.object({
    model: z.optional(z.array(inputTypeSchema)),
    prisma: z.optional(z.array(inputTypeSchema))
  }),
  outputObjectTypes: z.object({
    model: z.array(outputTypeSchema),
    prisma: z.array(outputTypeSchema)
  }),
  enumTypes: z.object({
    model: z.optional(z.array(schemaEnumSchema)),
    prisma: z.array(schemaEnumSchema)
  }),
  fieldRefTypes: z.object({
    prisma: z.optional(z.array(fieldRefTypeSchema))
  })
});

/**
 * Prisma DMMF model operation mappings (findMany, create, …).
 *
 * @see https://github.com/prisma/prisma/blob/main/packages/dmmf/src/dmmf.ts
 */
export const modelMappingSchema = z.object({
  model: z.string(),
  plural: z.optional(z.string()),
  findUnique: z.optional(z.nullable(z.string())),
  findUniqueOrThrow: z.optional(z.nullable(z.string())),
  findFirst: z.optional(z.nullable(z.string())),
  findFirstOrThrow: z.optional(z.nullable(z.string())),
  findMany: z.optional(z.nullable(z.string())),
  create: z.optional(z.nullable(z.string())),
  createMany: z.optional(z.nullable(z.string())),
  createManyAndReturn: z.optional(z.nullable(z.string())),
  update: z.optional(z.nullable(z.string())),
  updateMany: z.optional(z.nullable(z.string())),
  updateManyAndReturn: z.optional(z.nullable(z.string())),
  upsert: z.optional(z.nullable(z.string())),
  delete: z.optional(z.nullable(z.string())),
  deleteMany: z.optional(z.nullable(z.string())),
  aggregate: z.optional(z.nullable(z.string())),
  groupBy: z.optional(z.nullable(z.string())),
  count: z.optional(z.nullable(z.string())),
  findRaw: z.optional(z.nullable(z.string())),
  aggregateRaw: z.optional(z.nullable(z.string()))
});

export const mappingsSchema = z.object({
  modelOperations: z.array(modelMappingSchema),
  otherOperations: z.object({
    read: z.array(z.string()),
    write: z.array(z.string())
  })
});
