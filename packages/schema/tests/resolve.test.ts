import { resolve as resolvePath } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { evalModuleMock, readFileMock, createSchemaMock, createGeneratorMock } =
  vi.hoisted(() => {
    const createSchema = vi.fn();

    return {
      evalModuleMock: vi.fn(),
      readFileMock: vi.fn(),
      createSchemaMock: createSchema,
      createGeneratorMock: vi.fn(() => ({
        createSchema
      }))
    };
  });

vi.mock("../src/bundle", () => ({
  bundle: vi.fn()
}));

vi.mock("jiti", () => ({
  createJiti: vi.fn(() => ({
    evalModule: evalModuleMock
  }))
}));

vi.mock("node:fs/promises", () => ({
  readFile: readFileMock
}));

vi.mock("ts-json-schema-generator/dist/factory/generator.js", () => ({
  createGenerator: createGeneratorMock
}));

import { bundle } from "../src/bundle";
import { resolve, resolveModule, resolveTSType } from "../src/resolve";

describe("packages/schema/src/resolve.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolve parses JSON, YAML, and TOML files", async () => {
    readFileMock
      .mockResolvedValueOnce('{"name":"json"}')
      .mockResolvedValueOnce("name: yaml")
      .mockResolvedValueOnce('name = "toml"');

    await expect(resolve("./schema.json")).resolves.toEqual({ name: "json" });
    await expect(resolve("./schema.yaml")).resolves.toEqual({ name: "yaml" });
    await expect(resolve("./schema.toml")).resolves.toEqual({ name: "toml" });
  });

  it("resolveModule evaluates bundled module output", async () => {
    vi.mocked(bundle).mockResolvedValue({
      path: "/virtual/out.js",
      text: "export default 1;"
    } as any);
    evalModuleMock.mockResolvedValue({ default: 42 });

    await expect(resolveModule("./module.ts")).resolves.toEqual({
      default: 42
    });
  });

  it("resolve returns the requested export and resolveReflection generates a JSON schema", async () => {
    vi.mocked(bundle).mockResolvedValue({
      path: "/virtual/out.js",
      text: "export const schema = { type: 'string' };"
    } as any);
    evalModuleMock.mockResolvedValue({ schema: { type: "string" } });
    createSchemaMock.mockReturnValue({
      $ref: "#/definitions/schema",
      definitions: {
        schema: { type: "string" }
      }
    });

    await expect(
      resolve({ file: "./module.ts", export: "schema" })
    ).resolves.toEqual({
      type: "string"
    });

    await expect(
      resolveTSType({
        file: "./module.ts",
        export: "schema"
      } as any)
    ).resolves.toEqual({
      $ref: "#/definitions/schema",
      definitions: {
        schema: { type: "string" }
      }
    });

    expect(createGeneratorMock).toHaveBeenCalledWith({
      path: "./module.ts",
      type: "schema",
      expose: "export",
      jsDoc: "extended",
      tsconfig: resolvePath(__dirname, "../../../tsconfig.json")
    });
    expect(createSchemaMock).toHaveBeenCalledWith("schema");
  });
});
