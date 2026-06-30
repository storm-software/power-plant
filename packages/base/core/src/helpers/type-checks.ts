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
import type { GeneratorConfigObject } from "../types/generator";
import type { InputConfigObject } from "../types/input";
import type { OutputConfigObject } from "../types/output";
import type { SchemaConfigObject } from "../types/schema";

/**
 * Checks if the provided configuration is a {@link GeneratorConfigObject}.
 *
 * @param config - The configuration to check.
 * @returns True if the configuration is a {@link GeneratorConfigObject}, false otherwise.
 */
export function isGeneratorConfigObject<
  TSpec,
  TOptions extends object,
  TReturns = void
>(config: unknown): config is GeneratorConfigObject<TSpec, TOptions, TReturns> {
  return (
    isSetObject(config) &&
    "schema" in config &&
    "input" in config &&
    "output" in config &&
    config.schema !== undefined &&
    config.input !== undefined &&
    config.output !== undefined
  );
}

/**
 * Checks if the provided input is a {@link InputConfigObject}.
 *
 * @param input - The input to check.
 * @returns True if the input is a {@link InputConfigObject}, false otherwise.
 */
export function isInputConfigObject<TSpec, TOptions extends object>(
  input: unknown
): input is InputConfigObject<TSpec, TOptions> {
  return isSetObject(input) && "input" in input && input.input !== undefined;
}

/**
 * Checks if the provided input is a {@link OutputConfigObject}.
 *
 * @param config - The input to check.
 * @returns True if the input is a {@link OutputConfigObject}, false otherwise.
 */
export function isOutputConfigObject<
  TSpec,
  TOptions extends object,
  TReturns = void
>(config: unknown): config is OutputConfigObject<TSpec, TOptions, TReturns> {
  return (
    isSetObject(config) && "output" in config && config.output !== undefined
  );
}

/**
 * Checks if the provided configuration is a {@link SchemaConfigObject}.
 *
 * @param config - The configuration to check.
 * @returns True if the configuration is a {@link SchemaConfigObject}, false otherwise.
 */
export function isSchemaConfigObject<TSpec, TOptions extends object>(
  config: unknown
): config is SchemaConfigObject<TSpec, TOptions> {
  return (
    isSetObject(config) && "schema" in config && config.schema !== undefined
  );
}
