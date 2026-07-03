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

import { ApolloEngineLoader } from "@graphql-tools/apollo-engine-loader";
import type { CodeFileLoaderConfig } from "@graphql-tools/code-file-loader";
import { CodeFileLoader } from "@graphql-tools/code-file-loader";
import { GitLoader } from "@graphql-tools/git-loader";
import { GithubLoader } from "@graphql-tools/github-loader";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { JsonFileLoader } from "@graphql-tools/json-file-loader";
import { UrlLoader } from "@graphql-tools/url-loader";
import type { Loader } from "@graphql-tools/utils";

/**
 * Creates the schema loaders used by GraphQL Code Generator.
 *
 * @see https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-cli/src/load.ts
 *
 * @param config - The configuration for the code file loader.
 * @returns The schema loaders.
 */
export function createSchemaLoaders(
  config?: CodeFileLoaderConfig
): Loader<any>[] {
  return [
    new CodeFileLoader(config),
    new GitLoader(),
    new GithubLoader(),
    new GraphQLFileLoader(),
    new JsonFileLoader(),
    new UrlLoader(),
    new ApolloEngineLoader()
  ];
}
