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

import type { SchemaConfigObject } from "@power-plant/core";
import { defineSchema } from "@power-plant/core/schema/define";
import type * as z from "zod/mini";
import packageJson from "../package.json" with { type: "json" };
import { openapiSchema } from "./schema";

export * from "./schema";
export type OpenAPISchema = z.infer<typeof openapiSchema>;

const schema: SchemaConfigObject<OpenAPISchema, any> = defineSchema<
  OpenAPISchema,
  any
>({
  meta: {
    name: "openapi",
    title: "OpenAPI",
    version: packageJson.version,
    description:
      "An OpenAPI 3.0, 3.1, or 3.2 specification document used to describe HTTP APIs.",
    spec: (spec: OpenAPISchema) =>
      spec.info.title
        ? `The ${
            spec.info.version ? `${spec.info.version} version of the ` : ""
          }${spec.info.title} HTTP API.${
            spec.info.description
              ? ` ${spec.info.description}`
              : spec.info.summary
                ? ` ${spec.info.summary}`
                : ""
          }`
        : spec.info.description
          ? ` ${spec.info.description}`
          : spec.info.summary
            ? ` ${spec.info.summary}`
            : "",
    tags: (spec: OpenAPISchema) => spec.tags?.map(tag => tag.name) ?? [],
    links: (spec: OpenAPISchema) =>
      spec.externalDocs
        ? [
            {
              href: spec.externalDocs.url,
              description: spec.externalDocs.description
            }
          ]
        : []
  },
  schema: openapiSchema
});

export default schema;
