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

import { defineSchema } from "@power-plant/core";
import type * as z from "zod/mini";
import packageJson from "../package.json";
import { openapiSchema } from "./schema";

export * from "./schema";
export type OpenAPISchema = z.infer<typeof openapiSchema>;

export default defineSchema<OpenAPISchema>({
  meta: {
    name: "openapi-schema",
    title: "OpenAPI Schema",
    version: packageJson.version,
    description:
      "An OpenAPI 3.0, 3.1, or 3.2 specification document used to describe HTTP APIs.",
    spec: "An OpenAPI HTTP API specification.",
    tags: ["openapi"],
    links: [
      {
        name: "OpenAPI Specification",
        url: "https://www.openapis.org/"
      }
    ]
  },
  schema: openapiSchema
});
