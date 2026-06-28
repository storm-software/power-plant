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

import type { OutputConfig, OutputConfigObject } from "../types";
import { isOutputConfigObject } from "./helpers";

/**
 * Defines a output configuration object. If the provided output is already a output configuration object, it will be returned as-is. Otherwise, it will be wrapped in an object with a `output` property.
 *
 * @example
 * ```ts
 * import { defineOutput } from "@power-plant/core";
 *
 * // Define a output from a output function
 * export default defineOutput((spec, options) => {
 *   // Your output logic here
 * });
 *
 * // Define a output from an existing output configuration object
 * export default defineOutput({
 *  meta: {
 *     name: "My Output",
 *     version: "1.0.0",
 *     description: "A output that does something.",
 *   },
 *   schema: z.object({
 *     // Your schema definition here
 *   }),
 *   output: (spec, options) => {
 *     // Your output logic here
 *   },
 * });
 * ```
 *
 * @param output - The output configuration to define. This can be either a output configuration object or a output function.
 * @returns A output configuration object that contains the provided output. If the input was already a output configuration object, it will be returned unchanged.
 */
export function defineOutput<TSpec, TOptions extends object, TReturns = void>(
  output: OutputConfig<TSpec, TOptions, TReturns>
): OutputConfigObject<TSpec, TOptions, TReturns> {
  if (isOutputConfigObject<TSpec, TOptions, TReturns>(output)) {
    return output;
  }

  return { output };
}
