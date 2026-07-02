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

import type * as z from "zod/mini";
import type {
  graphqlSchemaConfigSchema,
  graphqlSchemaNormalizedConfigSchema
} from "./definition";

export {
  graphqlSchemaConfigSchema,
  graphqlSchemaNormalizedConfigSchema
} from "./definition";
export { graphqlSchema } from "./document";
export {
  astNodeSchema,
  descriptionSchema,
  extensionAstNodesSchema,
  extensionsSchema
} from "./shared";
export {
  graphQLDirectiveSchema,
  graphQLNamedTypeSchema,
  graphQLObjectTypeSchema,
  graphQLTypeSchema
} from "./value";

export type GraphQLSchemaConfigDocument = z.infer<
  typeof graphqlSchemaConfigSchema
>;
export type GraphQLSchemaNormalizedConfigDocument = z.infer<
  typeof graphqlSchemaNormalizedConfigSchema
>;
