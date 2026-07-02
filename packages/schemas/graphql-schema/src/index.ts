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
import packageJson from "../package.json" with { type: "json" };
import { graphqlSchema } from "./schema";

export * from "./schema";
export type GraphQLSchema = z.infer<typeof graphqlSchema>;

export default defineSchema<GraphQLSchema, any>({
  meta: {
    name: "graphql",
    title: "GraphQL",
    version: packageJson.version,
    description: "A GraphQL schema document used to describe a GraphQL API.",
    spec: (spec: GraphQLSchema) =>
      spec.info.title
        ? `The ${
            spec.info.version ? `${spec.info.version} version of the ` : ""
          }${spec.info.title} GraphQL API.${
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
    tags: (spec: GraphQLSchema) => spec.tags?.map(tag => tag.name) ?? [],
    links: (spec: GraphQLSchema) =>
      spec.externalDocs
        ? [
            {
              href: spec.externalDocs.url,
              description: spec.externalDocs.description
            }
          ]
        : []
  },
  schema: graphqlSchema
});
