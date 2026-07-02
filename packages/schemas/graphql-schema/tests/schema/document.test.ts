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

import {
  buildSchema,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from "graphql";
import { describe, expect, it } from "vitest";
import {
  graphqlSchema,
  graphqlSchemaConfigSchema,
  graphqlSchemaNormalizedConfigSchema
} from "../../src/schema/index";

describe("graphqlSchema", () => {
  it("accepts a GraphQLSchema instance with a query root", () => {
    const schema = buildSchema(`
      type Query {
        greeting: String
      }
    `);

    expect(graphqlSchema.safeParse(schema).success).toBe(true);
  });

  it("rejects values that are not GraphQLSchema instances", () => {
    expect(graphqlSchema.safeParse(GraphQLString).success).toBe(false);
    expect(graphqlSchema.safeParse({}).success).toBe(false);
  });

  it("rejects schemas without root operation types", () => {
    const schema = new GraphQLSchema({});

    expect(graphqlSchema.safeParse(schema).success).toBe(false);
  });
});

describe("graphqlSchemaConfigSchema", () => {
  it("accepts a valid GraphQLSchemaConfig", () => {
    const query = new GraphQLObjectType({
      name: "Query",
      fields: {
        greeting: { type: GraphQLString }
      }
    });

    expect(
      graphqlSchemaConfigSchema.safeParse({
        description: "Example schema",
        query,
        extensions: { owner: "platform" }
      }).success
    ).toBe(true);
  });
});

describe("graphqlSchemaNormalizedConfigSchema", () => {
  it("accepts the output of GraphQLSchema.toConfig()", () => {
    const schema = buildSchema(`
      type Query {
        greeting: String
      }
    `);

    expect(
      graphqlSchemaNormalizedConfigSchema.safeParse(schema.toConfig()).success
    ).toBe(true);
  });
});
