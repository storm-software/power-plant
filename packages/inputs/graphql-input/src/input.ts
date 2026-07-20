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

import { loadSchema } from "@graphql-tools/load";
import { useContext } from "@power-plant/core/context";
import type { GraphQLSchema } from "@power-plant/graphql-schema";
import { defaultSchemaLoadOptions } from "@power-plant/graphql-schema/codegen";
import { createSchemaLoaders } from "./loaders";
import type { Options } from "./types";
import { formatLoadError, toSchemaPointer } from "./utilities";

/**
 * Loads a GraphQL schema from the configured pointer using the same loaders and defaults as GraphQL Code Generator.
 *
 * @see https://the-guild.dev/graphql/codegen/docs/advanced/programmatic-usage
 * @see https://the-guild.dev/graphql/tools/docs/documents-loading
 *
 * @param options - The options for the input.
 * @returns A loaded {@link GraphQLSchema} instance.
 */
export async function input(options: Options): Promise<GraphQLSchema> {
  const { inputPath, ...rest } = options;
  const { cwd } = useContext();

  const pointer = toSchemaPointer(inputPath);

  try {
    return await loadSchema(pointer, {
      ...defaultSchemaLoadOptions,
      cwd,
      loaders: createSchemaLoaders(rest),
      ...rest
    });
  } catch (error) {
    throw new Error(
      [
        `Failed to load GraphQL schema from ${String(pointer)}:`,
        formatLoadError(error),
        "",
        "Supported schema sources include:",
        "- ES Modules and CommonJS exports (default or named export `schema`)",
        "- Introspection JSON files",
        "- GraphQL endpoint URLs",
        "- SDL files and glob expressions",
        "- Inline SDL strings"
      ].join("\n")
    );
  }
}
