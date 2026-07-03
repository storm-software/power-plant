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

import { getSchemaSources } from "@power-plant/graphql-schema/codegen";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { input } from "../src/input";
import { toSchemaPointer } from "../src/pointer";

const fixturePath = fileURLToPath(
  new URL("./fixtures/schema.graphql", import.meta.url)
);

describe("toSchemaPointer", () => {
  it("passes string pointers through unchanged", () => {
    expect(toSchemaPointer("./schema.graphql")).toBe("./schema.graphql");
  });

  it("extracts the file path from file references", () => {
    expect(
      toSchemaPointer({
        file: "./schema.graphql",
        exportName: "schema"
      })
    ).toBe("./schema.graphql");
  });
});

describe("input", () => {
  it("loads a GraphQL schema from an SDL file", async () => {
    const schema = await input({
      inputPath: fixturePath
    });

    expect(schema.getQueryType()?.getFields().greeting?.type.toString()).toBe(
      "String"
    );
    expect(getSchemaSources(schema).length).toBeGreaterThan(0);
  });

  it("wraps load failures with a descriptive error", async () => {
    await expect(
      input({
        inputPath: fileURLToPath(
          new URL("./fixtures/missing.graphql", import.meta.url)
        )
      })
    ).rejects.toThrow(/Failed to load GraphQL schema from/);
  });
});
