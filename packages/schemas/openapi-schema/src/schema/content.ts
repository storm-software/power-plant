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

import { jsonSchema } from "./json-schema";
import { refOr, referenceSchema } from "./reference";
import { exampleSchema } from "./shared";

export const parameterLocationSchema = z.enum([
  "query",
  "header",
  "path",
  "cookie"
]);

export const parameterSchema = z.union([
  referenceSchema,
  z.object({
    name: z.string().check(z.minLength(1, "Parameter name is required")),
    in: parameterLocationSchema,
    description: z.optional(z.string()),
    required: z.optional(z.boolean()),
    deprecated: z.optional(z.boolean()),
    allowEmptyValue: z.optional(z.boolean()),
    style: z.optional(z.string()),
    explode: z.optional(z.boolean()),
    allowReserved: z.optional(z.boolean()),
    schema: z.optional(jsonSchema),
    example: z.optional(z.unknown()),
    examples: z.optional(z.record(z.string(), refOr(exampleSchema)))
  })
]);

export const headerSchema = z.union([
  referenceSchema,
  z.object({
    description: z.optional(z.string()),
    required: z.optional(z.boolean()),
    deprecated: z.optional(z.boolean()),
    schema: z.optional(jsonSchema),
    example: z.optional(z.unknown()),
    examples: z.optional(z.record(z.string(), refOr(exampleSchema)))
  })
]);

export const mediaTypeSchema = z.object({
  schema: z.optional(jsonSchema),
  example: z.optional(z.unknown()),
  examples: z.optional(z.record(z.string(), refOr(exampleSchema))),
  encoding: z.optional(
    z.record(
      z.string(),
      z.object({
        contentType: z.optional(z.string()),
        headers: z.optional(z.record(z.string(), refOr(headerSchema))),
        style: z.optional(z.string()),
        explode: z.optional(z.boolean()),
        allowReserved: z.optional(z.boolean())
      })
    )
  )
});

export const requestBodySchema = z.union([
  referenceSchema,
  z
    .object({
      description: z.optional(z.string()),
      content: z.record(z.string(), mediaTypeSchema),
      required: z.optional(z.boolean())
    })
    .check(
      z.refine(
        value => Object.keys(value.content).length > 0,
        "Request body content must include at least one media type"
      )
    )
]);

export const responseSchema = z.union([
  referenceSchema,
  z.object({
    description: z
      .string()
      .check(z.minLength(1, "Response description is required")),
    headers: z.optional(z.record(z.string(), refOr(headerSchema))),
    content: z.optional(z.record(z.string(), mediaTypeSchema)),
    links: z.optional(z.record(z.string(), z.unknown()))
  })
]);

export const responsesSchema = z
  .record(z.string(), refOr(responseSchema))
  .check(
    z.refine(
      value => Object.keys(value).length > 0,
      "At least one response must be defined for an operation"
    )
  );

export type Parameter = z.infer<typeof parameterSchema>;
export type RequestBody = z.infer<typeof requestBodySchema>;
export type Response = z.infer<typeof responseSchema>;
