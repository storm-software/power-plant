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

const oauthFlowSchema = z.object({
  authorizationUrl: z.optional(z.url()),
  tokenUrl: z.optional(z.url()),
  refreshUrl: z.optional(z.url()),
  scopes: z.record(z.string(), z.string())
});

export const securitySchemeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("apiKey"),
    name: z.string().check(z.minLength(1, "API key name is required")),
    in: z.enum(["query", "header", "cookie"]),
    description: z.optional(z.string())
  }),
  z.object({
    type: z.literal("http"),
    scheme: z.string().check(z.minLength(1, "HTTP auth scheme is required")),
    bearerFormat: z.optional(z.string()),
    description: z.optional(z.string())
  }),
  z.object({
    type: z.literal("oauth2"),
    description: z.optional(z.string()),
    flows: z.object({
      implicit: z.optional(oauthFlowSchema),
      password: z.optional(oauthFlowSchema),
      clientCredentials: z.optional(oauthFlowSchema),
      authorizationCode: z.optional(oauthFlowSchema)
    })
  }),
  z.object({
    type: z.literal("openIdConnect"),
    openIdConnectUrl: z.url(),
    description: z.optional(z.string())
  })
]);

export const securityRequirementSchema = z.record(
  z.string(),
  z.array(z.string())
);

export type SecurityScheme = z.infer<typeof securitySchemeSchema>;
export type SecurityRequirement = z.infer<typeof securityRequirementSchema>;
