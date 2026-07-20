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
import { graphqlSchema } from "./schema";

export * from "./schema";
export type GraphQLSchema = z.infer<typeof graphqlSchema>;

export default defineSchema<GraphQLSchema>({
  meta: {
    name: "graphql-schema",
    title: "GraphQL Schema",
    version: "1.0",
    description:
      "A GraphQL schema document used to describe a GraphQL API. This schema is compatible with the GraphQL specification and can be used to validate and generate code from the schema. Some examples of tools that can be used to generate client and/or server libraries, documentation, and other tools are: GraphQL Code Generator, GraphQL Yoga, Apollo Server, and many more.",
    spec: "A GraphQL API schema.",
    tags: ["graphql"]
  },
  schema: graphqlSchema
});
