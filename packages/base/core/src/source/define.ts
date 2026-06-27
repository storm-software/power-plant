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

import type { SourceInput, SourceInputObject } from "../types/source";
import { isSourceInputObject } from "./helpers";

/**
 * Defines a source input object. If the provided source is already a source input object, it will be returned as-is. Otherwise, it will be wrapped in an object with a `source` property.
 *
 * @example
 * ```ts
 * import { defineSource } from "@power-plant/core";
 *
 * // Define a source from a source function
 * export default defineSource((options) => {
 *   // Your source logic here
 * });
 *
 * // Define a source from an existing source input object
 * export default defineSource({
 *  meta: {
 *     name: "My Source",
 *     version: "1.0.0",
 *     description: "A source that does something.",
 *   },
 *   schema: z.object({
 *     // Your schema definition here
 *   }),
 *   source: (options) => {
 *     // Your source logic here
 *   },
 * });
 * ```
 *
 * @param source - The source input to define. This can be either a source input object or a source function.
 * @returns A source input object that contains the provided source. If the input was already a source input object, it will be returned unchanged.
 */
export function defineSource<TSpec, TOptions extends object>(
  source: SourceInput<TSpec, TOptions>
): SourceInputObject<TSpec, TOptions> {
  if (isSourceInputObject<TSpec, TOptions>(source)) {
    return source;
  }

  return { source };
}
