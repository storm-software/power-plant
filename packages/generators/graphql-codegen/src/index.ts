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

import { codegen } from "@graphql-codegen/core";
import type { Types } from "@graphql-codegen/plugin-helpers";
import type { GeneratedDocument } from "@power-plant/core";
import { defineGenerator } from "@power-plant/core";
import type { GraphQLSchema } from "@power-plant/graphql-schema";
import schema from "@power-plant/graphql-schema";
import packageJson from "../package.json" with { type: "json" };

export type Options = Types.GenerateOptions;

export default defineGenerator<GraphQLSchema, Options, void>({
  meta: {
    name: "graphql-codegen",
    description:
      "A generator that uses GraphQL Codegen to generate source code from a GraphQL schema.",
    version: packageJson.version,
    tags: ["graphql", "graphql-codegen"]
  },
  schema,
  generator: async (
    spec,
    options
  ): Promise<GeneratedDocument<GraphQLSchema, Options>[]> => {
    const output = await codegen({
      ...options
    });

    return [
      {
        path: options.filename,
        source: [
          {
            content: output
          }
        ]
      }
    ];
  }
});
