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

import { defineInput } from "@power-plant/core";
import type { GraphQLSchema } from "@power-plant/graphql-schema";
import packageJson from "../package.json";
import { input } from "./input";
import type { Options } from "./types";

export default defineInput<GraphQLSchema, Options>({
  meta: {
    name: "graphql-input",
    description:
      "An input extension that reads the specification from a GraphQL schema document using loaders defined in GraphQL-Tools packages.",
    usage:
      "Reads the GraphQL schema from a file path, remote URL, or schema loader source configured via inputPath.",
    version: packageJson.version,
    tags: ["graphql"],
    links: [
      {
        href: "https://the-guild.dev/graphql/tools",
        description: "GraphQL Tools"
      },
      {
        href: "https://github.com/ardatan/graphql-tools",
        description: "GraphQL Tools - repository"
      },
      {
        href: "https://the-guild.dev/graphql/tools/docs/schema-loading",
        description: "GraphQL Tools - Schema Loading"
      },
      {
        href: "https://the-guild.dev/graphql/tools/docs/documents-loading",
        description: "GraphQL specification - Documents Loading"
      }
    ]
  },
  input
});
