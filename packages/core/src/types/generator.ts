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

import type { SchemaInput } from "@power-plant/schema";
import type { MaybePromise } from "@stryke/types/base";

export interface GeneratorMeta<TSpec> {
  /**
   * A string description (or a function that returns a string) of the type of output this generator produces.
   */
  outputs?: string | ((spec: TSpec) => string);
}

export interface Generator<TSpec, TOptions = any> {
  /**
   * Optional metadata about the generator, such as a description of the output it produces.
   */
  meta?: GeneratorMeta<TSpec>;

  /**
   * The schema input that defines the structure of the specification object for this generator.
   */
  schema: SchemaInput<TSpec>;

  /**
   * The function that generates output based on the provided specification and options. It can return a string or a promise that resolves to a string.
   *
   * @param spec - The specification object that conforms to the defined schema input.
   * @param options - Additional options that may be needed for the generation process. The structure of this object can be defined by the user of the generator.
   * @returns A promise that resolves to a string when the generation process is complete.
   */
  generate: (spec: TSpec, options: TOptions) => MaybePromise<string>;
}
