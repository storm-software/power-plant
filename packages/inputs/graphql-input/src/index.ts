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
import { isFileReference } from "@stryke/resolve/type-checks";
import { isString } from "@stryke/type-checks/is-string";
import { isURL } from "@stryke/type-checks/is-url";
import { input } from "./input";
import type { Options } from "./types";

export { createSchemaLoaders } from "./loaders";
export type { Options } from "./types";
export { toSchemaPointer } from "./utilities";

export default defineInput<GraphQLSchema, Options>({
  meta: {
    name: "graphql-input",
    description:
      "An input extension that reads the specification from a GraphQL schema document using loaders defined in GraphQL-Tools packages.",
    readFrom: (_spec: GraphQLSchema, options: Options) =>
      `Reads the GraphQL schema from ${
        isString(options.inputPath)
          ? `"${options.inputPath}"`
          : isURL(options.inputPath)
            ? `the remote source at "${options.inputPath.toString()}"`
            : isFileReference(options.inputPath)
              ? `the file at "${options.inputPath.file}"`
              : "a specified schema source"
      }.`,
    version: "1.0",
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
