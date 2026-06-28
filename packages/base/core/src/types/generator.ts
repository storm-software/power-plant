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

import type { SchemaConfig } from "@power-plant/schema";
import type { InferLoadOptions, LoadReference } from "@stryke/resolve/types";
import type { Input, InputConfig } from "./input";
import type { Output, OutputConfig } from "./output";
import type { SchemaOf } from "./schema";

// eslint-disable-next-line unused-imports/no-unused-vars, ts/no-unused-vars
export interface GeneratorMeta<TSpec, TOptions extends object> {
  /**
   * A string description (or a function that returns a string) outlining the purpose or behavior of the generator.
   */
  description?: string | ((spec: TSpec) => string);
}

export interface GeneratorConfigObject<
  TSpec,
  TOptions extends object,
  TReturns = void
> {
  /**
   * Optional metadata about the generator, such as a description of the output it produces.
   */
  meta?: GeneratorMeta<TSpec, TOptions>;

  /**
   * The schema config that defines the structure of the specification object for this generator.
   */
  schema: SchemaConfig<TSpec>;

  /**
   * The input config for the generator specification.
   */
  input: InputConfig<TSpec, TOptions>;

  /**
   * The output config that consumes generated output.
   */
  output: OutputConfig<TSpec, TOptions, TReturns>;
}

export type GeneratorConfig<TSpec, TOptions extends object, TReturns = void> =
  LoadReference | GeneratorConfigObject<TSpec, TOptions, TReturns>;

export type InferCreateGeneratorOptions<
  T extends GeneratorConfig<any, any, any>
> = T extends LoadReference
  ? InferLoadOptions<T>
  : // eslint-disable-next-line ts/no-empty-object-type
    {};

export interface Generator<TSpec, TOptions extends object, TReturns = void> {
  /**
   * Optional metadata about the generator, such as a description of the output it produces.
   */
  meta?: GeneratorMeta<TSpec, TOptions>;

  /**
   * The schema config that defines the structure of the specification object for this generator.
   */
  schema: SchemaOf<TSpec, TOptions>;

  /**
   * The input of the generator, which can be used to specify where the generator retrieves its input data from. This can be defined as a function that takes the specification and returns a value, or it can be a static value.
   */
  input: Input<TSpec, TOptions>;

  /**
   * The output of the generator, which can be used to specify where the generator sends its output data. This can be defined as a function that takes the specification and returns a value, or it can be a static value.
   */
  output: Output<TSpec, TOptions, TReturns>;

  /**
   * The generate function that executes the generator logic, taking in options and producing output based on the input and output definitions.
   *
   * @param options - The options to be passed to the generator, which can be used to influence the generation process.
   * @returns A promise that resolves when the generation process is complete.
   */
  generate: (options: TOptions) => Promise<TReturns>;
}
