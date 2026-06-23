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

export interface SourceMeta<TSpec, TOptions = never> {
  /**
   * A string description (or a function that returns a string) of the expected method of gathering input for the source.
   */
  description?:
    | string
    | (TOptions extends never
        ? (spec: TSpec) => string
        : (spec: TSpec, options: TOptions) => string);
}

export type SourceFunction<TSpec, TOptions = never> = TOptions extends never
  ? (spec: TSpec) => MaybePromise<TSpec>
  : (spec: TSpec, options: TOptions) => MaybePromise<TSpec>;

export type SourceValue<TSpec, TOptions = never> =
  | TSpec
  | SourceFunction<TSpec, TOptions>
  | Promise<TSpec>
  | FileReferenceInput;

export interface SourceInputWithMeta<TSpec, TOptions = never> {
  /**
   * The source implementation, which can be a static value, function, promise, or file reference.
   */
  source: SourceValue<TSpec, TOptions>;

  /**
   * Optional metadata that provides contextual information for the source.
   */
  meta?: SourceMeta<TSpec, TOptions>;
}

export type SourceInput<TSpec, TOptions = never> =
  | SourceValue<TSpec, TOptions>
  | SourceInputWithMeta<TSpec, TOptions>;

export interface Source<TSpec, TOptions = never> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema: SchemaOf<TSpec>;

  /**
   * Optional metadata that provides contextual information for the source.
   */
  meta?: SourceMeta<TSpec, TOptions>;

  /**
   * The source of the generator, which can be used to specify where the generator retrieves its input data from. This can be defined as a function that takes the specification and returns a value, or it can be a static value.
   *
   * @remarks
   * The `source` property can be either a static value of type `TSpec` or a function that takes the specification object and returns a value of type `TSpec` or a promise that resolves to `TSpec`. This allows for flexibility in how the generator retrieves its input data, enabling both synchronous and asynchronous data retrieval based on the specification.
   *
   * @param options - The options object that can be used to influence the generation process.
   * @returns A value or a promise that resolves to a value, which will be used as the input data for the generator.
   */
  source: TSpec | SourceFunction<TSpec, TOptions>;
}
