import type { ResolveOptions } from "@power-plant/schema/resolve";
import { resolveSafe } from "@power-plant/schema/resolve";
import { extractFileReference } from "@stryke/convert/extract-file-reference";
import { findFileExtensionSafe } from "@stryke/path/find";
import type { FileReferenceInput } from "@stryke/types/configuration";
import { createJiti } from "jiti";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VALID_SOURCE_FILE_EXTENSIONS } from "../../src/source/constants";
import { extractSource } from "../../src/source/extract";
import type {
  SourceFunction,
  SourceInputWithMeta
} from "../../src/source/types";

export type SourceResolvedInput<TSpec, TOptions = never> =
  | TSpec
  | Promise<TSpec>
  | SourceFunction<TSpec, TOptions>;

function isFileReferenceObject(value: unknown): value is FileReferenceInput {
  return (
    value !== null &&
    typeof value === "object" &&
    "file" in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>).file === "string"
  );
}

function isLikelyFileReference(value: unknown): value is FileReferenceInput {
  if (typeof value === "string") {
    if (value.includes(":") || value.includes("#") || value.includes(";")) {
      return true;
    }

    const extension = findFileExtensionSafe(value);
    if (!extension || !VALID_SOURCE_FILE_EXTENSIONS.includes(extension)) {
      return false;
    }

    return existsSync(value);
  }

  return isFileReferenceObject(value);
}

function isSourceInputWithMeta<TSpec, TOptions = never>(
  value: any
): value is SourceInputWithMeta<TSpec, TOptions> {
  return (
    value !== null &&
    typeof value === "object" &&
    !isFileReferenceObject(value) &&
    "source" in value
  );
}

async function resolveSourceInput<TSpec, TOptions = never>(
  input: any,
  options: ResolveOptions = {}
) {
  const normalizedInput: any =
    typeof input === "object" && input !== null && "source" in input
      ? input
      : {
          source: input,
          meta: undefined
        };
  const sourceInput = normalizedInput.source;

  if (isLikelyFileReference(sourceInput)) {
    const fileReference = extractFileReference(sourceInput);
    if (!fileReference) {
      throw new Error(
        `Failed to extract a file reference from the provided source input ${JSON.stringify(
          sourceInput
        )}.`
      );
    }

    const extension = findFileExtensionSafe(fileReference.file);
    if (extension && !VALID_SOURCE_FILE_EXTENSIONS.includes(extension)) {
      throw new Error(
        `The provided source file input "${
          fileReference.file
        }" has an invalid file extension (.${
          extension
        }). Please ensure that the file has one of the following extensions: ${VALID_SOURCE_FILE_EXTENSIONS.join(
          ", "
        )}.`
      );
    }

    let resolved: SourceResolvedInput<TSpec, TOptions> | undefined =
      await resolveSafe<SourceResolvedInput<TSpec, TOptions>>(
        fileReference,
        options
      );

    if (resolved === undefined) {
      const jiti = createJiti(options.cwd ?? process.cwd());
      const resolvedModule = await jiti.import<Record<string, unknown>>(
        fileReference.file
      );

      let exportName = fileReference.export;
      if (!exportName) {
        exportName = "default";
      }

      resolved =
        (resolvedModule[exportName] as
          | SourceResolvedInput<TSpec, TOptions>
          | undefined) ??
        (resolvedModule[`__Ω${exportName}`] as
          | SourceResolvedInput<TSpec, TOptions>
          | undefined) ??
        (exportName === "default"
          ? (resolvedModule.default as
              | SourceResolvedInput<TSpec, TOptions>
              | undefined)
          : undefined);
    }

    if (resolved === undefined) {
      throw new Error(
        `Failed to resolve source input from file reference "${fileReference.file}".`
      );
    }

    if (resolved instanceof Promise) {
      resolved = await resolved;
    }

    if (!resolved) {
      throw new Error(
        `Resolved source input from file reference "${fileReference.file}" is invalid: ${JSON.stringify(
          resolved
        )}.`
      );
    }

    return {
      source: resolved,
      meta: (normalizedInput as any).meta
    };
  }

  if (sourceInput instanceof Promise) {
    return {
      source: await sourceInput,
      meta: (normalizedInput as any).meta
    };
  }

  return {
    source: sourceInput,
    meta: (normalizedInput as any).meta
  };
}

describe("core/src/source/extract.ts", () => {
  it("keeps static source values", async () => {
    const schema = { type: "object" } as any;
    const source = await extractSource(schema, { enabled: true } as any);

    expect(source.schema).toBe(schema);
    expect(source.source).toEqual({ enabled: true });
    expect(source.meta).toBeUndefined();
  });

  it("awaits promise source values", async () => {
    const resolved = await resolveSourceInput(Promise.resolve({ ok: true }));

    expect(resolved.source).toEqual({ ok: true });
    expect(resolved.meta).toBeUndefined();
  });

  it("keeps source function inputs", async () => {
    const fn = async () => ({ ok: true });
    const resolved = await resolveSourceInput(fn);

    expect(resolved.source).toBe(fn);
    expect(resolved.meta).toBeUndefined();
  });

  it("resolves file reference inputs", async () => {
    const file = new URL("./fixtures/source-input-fixture.ts", import.meta.url)
      .pathname;

    const resolved = await resolveSourceInput(`${file}#spec`);

    expect(resolved.source).toEqual({ enabled: true, name: "fixture" });
    expect(resolved.meta).toBeUndefined();
  });

  it("preserves meta while resolving wrapped inputs", async () => {
    const meta = { description: "wrapped source" };

    const resolved = await resolveSourceInput({
      source: Promise.resolve({ ok: true }),
      meta
    });

    expect(resolved.source).toEqual({ ok: true });
    expect(resolved.meta).toBe(meta);
  });

  it("extracts meta from wrapped source inputs", async () => {
    const schema = { type: "object" } as any;
    const meta = { description: "source meta" };
    const source = await extractSource(schema, {
      source: { enabled: true },
      meta
    } as any);

    expect(source.schema).toBe(schema);
    expect(source.source).toEqual({ enabled: true });
    expect(source.meta).toBe(meta);
  });

  it("throws when file reference extensions are invalid", async () => {
    await expect(
      resolveSourceInput({ file: "./README.md" } as any)
    ).rejects.toThrow(/invalid file extension/i);
  });
});
