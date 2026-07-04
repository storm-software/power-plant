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

import { schemas } from "@asyncapi/specs";
import { defineSchema } from "@power-plant/core";
import { z } from "zod";
import packageJson from "../package.json" with { type: "json" };

const asyncapiSchema = z.fromJSONSchema(
  schemas["3.1.0"] as z.core.JSONSchema.JSONSchema,
  { defaultTarget: "draft-7" }
);
export type AsyncAPISchema = z.infer<typeof asyncapiSchema>;

export default defineSchema<AsyncAPISchema, any>({
  meta: {
    name: "asyncapi-schema",
    title: "AsyncAPI Schema",
    version: packageJson.version,
    description:
      "An AsyncAPI specification document used to describe event-driven APIs.",
    tags: ["asyncapi"],
    links: [
      {
        href: "https://www.asyncapi.com",
        description: "AsyncAPI Documentation"
      },
      {
        href: "https://github.com/asyncapi/spec-json-schemas",
        description: "AsyncAPI GitHub Repository"
      },
      {
        href: "https://www.asyncapi.com/docs/reference/specification/v3.1.0",
        description: "AsyncAPI 3.1.0 Specification"
      }
    ]
  },
  schema: asyncapiSchema
});
