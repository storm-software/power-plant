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
import { combine, combineInputs, combineOutputs } from "../src/combine";
import { createTestExecute, invokeInput, invokeOutput } from "./helpers";

vi.mock("@power-plant/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@power-plant/core")>();

  return {
    ...actual,
    createExecute: vi.fn(async () => createTestExecute())
  };
});

describe("combineInputs", () => {
  it("merges static and function inputs into a keyed spec", async () => {
    const config = combineInputs<
      {
        typescript: { name: string };
        python: { module: string };
      },
      { suffix: string }
    >({
      typescript: { name: "User" },
      python: async options => ({
        module: `User${options.suffix}`
      })
    });

    expect(config.schema).toMatchObject({
      type: "object",
      required: ["typescript", "python"],
      additionalProperties: false
    });

    await expect(invokeInput(config, { suffix: "Model" })).resolves.toEqual({
      typescript: { name: "User" },
      python: { module: "UserModel" }
    });
  });

  it("skips undefined entries and returns empty object for empty map", async () => {
    const empty = combineInputs({});
    await expect(invokeInput(empty)).resolves.toEqual({});
    expect(empty.schema).toMatchObject({
      type: "object",
      required: [],
      properties: {}
    });

    const partial = combineInputs<{ keep: { id: number }; skip?: never }>({
      keep: { id: 1 },
      skip: undefined
    });

    await expect(invokeInput(partial)).resolves.toEqual({ keep: { id: 1 } });
    expect(partial.schema).toMatchObject({
      required: ["keep"],
      properties: {
        keep: { type: "any" }
      }
    });
    expect(partial.schema).not.toHaveProperty("properties.skip");
  });

  it("merges child InputConfigObject schemas into the joined schema", () => {
    const config = combineInputs({
      a: {
        schema: { type: "object", properties: { name: { type: "string" } } },
        input: { name: "a" }
      },
      b: { value: 1 }
    });

    expect(config.schema).toMatchObject({
      properties: {
        a: { type: "object", properties: { name: { type: "string" } } },
        b: { type: "any" }
      }
    });
  });

  it("throws when a child input is a load reference string", async () => {
    const config = combineInputs({
      remote: "./inputs/remote.js" as never
    });

    await expect(invokeInput(config)).rejects.toThrow(
      /load-reference input.*not supported inside combine/
    );
  });
});

describe("combineOutputs", () => {
  it("runs every child output with its keyed spec slice", async () => {
    const calls: string[] = [];
    const config = combineOutputs<
      {
        typescript: { name: string };
        python: { module: string };
      },
      object,
      {
        typescript: string;
        python: string;
      }
    >({
      typescript: spec => {
        calls.push(`ts:${spec.name}`);
        return `TS:${spec.name}`;
      },
      python: async spec => {
        calls.push(`py:${spec.module}`);
        return `PY:${spec.module}`;
      }
    });

    await expect(
      invokeOutput(config, {
        typescript: { name: "User" },
        python: { module: "user" }
      })
    ).resolves.toEqual({
      typescript: "TS:User",
      python: "PY:user"
    });
    expect(calls).toEqual(["ts:User", "py:user"]);
  });

  it("returns empty object for empty map and undefined for missing outputs", async () => {
    const empty = combineOutputs({});
    await expect(invokeOutput(empty, {})).resolves.toEqual({});

    const withMissing = combineOutputs<
      { present: unknown; absent: unknown },
      object,
      { present: string; absent: undefined }
    >({
      present: () => "ok",
      absent: undefined
    });

    await expect(
      invokeOutput(withMissing, { present: {}, absent: {} })
    ).resolves.toEqual({
      present: "ok",
      absent: undefined
    });
  });

  it("merges child OutputConfigObject schemas into the joined schema", () => {
    const config = combineOutputs<
      { a: unknown; b: unknown },
      object,
      { a: number; b: number }
    >({
      a: {
        schema: { type: "object", properties: { id: { type: "number" } } },
        output: () => 1
      },
      b: () => 2
    });

    expect(config.schema).toMatchObject({
      properties: {
        a: { type: "object", properties: { id: { type: "number" } } },
        b: { type: "any" }
      }
    });
  });
});

describe("combine", () => {
  it("joins child generators, documents, and keyed returns", async () => {
    const result = await combine({
      generator: {
        typescript: {
          input: { name: "User" },
          generator: async (spec: { name: string }) => ({
            "user.ts": {
              path: "user.ts",
              chunks: [{ content: `export type ${spec.name} = {}` }]
            }
          }),
          output: (spec: { name: string }) => `ts:${spec.name}`
        },
        python: {
          input: { module: "user" },
          generator: async (spec: { module: string }) => ({
            "user.py": {
              path: "user.py",
              chunks: [{ content: `class ${spec.module}: ...` }]
            }
          }),
          output: async (spec: { module: string }) => `py:${spec.module}`
        }
      }
    });

    expect(result).toEqual({
      typescript: "ts:User",
      python: "py:user"
    });
  });

  it("honors explicit input and output overrides", async () => {
    const result = await combine({
      generator: {
        child: {
          input: { value: "ignored" },
          generator: async () => ({
            "out.txt": { path: "out.txt", chunks: [{ content: "x" }] }
          }),
          output: () => "child-output"
        }
      },
      input: { child: { value: "overridden" } },
      output: () => ({ child: "override-return" })
    });

    expect(result).toEqual({ child: "override-return" });
  });

  it("still runs generators when a child input is missing", async () => {
    const generator = vi.fn(async (_spec: unknown) => ({
      "a.txt": { path: "a.txt" }
    }));

    const result = await combine({
      generator: {
        missingInput: {
          generator,
          output: () => "ran"
        }
      }
    });

    expect(generator).toHaveBeenCalledWith(undefined, expect.any(Object));
    expect(result).toEqual({ missingInput: "ran" });
  });
});
