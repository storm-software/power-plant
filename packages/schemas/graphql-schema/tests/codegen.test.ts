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

import { buildSchema } from "graphql";
import { describe, expect, it } from "vitest";
import {
  defaultDocumentsLoadOptions,
  defaultSchemaLoadOptions,
  getSchemaSources,
  schemaToCodegenDocument
} from "../src/schema/index";

describe("defaultSchemaLoadOptions", () => {
  it("matches GraphQL Code Generator defaults", () => {
    expect(defaultSchemaLoadOptions).toEqual({
      assumeValidSDL: true,
      sort: true,
      convertExtensions: true,
      includeSources: true
    });
  });
});

describe("defaultDocumentsLoadOptions", () => {
  it("matches GraphQL Code Generator defaults", () => {
    expect(defaultDocumentsLoadOptions).toEqual({
      sort: true,
      skipGraphQLImport: true
    });
  });
});

describe("getSchemaSources", () => {
  it("returns attached schema sources when present", () => {
    const schema = buildSchema(`type Query { greeting: String }`);
    const source = {
      document: schema.getQueryType()?.astNode,
      location: "schema.graphql"
    };

    schema.extensions = {
      ...schema.extensions,
      sources: [source]
    };

    expect(getSchemaSources(schema)).toEqual([source]);
  });

  it("returns an empty array when no sources are attached", () => {
    const schema = buildSchema(`type Query { greeting: String }`);

    expect(getSchemaSources(schema)).toEqual([]);
  });
});

describe("schemaToCodegenDocument", () => {
  it("converts a loaded schema into a GraphQL AST document", () => {
    const schema = buildSchema(`
      """Root query type."""
      type Query {
        greeting: String
      }
    `);

    const document = schemaToCodegenDocument(schema);

    expect(document.kind).toBe("Document");
    expect(document.definitions.length).toBeGreaterThan(0);
  });
});
