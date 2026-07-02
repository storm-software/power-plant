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

import type { GraphQLSchemaConfig, SchemaExtensionNode } from "graphql";
import { Kind } from "graphql";
import * as z from "zod/mini";
import {
  astNodeSchema,
  descriptionSchema,
  extensionAstNodesSchema,
  extensionsSchema
} from "./shared";
import {
  graphQLDirectiveSchema,
  graphQLNamedTypeSchema,
  graphQLObjectTypeSchema
} from "./value";

/** Configuration used to construct a {@link GraphQLSchema}. */
export const graphqlSchemaConfigSchema = z.object({
  assumeValid: z.optional(z.boolean()),
  description: descriptionSchema,
  query: z.optional(graphQLObjectTypeSchema),
  mutation: z.optional(graphQLObjectTypeSchema),
  subscription: z.optional(graphQLObjectTypeSchema),
  types: z.optional(z.array(graphQLNamedTypeSchema)),
  directives: z.optional(z.array(graphQLDirectiveSchema)),
  extensions: z.optional(extensionsSchema),
  astNode: astNodeSchema,
  extensionASTNodes: extensionAstNodesSchema
}) satisfies z.ZodMiniType<GraphQLSchemaConfig>;

/** Normalized configuration returned by {@link GraphQLSchema.toConfig}. */
export const graphqlSchemaNormalizedConfigSchema = z.object({
  assumeValid: z.boolean(),
  description: z.optional(z.string()),
  query: z.optional(graphQLObjectTypeSchema),
  mutation: z.optional(graphQLObjectTypeSchema),
  subscription: z.optional(graphQLObjectTypeSchema),
  types: z.array(graphQLNamedTypeSchema),
  directives: z.array(graphQLDirectiveSchema),
  extensions: extensionsSchema,
  astNode: astNodeSchema,
  extensionASTNodes: z.array(
    z.custom<SchemaExtensionNode>(
      value =>
        value != null &&
        typeof value === "object" &&
        "kind" in value &&
        value.kind === Kind.SCHEMA_EXTENSION,
      "Expected a SchemaExtensionNode"
    )
  )
});
