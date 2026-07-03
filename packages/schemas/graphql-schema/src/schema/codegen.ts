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

import type { LoadSchemaOptions } from "@graphql-tools/load";
import type { Source } from "@graphql-tools/utils";
import type { DocumentNode, GraphQLSchema } from "graphql";
import { parse, printSchema } from "graphql";

export type { Source } from "@graphql-tools/utils";

/** A GraphQL document source loaded from SDL, code, or introspection. */
export type GraphQLSourceDocument = Source;

/**
 * Default options used by GraphQL Code Generator when loading schemas.
 *
 * @see https://the-guild.dev/graphql/codegen/docs/config-reference/schema-field
 */
export const defaultSchemaLoadOptions = {
  assumeValidSDL: true,
  sort: true,
  convertExtensions: true,
  includeSources: true
} satisfies Omit<LoadSchemaOptions, "loaders">;

/**
 * Default options used by GraphQL Code Generator when loading executable documents.
 *
 * @see https://the-guild.dev/graphql/codegen/docs/config-reference/documents-field
 */
export const defaultDocumentsLoadOptions = {
  sort: true,
  skipGraphQLImport: true
};

/**
 * Returns schema sources attached by `@graphql-tools/load` when
 * {@link defaultSchemaLoadOptions.includeSources | includeSources} is enabled.
 */
export function getSchemaSources(schema: GraphQLSchema): Source[] {
  const sources = schema.extensions?.sources;

  return Array.isArray(sources) ? (sources as Source[]) : [];
}

/**
 * Converts a loaded {@link GraphQLSchema} into the AST shape expected by
 * `@graphql-codegen/core` programmatic configuration.
 */
export function schemaToCodegenDocument(schema: GraphQLSchema): DocumentNode {
  return parse(printSchema(schema));
}
