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
import { enumerantSchema, fieldSchema, methodSchema } from "./field";
import { typeIdSchema } from "./shared";
import { capnpTypeSchema } from "./type";

const nestedNodeRefSchema = z.object({
  name: z.string(),
  id: typeIdSchema
});

/**
 * Cap'n Proto struct definition (including groups / named unions).
 *
 * @see https://capnproto.org/language.html#structs
 */
export const structSchema = z.object({
  kind: z.literal("struct"),
  name: z.string(),
  id: typeIdSchema,
  displayName: z.optional(z.string()),
  documentation: z.optional(z.string()),
  isGroup: z.boolean(),
  parameters: z.array(z.string()),
  fields: z.array(fieldSchema),
  nestedNodes: z.array(nestedNodeRefSchema),
  discriminantCount: z.optional(z.number()),
  dataWordCount: z.optional(z.number()),
  pointerCount: z.optional(z.number())
});

/**
 * Cap'n Proto enum definition.
 *
 * @see https://capnproto.org/language.html#enums
 */
export const enumSchema = z.object({
  kind: z.literal("enum"),
  name: z.string(),
  id: typeIdSchema,
  displayName: z.optional(z.string()),
  documentation: z.optional(z.string()),
  enumerants: z.array(enumerantSchema)
});

/**
 * Cap'n Proto interface definition.
 *
 * @see https://capnproto.org/language.html#interfaces
 */
export const interfaceSchema = z.object({
  kind: z.literal("interface"),
  name: z.string(),
  id: typeIdSchema,
  displayName: z.optional(z.string()),
  documentation: z.optional(z.string()),
  parameters: z.array(z.string()),
  superclasses: z.array(typeIdSchema),
  methods: z.array(methodSchema),
  nestedNodes: z.array(nestedNodeRefSchema)
});

/**
 * Cap'n Proto constant definition.
 *
 * @see https://capnproto.org/language.html#constants
 */
export const constantSchema = z.object({
  kind: z.literal("const"),
  name: z.string(),
  id: typeIdSchema,
  displayName: z.optional(z.string()),
  documentation: z.optional(z.string()),
  type: capnpTypeSchema
});

/**
 * Cap'n Proto annotation declaration targets.
 *
 * @see https://capnproto.org/language.html#annotations
 */
export const annotationTargetsSchema = z.object({
  file: z.boolean(),
  const: z.boolean(),
  enum: z.boolean(),
  enumerant: z.boolean(),
  struct: z.boolean(),
  field: z.boolean(),
  union: z.boolean(),
  group: z.boolean(),
  interface: z.boolean(),
  method: z.boolean(),
  param: z.boolean(),
  annotation: z.boolean()
});

export const annotationDefSchema = z.object({
  kind: z.literal("annotation"),
  name: z.string(),
  id: typeIdSchema,
  displayName: z.optional(z.string()),
  documentation: z.optional(z.string()),
  type: capnpTypeSchema,
  targets: annotationTargetsSchema
});

export const importSchema = z.object({
  id: typeIdSchema,
  name: z.string()
});

/**
 * A compiled Cap'n Proto schema file and its top-level definitions.
 *
 * @see https://capnproto.org/language.html
 */
export const fileSchema = z.object({
  kind: z.literal("file"),
  path: z.string(),
  id: typeIdSchema,
  displayName: z.optional(z.string()),
  documentation: z.optional(z.string()),
  imports: z.array(importSchema),
  nestedNodes: z.array(nestedNodeRefSchema),
  structs: z.array(structSchema),
  enums: z.array(enumSchema),
  interfaces: z.array(interfaceSchema),
  constants: z.array(constantSchema),
  annotations: z.array(annotationDefSchema)
});
