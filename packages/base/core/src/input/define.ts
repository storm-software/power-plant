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

import type { InputConfig, InputConfigObject } from "../types/input";
import { isInputConfigObject } from "./helpers";

/**
 * Defines a input configuration object. If the provided input is already a input configuration object, it will be returned as-is. Otherwise, it will be wrapped in an object with a `input` property.
 *
 * @example
 * ```ts
 * import { defineInput } from "@power-plant/core";
 *
 * // Define a input from a input function
 * export default defineInput((options) => {
 *   // Your input logic here
 * });
 *
 * // Define a input from an existing input input object
 * export default defineInput({
 *  meta: {
 *     name: "My Input",
 *     version: "1.0.0",
 *     description: "A input that does something.",
 *   },
 *   schema: z.object({
 *     // Your schema definition here
 *   }),
 *   input: (options) => {
 *     // Your input logic here
 *   },
 * });
 * ```
 *
 * @param input - The input input to define. This can be either a input input object or a input function.
 * @returns A input input object that contains the provided input. If the input was already a input input object, it will be returned unchanged.
 */
export function defineInput<TSpec, TOptions extends object>(
  input: InputConfig<TSpec, TOptions>
): InputConfigObject<TSpec, TOptions> {
  if (isInputConfigObject<TSpec, TOptions>(input)) {
    return input;
  }

  return { input };
}
