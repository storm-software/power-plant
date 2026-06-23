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

import { resolve } from "@power-plant/schema";
import type { ResolveOptions } from "@power-plant/schema/resolve";
import { extractFileReference } from "@stryke/convert/extract-file-reference";
import { findFileExtensionSafe } from "@stryke/path/find";
import { isFunction } from "@stryke/type-checks/is-function";
import type { FileReferenceInput } from "@stryke/types/configuration";
import { existsSync } from "node:fs";
import { VALID_SINK_FILE_EXTENSIONS } from "./constants";
import type {
  SinkFunction,
  SinkInput,
  SinkInputWithMeta,
  SinkMeta
} from "./types";

export interface SinkResolved<TSpec, TOptions = never> {
  sink: SinkFunction<TSpec, TOptions>;
  meta?: SinkMeta<TSpec, TOptions>;
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
    if (!extension || !VALID_SINK_FILE_EXTENSIONS.includes(extension)) {
      return false;
    }

    return existsSync(value);
  }

  return isFileReferenceObject(value);
}

function isSinkInputWithMeta<TSpec, TOptions = never>(
  value: SinkInput<TSpec, TOptions>
): value is SinkInputWithMeta<TSpec, TOptions> {
  return value !== null && typeof value === "object" && "sink" in value;
}

/**
 * Resolves any accepted sink input into a concrete sink function with optional metadata.
 */
export async function resolveSinkInput<TSpec, TOptions = never>(
  input: SinkInput<TSpec, TOptions>,
  options: ResolveOptions = {}
): Promise<SinkResolved<TSpec, TOptions>> {
  const normalizedInput = isSinkInputWithMeta(input) ? input : { sink: input };
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
