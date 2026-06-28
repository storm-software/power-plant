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

export const contactSchema = z.object({
  name: z.optional(z.string()),
  url: z.optional(z.url()),
  email: z.optional(z.email())
});

export const licenseSchema = z.object({
  name: z.string().check(z.minLength(1, "License name is required")),
  url: z.optional(z.url()),
  identifier: z.optional(z.string())
});

export const infoSchema = z.object({
  title: z.string().check(z.minLength(1, "API title is required")),
  version: z.string().check(z.minLength(1, "API version is required")),
  description: z.optional(z.string()),
  termsOfService: z.optional(z.url()),
  contact: z.optional(contactSchema),
  license: z.optional(licenseSchema),
  summary: z.optional(z.string())
});

export const serverVariableSchema = z.object({
  default: z.string(),
  enum: z.optional(z.array(z.string())),
  description: z.optional(z.string())
});

export const serverSchema = z.object({
  url: z.string().check(z.minLength(1, "Server URL is required")),
  description: z.optional(z.string()),
  variables: z.optional(z.record(z.string(), serverVariableSchema))
});

export const tagSchema = z.object({
  name: z.string().check(z.minLength(1, "Tag name is required")),
  description: z.optional(z.string()),
  externalDocs: z.optional(
    z.object({
      description: z.optional(z.string()),
      url: z.url()
    })
  )
});

export const exampleSchema = z.object({
  summary: z.optional(z.string()),
  description: z.optional(z.string()),
  value: z.optional(z.unknown()),
  externalValue: z.optional(z.url()),
  $ref: z.optional(z.string())
});

export const externalDocsSchema = z.object({
  description: z.optional(z.string()),
  url: z.url()
});
