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

import { toArray } from "@stryke/convert/to-array";
import type { LoadReference } from "@stryke/resolve/types";
import { isString } from "@stryke/type-checks/is-string";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Formats an unknown load/parse error into a readable message.
 *
 * @param error - The error thrown while loading Prisma schema files.
 * @returns A human-readable error message.
 */
export function formatLoadError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Resolves a load reference to an absolute filesystem path.
 *
 * @param reference - File path or URL-like reference.
 * @param cwd - Working directory used for relative paths.
 * @returns An absolute filesystem path.
 */
export function toAbsolutePath(reference: LoadReference, cwd: string): string {
  if (!isString(reference)) {
    throw new TypeError(
      `Unsupported Prisma schema reference: ${String(reference)}. Expected a filesystem path string.`
    );
  }

  if (reference.startsWith("file:")) {
    return new URL(reference).pathname;
  }

  return isAbsolute(reference) ? reference : resolve(cwd, reference);
}

/**
 * Converts schema file paths into Prisma `getDMMF` datamodel tuples.
 *
 * @param paths - Absolute paths to `.prisma` files.
 * @param contents - File contents keyed by absolute path.
 * @returns Schema file tuples for `@prisma/internals` `getDMMF`.
 */
export function toSchemaFiles(
  paths: string[],
  contents: Map<string, string>
): Array<[string, string]> {
  return paths.map(path => {
    const content = contents.get(path);
    if (content == null) {
      throw new Error(`Missing Prisma schema content for ${path}`);
    }

    return [path, content];
  });
}

/**
 * Builds a `file:` URL for logging / debugging schema sources.
 *
 * @param path - Absolute filesystem path.
 * @returns A `file:` URL string.
 */
export function toFileUrl(path: string): string {
  return pathToFileURL(path).href;
}

/**
 * Flattens one or more load references into a string array.
 *
 * @param inputPath - Input path option value.
 * @returns A list of string references.
 */
export function normalizeInputPaths(
  inputPath: LoadReference | LoadReference[]
): string[] {
  return toArray(inputPath).map(reference => {
    if (!isString(reference)) {
      throw new TypeError(
        `Unsupported Prisma schema reference: ${String(reference)}. Expected a filesystem path string.`
      );
    }

    return reference;
  });
}
