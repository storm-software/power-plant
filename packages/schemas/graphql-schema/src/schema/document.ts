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

import type { GraphQLSchema } from "graphql";
import { isSchema } from "graphql";
import * as z from "zod/mini";

function hasRootOperationType(schema: GraphQLSchema): boolean {
  return (
    schema.getQueryType() != null ||
    schema.getMutationType() != null ||
    schema.getSubscriptionType() != null
  );
}

/**
 * Validates a {@link GraphQLSchema} instance from the `graphql` package.
 *
 * The schema must define at least one root operation type (query, mutation, or
 * subscription).
 */
export const graphqlSchema = z
  .custom<GraphQLSchema>(
    value => isSchema(value) && hasRootOperationType(value),
    "Expected a GraphQLSchema instance with at least one root operation type"
  )
  .check(
    z.superRefine((schema, context) => {
      const typeMap = schema.getTypeMap();

      for (const [typeName, namedType] of Object.entries(typeMap)) {
        if (namedType.name !== typeName) {
          context.addIssue({
            code: "custom",
            message: `Type map entry "${typeName}" does not match type name "${namedType.name}"`,
            path: ["types", typeName]
          });
        }
      }
    })
  );
