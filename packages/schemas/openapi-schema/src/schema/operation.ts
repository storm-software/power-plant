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

import { jsonSchema, refOr } from "@power-plant/schema/zod";
import * as z from "zod/mini";
import {
  headerSchema,
  parameterSchema,
  requestBodySchema,
  responseSchema
} from "./content";
import { securityRequirementSchema, securitySchemeSchema } from "./security";
import { exampleSchema, externalDocsSchema, serverSchema } from "./shared";

export const operationSchema = z.object({
  tags: z.optional(z.array(z.string())),
  summary: z.optional(z.string()),
  description: z.optional(z.string()),
  externalDocs: z.optional(externalDocsSchema),
  operationId: z.optional(z.string()),
  parameters: z.optional(z.array(refOr(parameterSchema))),
  requestBody: z.optional(refOr(requestBodySchema)),
  responses: z
    .record(z.string(), refOr(responseSchema))
    .check(
      z.refine(
        value => Object.keys(value).length > 0,
        "At least one response must be defined for an operation"
      )
    ),
  callbacks: z.optional(z.record(z.string(), z.unknown())),
  deprecated: z.optional(z.boolean()),
  security: z.optional(z.array(securityRequirementSchema)),
  servers: z.optional(z.array(serverSchema))
});

const httpMethodSchema = z.optional(operationSchema);

export const pathItemSchema = z
  .object({
    $ref: z.optional(z.string()),
    summary: z.optional(z.string()),
    description: z.optional(z.string()),
    servers: z.optional(z.array(serverSchema)),
    parameters: z.optional(z.array(refOr(parameterSchema))),
    get: httpMethodSchema,
    put: httpMethodSchema,
    post: httpMethodSchema,
    delete: httpMethodSchema,
    options: httpMethodSchema,
    head: httpMethodSchema,
    patch: httpMethodSchema,
    trace: httpMethodSchema
  })
  .check(
    z.refine(
      value =>
        Boolean(
          value.get ??
          value.put ??
          value.post ??
          value.delete ??
          value.options ??
          value.head ??
          value.patch ??
          value.trace ??
          value.$ref
        ),
      "Path item must define at least one HTTP operation or a $ref"
    )
  );

export const componentsSchema = z.object({
  schemas: z.optional(z.record(z.string(), jsonSchema)),
  responses: z.optional(z.record(z.string(), refOr(responseSchema))),
  parameters: z.optional(z.record(z.string(), refOr(parameterSchema))),
  examples: z.optional(z.record(z.string(), refOr(exampleSchema))),
  requestBodies: z.optional(z.record(z.string(), refOr(requestBodySchema))),
  headers: z.optional(z.record(z.string(), refOr(headerSchema))),
  securitySchemes: z.optional(z.record(z.string(), securitySchemeSchema)),
  links: z.optional(z.record(z.string(), z.unknown())),
  callbacks: z.optional(z.record(z.string(), z.unknown())),
  pathItems: z.optional(z.record(z.string(), refOr(pathItemSchema)))
});
