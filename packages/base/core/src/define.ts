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

import type { SchemaEnvelopeOf, SchemaSourceConfig } from "@power-plant/schema";
import {
  isGeneratorConfigObject,
  isInputConfigObject,
  isOutputConfigObject,
  isSchemaConfigObject
} from "./helpers/type-checks";
import type { GeneratorConfigObject } from "./types/generator";
import type { InputConfig, InputConfigObject } from "./types/input";
import type { OutputConfig, OutputConfigObject } from "./types/output";
import type { SchemaConfigObject } from "./types/schema";

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

/**
 * Defines a schema configuration object. If the provided schema is already a schema configuration object, it will be returned as-is. Otherwise, it will be wrapped in an object with a `schema` property.
 *
 * @param schema - The schema configuration to define. This can be either a schema source configuration, a schema envelope, or a schema configuration object.
 * @returns A schema configuration object that contains the provided schema. If the input was already a schema configuration object, it will be returned unchanged.
 */
export function defineSchema<TSpec, TOptions extends object>(
  schema:
    | SchemaSourceConfig<TSpec>
    | SchemaEnvelopeOf<TSpec>
    | SchemaConfigObject<TSpec, TOptions>
): SchemaConfigObject<TSpec, TOptions> {
  if (isSchemaConfigObject<TSpec, TOptions>(schema)) {
    return schema;
  }

  return { schema };
}

/**
 * Defines a schema configuration object. If the provided schema is already a schema configuration object, it will be returned as-is. Otherwise, it will be wrapped in an object with a `schema` property.
 *
 * @param generator - The schema configuration to define. This can be either a schema source configuration, a schema envelope, or a schema configuration object.
 * @returns A schema configuration object that contains the provided schema. If the input was already a schema configuration object, it will be returned unchanged.
 */
export function defineGenerator<
  TSpec,
  TOptions extends object,
  TReturns = void
>(
  generator: GeneratorConfigObject<TSpec, TOptions, TReturns>
): GeneratorConfigObject<TSpec, TOptions, TReturns> {
  if (!isGeneratorConfigObject<TSpec, TOptions, TReturns>(generator)) {
    throw new TypeError("Invalid generator configuration provided.");
  }

  return generator;
}
