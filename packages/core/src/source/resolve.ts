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

import type { ResolveOptions } from "@power-plant/schema/resolve";
import { resolveSafe } from "@power-plant/schema/resolve";
import { extractFileReference } from "@stryke/convert/extract-file-reference";
import { findFileExtensionSafe } from "@stryke/path/find";
import type { FileReferenceInput } from "@stryke/types/configuration";
import { createJiti } from "jiti";
import { existsSync } from "node:fs";
import { VALID_SOURCE_FILE_EXTENSIONS } from "./constants";
import type {
  SourceFunction,
  SourceInput,
  SourceInputWithMeta,
  SourceMeta
} from "./types";

export type SourceResolvedInput<TSpec, TOptions = never> =
  | TSpec
  | Promise<TSpec>
  | SourceFunction<TSpec, TOptions>;

export interface SourceResolved<TSpec, TOptions = never> {
  source: TSpec | SourceFunction<TSpec, TOptions>;
  meta?: SourceMeta<TSpec, TOptions>;
}

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
  value: SourceInput<TSpec, TOptions>
): value is SourceInputWithMeta<TSpec, TOptions> {
  return (
    value !== null &&
    typeof value === "object" &&
    !isFileReferenceObject(value) &&
    "source" in value &&
    "meta" in value
  );
}

/**
 * Resolves any accepted source input into a concrete source value with optional metadata.
 */
export async function resolveSourceInput<TSpec, TOptions = never>(
  input: SourceInput<TSpec, TOptions>,
  options: ResolveOptions = {}
): Promise<SourceResolved<TSpec, TOptions>> {
  const normalizedInput = isSourceInputWithMeta(input)
    ? input
    : {
        source: input
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
      meta: normalizedInput.meta
    };
  }

  if (sourceInput instanceof Promise) {
    return {
      source: await sourceInput,
      meta: normalizedInput.meta
    };
  }

  return {
    source: sourceInput,
    meta: normalizedInput.meta
  };
}
