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
import { isScalarType } from "graphql";
import type * as z from "zod/mini";
import packageJson from "../package.json" with { type: "json" };
import { graphqlSchema } from "./schema";

export * from "./schema";
export type GraphQLSchema = z.infer<typeof graphqlSchema>;

export default defineSchema<GraphQLSchema, any>({
  meta: {
    name: "graphql-schema",
    title: "GraphQL Schema",
    version: packageJson.version,
    description:
      "A GraphQL schema document used to describe a GraphQL API. This schema is compatible with the GraphQL specification and can be used to validate and generate code from the schema. Some examples of tools that can be used to generate client and/or server libraries, documentation, and other tools are: GraphQL Code Generator, GraphQL Yoga, Apollo Server, and many more.",
    spec: (spec: GraphQLSchema) => {
      if (spec.description) {
        return spec.description;
      }

      const rootTypes = [
        spec.getQueryType()?.name,
        spec.getMutationType()?.name,
        spec.getSubscriptionType()?.name
      ].filter((name): name is string => name != null);

      if (rootTypes.length > 0) {
        return `A GraphQL API schema with ${rootTypes.join(", ")} root operation type${
          rootTypes.length === 1 ? "" : "s"
        }.`;
      }

      return "A GraphQL API schema.";
    },
    tags: (spec: GraphQLSchema) =>
      Object.keys(spec.getTypeMap()).filter(name => !name.startsWith("__")),
    links: (spec: GraphQLSchema) => {
      const links: Array<{ href: string; description?: string }> = [];

      for (const type of Object.values(spec.getTypeMap())) {
        if (isScalarType(type) && type.specifiedByURL) {
          links.push({
            href: type.specifiedByURL,
            description: type.description ?? `${type.name} scalar specification`
          });
        }
      }

      return links;
    }
  },
  schema: graphqlSchema
});
