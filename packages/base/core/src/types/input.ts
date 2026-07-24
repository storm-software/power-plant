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

import type { BaseExtractOptions, SchemaConfig } from "@power-plant/schema";
import type { InferLoadOptions, LoadReference } from "@stryke/resolve/types";
import type { MaybePromise } from "@stryke/types/base";
import type { MetaConfig } from "./meta";
import type { SchemaConfigObject, SchemaOf } from "./schema";

export interface InputMetaConfig extends MetaConfig {
  /**
   * A string that describes how the specification will be read/extracted.
   */
  readFrom?: string;
}

export type InputFunction<TSpec, TOptions extends object> = (
  options: TOptions
) => MaybePromise<TSpec>;

export interface InputConfigObject<TSpec, TOptions extends object> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema?: SchemaConfig<TSpec> | SchemaConfigObject<TSpec>;

  /**
   * The input implementation, either as a callable function, a static value, or a file reference.
   */
  input: TSpec | InputFunction<TSpec, TOptions> | LoadReference;

  /**
   * Optional metadata that provides contextual information for the input.
   */
  meta?: InputMetaConfig;
}

export type InputConfig<TSpec, TOptions extends object> =
  | LoadReference
  | TSpec
  | InputFunction<TSpec, TOptions>
  | InputConfigObject<TSpec, TOptions>;

export type InferCreateInputOptions<T extends InputConfig<any, any>> =
  (T extends LoadReference
    ? InferLoadOptions<T>
    : // eslint-disable-next-line ts/no-empty-object-type
      {}) &
    BaseExtractOptions;

export interface Input<TSpec, TOptions extends object> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema: SchemaOf<TSpec>;

  /**
   * Optional metadata that provides contextual information for the input.
   */
  meta?: InputMetaConfig;

  /**
   * The input of the generator, which can be used to specify where the generator retrieves its input data from. This can be defined as a function that takes the specification and returns a value, or it can be a static value.
   *
   * @remarks
   * The `input` property can be either a static value of type `TSpec` or a function that takes the specification object and returns a value of type `TSpec` or a promise that resolves to `TSpec`. This allows for flexibility in how the generator retrieves its input data, enabling both synchronous and asynchronous data retrieval based on the specification.
   *
   * @param options - The options object that can be used to influence the generation process.
   * @returns A value or a promise that resolves to a value, which will be used as the input data for the generator.
   */
  input: TSpec | InputFunction<TSpec, TOptions>;
}
