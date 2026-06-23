import { resolve } from "@power-plant/schema";
import type { ResolveOptions } from "@power-plant/schema/resolve";
import { extractFileReference } from "@stryke/convert/extract-file-reference";
import { findFileExtensionSafe } from "@stryke/path/find";
import { isFunction } from "@stryke/type-checks/is-function";
import type { FileReferenceInput } from "@stryke/types/configuration";
import { existsSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { VALID_SINK_FILE_EXTENSIONS } from "../../src/sink/constants";
import { extractSink } from "../../src/sink/extract";
import type { SinkFunction, SinkInputWithMeta } from "../../src/sink/types";

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
    if (!extension || !VALID_SINK_FILE_EXTENSIONS.includes(extension)) {
      return false;
    }

    return existsSync(value);
  }

  return isFileReferenceObject(value);
}

function isSinkInputWithMeta<TSpec, TOptions = never>(
  value: any
): value is SinkInputWithMeta<TSpec, TOptions> {
  return value !== null && typeof value === "object" && "sink" in value;
}

async function resolveSinkInput<TSpec, TOptions = never>(
  input: any,
  options: ResolveOptions = {}
) {
  const normalizedInput = isSinkInputWithMeta(input)
    ? input
    : { sink: input, meta: undefined };
  const sinkInput = normalizedInput.sink;

  if (isLikelyFileReference(sinkInput)) {
    const fileReference = extractFileReference(sinkInput);
    if (!fileReference) {
      throw new Error(
        `Failed to extract a file reference from the provided sink input ${JSON.stringify(
          sinkInput
        )}.`
      );
    }

    const extension = findFileExtensionSafe(fileReference.file);
    if (extension && !VALID_SINK_FILE_EXTENSIONS.includes(extension)) {
      throw new Error(
        `The provided sink file input "${
          fileReference.file
        }" has an invalid file extension (.${
          extension
        }). Please ensure that the file has one of the following extensions: ${VALID_SINK_FILE_EXTENSIONS.join(
          ", "
        )}.`
      );
    }

    const resolved = await resolve<
      SinkFunction<TSpec, TOptions> | SinkInputWithMeta<TSpec, TOptions>
    >(fileReference, options);
    if (!isFunction(resolved)) {
      throw new TypeError(
        `Resolved sink input from file reference "${fileReference.file}" is invalid: ${JSON.stringify(
          resolved
        )}.`
      );
    }

    return {
      sink: resolved,
      meta: normalizedInput.meta
    };
  }

  return {
    sink: sinkInput,
    meta: normalizedInput.meta
  };
}

describe("core/src/sink/extract.ts", () => {
  it("keeps sink function inputs", async () => {
    const fn = vi.fn(async (spec: any) => spec);
    const resolved = await resolveSinkInput(fn);

    expect(resolved.sink).toBe(fn);
    expect(resolved.meta).toBeUndefined();
  });

  it("resolves file reference inputs", async () => {
    const file = new URL("./fixtures/sink-input-fixture.ts", import.meta.url)
      .pathname;

    const resolved = await resolveSinkInput<{ name: string }>(`${file}#sink`);
    const spec = { name: "fixture" };

    await resolved.sink(spec);

    expect(spec.name).toBe("fixture-resolved");
  });

  it("preserves meta while resolving wrapped inputs", async () => {
    const file = new URL("./fixtures/sink-input-fixture.ts", import.meta.url)
      .pathname;
    const meta = { description: "fixture sink" };

    const resolved = await resolveSinkInput<{ name: string }>({
      sink: `${file}#sink`,
      meta
    });

    expect(resolved.meta).toBe(meta);
    await resolved.sink({ name: "fixture" });
  });

  it("extracts a sink descriptor", async () => {
    const schema = { type: "object" } as const;
    const fn = async (spec: any): Promise<any> => spec;
    const sink = await extractSink(schema as any, fn as any);

    expect(sink.schema).toBe(schema);
    expect(sink.sink).toBe(fn);
    expect(sink.meta).toBeUndefined();
  });

  it("extracts meta from wrapped sink inputs", async () => {
    const schema = { type: "object" } as const;
    const fn = async (spec: any): Promise<any> => spec;
    const meta = { description: "sink meta" };
    const sink = await extractSink(schema as any, { sink: fn, meta } as any);

    expect(sink.schema).toBe(schema);
    expect(sink.sink).toBe(fn);
    expect(sink.meta).toBe(meta);
  });

  it("throws when file reference extensions are invalid", async () => {
    await expect(
      resolveSinkInput({ file: "./README.md" } as any)
    ).rejects.toThrow(/invalid file extension/i);
  });
});
