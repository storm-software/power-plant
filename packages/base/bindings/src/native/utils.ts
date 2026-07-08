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

import type { BindingError } from "../bindings.cjs";

/**
 * Check if the provided value is a binding failure result, which indicates that the binding operation failed and contains an array of errors. This function is used to determine if the result of a binding operation is a failure, allowing for appropriate error handling and reporting.
 *
 * @param value - The value to check for being a binding failure result.
 * @returns A boolean indicating whether the value is a binding failure result.
 */
export function isBindingFailureResult(value: unknown): value is {
  errors: BindingError[];
  isBindingErrors: boolean;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "isBindingErrors" in value &&
    typeof (value as { isBindingErrors: boolean }).isBindingErrors ===
      "boolean" &&
    "errors" in value &&
    Array.isArray((value as any).errors) &&
    (value as { errors: BindingError[] }).errors.every(
      (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string"
    )
  );
}
