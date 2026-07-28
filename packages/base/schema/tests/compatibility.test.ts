import { JSON_SCHEMA_ANY } from "../src/constants";
import {
  assertSchemasDoNotContradict,
  findSchemaContradictions
} from "../src/compatibility";
import { describe, expect, it } from "vitest";

describe("schema/src/compatibility.ts", () => {
  it("returns no issues for compatible object schemas", () => {
    expect(
      findSchemaContradictions(
        {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" }
          }
        },
        {
          type: "object",
          properties: {
            name: { type: "string", description: "display name" }
          }
        }
      )
    ).toEqual([]);
  });

  it("detects conflicting root types", () => {
    expect(
      findSchemaContradictions(
        { type: "object", properties: { name: { type: "string" } } },
        { type: "string" }
      )
    ).toEqual([
      "schema has conflicting types: object vs string"
    ]);
  });

  it("detects conflicting nested property types", () => {
    expect(
      findSchemaContradictions(
        {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        },
        {
          type: "object",
          properties: {
            name: { type: "number" }
          }
        }
      )
    ).toEqual(["name has conflicting types: string vs number"]);
  });

  it("ignores metadata-only differences", () => {
    expect(
      findSchemaContradictions(
        {
          type: "object",
          title: "Base",
          properties: { name: { type: "string" } }
        },
        {
          type: "object",
          title: "Override",
          description: "Different metadata",
          properties: { name: { type: "string" } }
        }
      )
    ).toEqual([]);
  });

  it("treats unconstrained schemas as compatible", () => {
    expect(
      findSchemaContradictions(JSON_SCHEMA_ANY, { type: "string" })
    ).toEqual([]);
    expect(findSchemaContradictions({}, { type: "object" })).toEqual([]);
  });

  it("throws when contradictions are found", () => {
    expect(() =>
      assertSchemasDoNotContradict(
        { type: "object" },
        { type: "array" },
        "input"
      )
    ).toThrow(/input schema contradicts the generator schema/i);
  });
});
