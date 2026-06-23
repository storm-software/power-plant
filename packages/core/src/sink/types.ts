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

import type { SchemaOf } from "@power-plant/schema/types";
import type { MaybePromise } from "@stryke/types/base";
import type { FileReferenceInput } from "@stryke/types/configuration";

export type SinkFunction<TSpec, TOptions = never> = TOptions extends never
  ? (spec: TSpec) => MaybePromise<TSpec>
  : (spec: TSpec, options: TOptions) => MaybePromise<void>;

export interface SinkMeta<TSpec, TOptions = never> {
  /**
   * A string description (or a function that returns a string) of the eventual output of the sink.
   */
  description?:
    | string
    | (TOptions extends never
        ? (spec: TSpec) => string
        : (spec: TSpec, options: TOptions) => string);
}

export interface SinkInputWithMeta<TSpec, TOptions = never> {
  /**
   * The sink implementation, either as a callable function or a file reference.
   */
  sink: SinkFunction<TSpec, TOptions> | FileReferenceInput;

  /**
   * Optional metadata that provides contextual information for the schema.
   */
  meta?: SinkMeta<TSpec, TOptions>;
}

export type SinkInput<TSpec, TOptions = never> =
  | FileReferenceInput
  | SinkFunction<TSpec, TOptions>
  | SinkInputWithMeta<TSpec, TOptions>;

export interface Sink<TSpec, TOptions = never> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema: SchemaOf<TSpec>;

  /**
   * Optional metadata that provides contextual information for the schema.
   */
  meta?: SinkMeta<TSpec, TOptions>;

  /**
   * The sink of the generator, which can be used to specify where the generator sends its output data. This can be defined as a function that takes the specification and returns a value, or it can be a static value.
   *
   * @remarks
   * The `sink` property is defined as a function that takes the specification object and any additional parameters, and returns a value or a promise that resolves to a value. This allows for flexibility in how the generator sends its output data, enabling both synchronous and asynchronous data handling based on the specification.
   *
   * @param spec - The specification object that conforms to the defined schema input.
   * @param params - Additional parameters that may be needed for the sink function to process the output data.
   * @returns A value or a promise that resolves to a value, which will be used as the output data for the generator.
   */
  sink: SinkFunction<TSpec, TOptions>;
}
