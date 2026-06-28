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

import type { OpenAPIDocument } from "../types/openapi";
import { componentsSchema, pathItemSchema } from "./operation";
import { securityRequirementSchema } from "./security";
import {
  externalDocsSchema,
  infoSchema,
  serverSchema,
  tagSchema
} from "./shared";

const openapiVersionSchema = z
  .string()
  .check(
    z.regex(
      /^3\.([012])\.\d+$/,
      "OpenAPI version must be 3.0.x, 3.1.x, or 3.2.x"
    )
  );

export const openapiSchema: z.ZodMiniType<OpenAPIDocument> = z
  .object({
    openapi: openapiVersionSchema,
    info: infoSchema,
    servers: z.optional(z.array(serverSchema)),
    paths: z
      .record(z.string(), pathItemSchema)
      .check(
        z.refine(
          value => Object.keys(value).length > 0,
          "At least one path must be defined"
        )
      ),
    webhooks: z.optional(z.record(z.string(), pathItemSchema)),
    components: z.optional(componentsSchema),
    security: z.optional(z.array(securityRequirementSchema)),
    tags: z.optional(z.array(tagSchema)),
    externalDocs: z.optional(externalDocsSchema),
    jsonSchemaDialect: z.optional(z.url())
  })
  .check(
    z.superRefine((document, context) => {
      if (!document.security?.length || !document.components?.securitySchemes) {
        return;
      }

      const definedSchemes = new Set(
        Object.keys(document.components.securitySchemes)
      );

      for (const requirement of document.security) {
        for (const schemeName of Object.keys(requirement)) {
          if (!definedSchemes.has(schemeName)) {
            context.addIssue({
              code: "custom",
              message: `Security scheme "${schemeName}" is referenced but not defined in components.securitySchemes`,
              path: ["security"]
            });
          }
        }
      }
    })
  );

export type { OpenAPIDocument } from "../types/openapi";
