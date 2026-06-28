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

import { isSetObject } from "@stryke/type-checks/is-set-object";
import type { SchemaInputObject } from "../types/schema";

/**
 * Checks if the provided input is a {@link SchemaInputObject}.
 *
 * @param input - The input to check.
 * @returns True if the input is a {@link SchemaInputObject}, false otherwise.
 */
export function isSchemaInputObject<TSpec, TOptions extends object>(
  input: unknown
): input is SchemaInputObject<TSpec, TOptions> {
  return isSetObject(input) && "schema" in input && input.schema !== undefined;
}
