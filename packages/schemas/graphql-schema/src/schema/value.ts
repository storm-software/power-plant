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

import type {
  GraphQLDirective,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLType
} from "graphql";
import { isDirective, isNamedType, isObjectType, isType } from "graphql";
import * as z from "zod/mini";

export const graphQLTypeSchema = z.custom<GraphQLType>(
  value => isType(value),
  "Expected a GraphQL type"
);

export const graphQLNamedTypeSchema = z.custom<GraphQLNamedType>(
  value => isNamedType(value),
  "Expected a GraphQL named type"
);

export const graphQLObjectTypeSchema = z.custom<GraphQLObjectType>(
  value => isObjectType(value),
  "Expected a GraphQL object type"
);

export const graphQLDirectiveSchema = z.custom<GraphQLDirective>(
  value => isDirective(value),
  "Expected a GraphQL directive"
);
