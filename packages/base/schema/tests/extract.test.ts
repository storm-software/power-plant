import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  bundleReferences,
  extract,
  extractHash,
  extractResolvedVariant,
  extractSchema,
  extractSchemaWithSource,
  extractSource,
  extractTSType,
  extractVariant
} from "../src/extract";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsTypeFixtures = join(packageRoot, "tests/fixtures/extract-ts-type");
const extractTsOptions = { cwd: packageRoot };

describe("schema/src/extract.ts", () => {
  it("bundleReferences rewrites internal document references", () => {
    const bundled = bundleReferences({
      $id: "https://example.dev/root.json",
      $defs: {
        User: {
          $id: "#/defs/user",
          type: "object",
          properties: {
            name: { type: "string" }
          }
        }
      },
      properties: {
        user: { $ref: "#/defs/user" }
      },
      type: "object"
    } as any) as any;

    expect(bundled.properties.user.$ref).toContain("#");
  });

  it("extractHash creates deterministic hashes for the same input", () => {
    const schema = { type: "string" } as any;

    const hashOne = extractHash("json-schema", schema);
    const hashTwo = extractHash("json-schema", schema);

    expect(hashOne).toBe(hashTwo);
    expect(hashOne.length).toBeGreaterThan(0);
  });

  it("extractResolvedVariant and extractVariant classify inputs", () => {
    expect(extractResolvedVariant({ type: "string" } as any)).toBe(
      "json-schema"
    );
    expect(extractVariant("./schema.ts#default")).toBe("file-reference");
    expect(
      extractVariant({
        schema: "./schema.ts#default"
      } as any)
    ).toBe("file-reference");
  });

  it("extractSource wraps schema with source metadata", () => {
    const source = extractSource("json-schema", { type: "number" } as any);

    expect(source.variant).toBe("json-schema");
    expect(source.schema).toEqual({ type: "number" });
    expect(source.hash.length).toBeGreaterThan(0);
  });

  it("extractSchema bundles direct JSON Schema input", async () => {
    await expect(
      extractSchema({ type: "object", properties: {} } as any)
    ).resolves.toEqual({ type: "object", properties: {} });
  });

  it("extractSchemaWithSource and extract return normalized schema payloads", async () => {
    const withSource = await extractSchemaWithSource(
      { type: "string" } as any,
      {
        skipCache: true
      }
    );
    expect(withSource.variant).toBe("json-schema");
    expect(withSource.schema).toEqual({ type: "string" });
    expect(withSource.source.variant).toBe("json-schema");

    const extracted = await extract({ type: "string" } as any);
    expect(extracted.variant).toBe("json-schema");
    expect(extracted.schema).toEqual({ type: "string" });
    expect(extracted.hash.length).toBeGreaterThan(0);
  });

  describe("extractTSType", () => {
    it("rejects input that is not a file reference", async () => {
      await expect(extractTSType({} as any)).rejects.toThrow(
        /Failed to extract a file reference/
      );
    });

    it("generates JSON Schema for a named export from a fixture module", async () => {
      const schema = await extractTSType(
        `${tsTypeFixtures}/simple.ts#User`,
        extractTsOptions
      );

      expect(schema).toMatchObject({
        type: "object",
        properties: {
          id: expect.objectContaining({ type: "string" }),
          name: expect.objectContaining({ type: "string" }),
          age: expect.objectContaining({ type: "number" })
        },
        required: expect.arrayContaining(["id", "name"])
      });
      expect(schema).not.toEqual({ type: "object" });
    });

    it("accepts a FileReference object with file and export", async () => {
      const schema = await extractTSType(
        {
          file: `${tsTypeFixtures}/simple.ts`,
          export: "UserName"
        },
        extractTsOptions
      );

      expect(schema).toMatchObject({ type: "string" });
    });

    it("bundles imported types across the module graph", async () => {
      const schema = await extractTSType(
        `${tsTypeFixtures}/with-import.ts#ImportedUser`,
        extractTsOptions
      );

      expect(schema).toMatchObject({
        type: "object",
        properties: {
          id: expect.objectContaining({ type: "string" }),
          label: expect.objectContaining({ type: "string" })
        },
        required: expect.arrayContaining(["id", "label"])
      });
    });

    it("wraps generator failures with file path and export name", async () => {
      await expect(
        extractTSType(
          `${tsTypeFixtures}/simple.ts#NotARealExport`,
          extractTsOptions
        )
      ).rejects.toThrow(
        /Failed to generate a JSON schema for.*simple\.ts.*using the type "NotARealExport"/
      );
    });

    it("invokes logger.debug when schema generation succeeds", async () => {
      const debug = vi.fn();
      await extractTSType(`${tsTypeFixtures}/simple.ts#User`, {
        ...extractTsOptions,
        logger: {
          debug,
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        }
      });

      expect(debug).toHaveBeenCalledWith(
        expect.stringMatching(
          /Generating JSON schema for bundled.*simple\.ts.*using the type "User"/
        )
      );
    });

    it("ignores extract-only options that are invalid for esbuild.build", async () => {
      const schema = await extractTSType(`${tsTypeFixtures}/simple.ts#User`, {
        ...extractTsOptions,
        // These must not be forwarded to esbuild.build() (cwd especially).
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        },
        reflection: "default",
        exclude: ["**/node_modules/**"]
      });

      expect(schema).toMatchObject({
        type: "object",
        properties: {
          id: expect.objectContaining({ type: "string" })
        }
      });
    });
  });

  describe("extractSchemaWithSource empty object", () => {
    it("treats literal {} as an any JSON schema", async () => {
      const extracted = await extractSchemaWithSource({});

      expect(extracted.variant).toBe("json-schema");
      expect(extracted.schema).toEqual({
        type: [
          "string",
          "number",
          "integer",
          "boolean",
          "null",
          "array",
          "object"
        ]
      });
    });

    it("does not treat file-reference objects as empty", async () => {
      const extracted = await extractSchemaWithSource(
        {
          file: `${tsTypeFixtures}/simple.ts`,
          export: "User"
        },
        extractTsOptions
      );

      expect(extracted.schema).toMatchObject({
        type: "object",
        properties: {
          id: expect.objectContaining({ type: "string" })
        }
      });
    });
  });
});
