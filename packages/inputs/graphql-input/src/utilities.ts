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

import type { UnnormalizedTypeDefPointer } from "@graphql-tools/load";
import { isFileReference } from "@stryke/resolve/type-checks";
import type { LoadReference } from "@stryke/resolve/types";
import { isString } from "@stryke/type-checks/is-string";
import { isURL } from "@stryke/type-checks/is-url";
import { GraphQLError } from "graphql";

/**
 * Converts a Power Plant {@link LoadReference} into a pointer understood by `@graphql-tools/load`.
 *
 * @param reference - The reference to convert.
 * @returns The unnormalized type definition pointer.
 */
export function toSchemaPointer(
  reference: LoadReference
): UnnormalizedTypeDefPointer {
  if (isFileReference(reference)) {
    return reference.file;
  }

  if (isString(reference)) {
    return reference;
  }

  if (isURL(reference)) {
    return reference.toString();
  }

  return String(reference);
}

/**
 * Formats a load error into a string.
 *
 * @param error - The error to format.
 * @returns The formatted error.
 */
export function formatLoadError(error: unknown): string {
  if (error instanceof GraphQLError) {
    return String(error);
  }

  if (error instanceof Error) {
    return [error.message, error.stack].filter(Boolean).join("\n");
  }

  return String(error);
}
