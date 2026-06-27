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

import type { SinkInput, SinkInputObject } from "../types";
import { isSinkInputObject } from "./helpers";

/**
 * Defines a sink input object. If the provided sink is already a sink input object, it will be returned as-is. Otherwise, it will be wrapped in an object with a `sink` property.
 *
 * @example
 * ```ts
 * import { defineSink } from "@power-plant/core";
 *
 * // Define a sink from a sink function
 * export default defineSink((spec, options) => {
 *   // Your sink logic here
 * });
 *
 * // Define a sink from an existing sink input object
 * export default defineSink({
 *  meta: {
 *     name: "My Sink",
 *     version: "1.0.0",
 *     description: "A sink that does something.",
 *   },
 *   schema: z.object({
 *     // Your schema definition here
 *   }),
 *   sink: (spec, options) => {
 *     // Your sink logic here
 *   },
 * });
 * ```
 *
 * @param sink - The sink input to define. This can be either a sink input object or a sink function.
 * @returns A sink input object that contains the provided sink. If the input was already a sink input object, it will be returned unchanged.
 */
export function defineSink<TSpec, TOptions extends object, TReturns = void>(
  sink: SinkInput<TSpec, TOptions, TReturns>
): SinkInputObject<TSpec, TOptions, TReturns> {
  if (isSinkInputObject<TSpec, TOptions, TReturns>(sink)) {
    return sink;
  }

  return { sink };
}
