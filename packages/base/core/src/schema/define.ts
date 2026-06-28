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

import type {
  SchemaEnvelopeOf,
  SchemaSourceInput
} from "@power-plant/schema/types";
import type { SchemaInputObject } from "../types/schema";
import { isSchemaInputObject } from "./helpers";

/**
 * Defines a schema input object. If the provided schema is already a schema input object, it will be returned as-is. Otherwise, it will be wrapped in an object with a `schema` property.
 *
 * @param schema - The schema input to define. This can be either a schema source input, a schema envelope, or a schema input object.
 * @returns A schema input object that contains the provided schema. If the input was already a schema input object, it will be returned unchanged.
 */
export function defineSchema<TSpec, TOptions extends object>(
  schema:
    | SchemaSourceInput<TSpec>
    | SchemaEnvelopeOf<TSpec>
    | SchemaInputObject<TSpec, TOptions>
): SchemaInputObject<TSpec, TOptions> {
  if (isSchemaInputObject<TSpec, TOptions>(schema)) {
    return schema;
  }

  return { schema };
}
