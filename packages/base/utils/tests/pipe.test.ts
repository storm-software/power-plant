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

import { describe, expect, it, vi } from "vitest";
import { pipe, pipeInputs, pipeOutputs } from "../src/pipe";
import { createTestExecute, invokeInput, invokeOutput } from "./helpers";

vi.mock("@power-plant/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@power-plant/core")>();

  return {
    ...actual,
    createExecute: vi.fn(async () => createTestExecute())
  };
});

describe("pipeInputs", () => {
  it("builds a tuple spec aligned with input order", async () => {
    const config = pipeInputs<
      [{ name: string }, { module: string }],
      { suffix: string }
    >([
      { name: "User" },
      async options => ({
        module: `User${options.suffix}`
      })
    ]);

    expect(config.schema).toMatchObject({
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: false
    });
    expect(config.schema).toHaveProperty("prefixItems");

    await expect(invokeInput(config, { suffix: "Model" })).resolves.toEqual([
      { name: "User" },
      { module: "UserModel" }
    ]);
  });

  it("keeps array length when skipping undefined slots", async () => {
    const empty = pipeInputs<[]>([]);
    await expect(invokeInput(empty)).resolves.toEqual([]);
    expect(empty.schema).toMatchObject({
      type: "array",
      minItems: 0,
      maxItems: 0
    });

    const withHole = pipeInputs<
      [{ id: number }, { id: number } | undefined, { id: number }]
    >([{ id: 1 }, undefined, { id: 3 }]);
    const spec = await invokeInput(withHole);

    expect(spec).toHaveLength(3);
    expect(spec[0]).toEqual({ id: 1 });
    expect(spec[1]).toBeUndefined();
    expect(spec[2]).toEqual({ id: 3 });
  });

  it("merges child schemas into prefixItems", () => {
    const config = pipeInputs([
      {
        schema: { type: "object", properties: { name: { type: "string" } } },
        input: { name: "a" }
      },
      { value: 1 }
    ]);

    expect(config.schema).toMatchObject({
      prefixItems: [
        { type: "object", properties: { name: { type: "string" } } },
        { type: "any" }
      ]
    });
  });

  it("throws when a child input is a load reference string", async () => {
    const config = pipeInputs(["./inputs/remote.js" as never]);

    await expect(invokeInput(config)).rejects.toThrow(
      /load-reference input.*not supported inside pipe/
    );
  });
});

describe("pipeOutputs", () => {
  it("runs every output with its own slice and returns the last value", async () => {
    const calls: string[] = [];
    const config = pipeOutputs<
      [{ name: string }, { module: string }],
      object,
      string
    >([
      spec => {
        calls.push(`first:${spec.name}`);
        return "first";
      },
      async spec => {
        calls.push(`second:${spec.module}`);
        return "second";
      }
    ]);

    await expect(
      invokeOutput(config, [{ name: "User" }, { module: "user" }])
    ).resolves.toBe("second");
    expect(calls).toEqual(["first:User", "second:user"]);
  });

  it("returns undefined for an empty list", async () => {
    const config = pipeOutputs<[], object, undefined>([]);
    await expect(invokeOutput(config, [])).resolves.toBeUndefined();
  });

  it("treats missing outputs as noops while preserving last return", async () => {
    const config = pipeOutputs<[unknown, unknown, unknown], object, string>([
      () => "first",
      undefined,
      () => "third"
    ]);

    await expect(invokeOutput(config, [{}, {}, {}])).resolves.toBe("third");
  });

  it("merges child OutputConfigObject schemas into prefixItems", () => {
    const config = pipeOutputs<[unknown, unknown], object, number>([
      {
        schema: { type: "object", properties: { id: { type: "number" } } },
        output: () => 1
      },
      () => 2
    ]);

    expect(config.schema).toMatchObject({
      prefixItems: [
        { type: "object", properties: { id: { type: "number" } } },
        { type: "any" }
      ]
    });
  });
});

describe("pipe", () => {
  it("runs generators in order, merges documents, returns last output", async () => {
    const result = await pipe({
      generator: [
        {
          input: { name: "User" },
          generator: async (spec: { name: string }) => ({
            "user.ts": {
              path: "user.ts",
              chunks: [{ content: spec.name }]
            }
          }),
          output: () => "first"
        },
        {
          input: { module: "user" },
          generator: async (spec: { module: string }) => ({
            "user.py": {
              path: "user.py",
              chunks: [{ content: spec.module }]
            }
          }),
          output: () => "last"
        }
      ]
    });

    expect(result).toBe("last");
  });

  it("honors explicit input and output overrides", async () => {
    const result = await pipe({
      generator: [
        {
          input: { value: "ignored" },
          generator: async () => ({
            "out.txt": { path: "out.txt" }
          }),
          output: () => "child"
        }
      ],
      input: [{ value: "overridden" }],
      output: () => "override"
    });

    expect(result).toBe("override");
  });

  it("runs all outputs for side effects even when only last return is kept", async () => {
    const sideEffects: string[] = [];

    const result = await pipe({
      generator: [
        {
          input: { step: 1 },
          generator: async () => ({
            "a.txt": { path: "a.txt" }
          }),
          output: () => {
            sideEffects.push("a");
            return "a";
          }
        },
        {
          input: { step: 2 },
          generator: async () => ({
            "b.txt": { path: "b.txt" }
          }),
          output: () => {
            sideEffects.push("b");
            return "b";
          }
        }
      ]
    });

    expect(sideEffects).toEqual(["a", "b"]);
    expect(result).toBe("b");
  });
});
