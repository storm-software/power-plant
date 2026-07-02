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
import type { MaybePromise } from "@stryke/types/base";
import type { GeneratedDocument } from "./generator";
import type { Meta, MetaConfig } from "./meta";
import type { SchemaConfigObject, SchemaOf } from "./schema";

export type OutputFunction<TSpec, TOptions extends object, TReturns = void> = (
  spec: TSpec,
  options: TOptions,
  documents: GeneratedDocument<TSpec, TOptions>[]
) => MaybePromise<TReturns>;

export interface OutputMetaConfig<
  TSpec,
  TOptions extends object
> extends MetaConfig<TSpec, TOptions> {
  /**
   * A string that describes how the specification will be extracted or generated. This property can provide context about the source of the specification, such as whether it is derived from a file, a database, an API, or any other source. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  produces?: string;
}

export interface OutputMeta<TSpec, TOptions extends object> extends Meta<
  TSpec,
  TOptions
> {
  /**
   * A string that describes how the specification will be extracted or generated. This property can provide context about the source of the specification, such as whether it is derived from a file, a database, an API, or any other source. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  produces?: string;
}

export interface OutputConfigObject<
  TSpec,
  TOptions extends object,
  TReturns = void
> {
  /**
   * The schema that defines the structure of the specification output for the generator. This schema is used to validate the output specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema?: SchemaConfig<TSpec> | SchemaConfigObject<TSpec, TOptions>;

  /**
   * Optional metadata that provides contextual information for the output.
   */
  meta?: OutputMetaConfig<TSpec, TOptions>;

  /**
   * The output implementation, either as a callable function or a file reference.
   */
  output: OutputFunction<TSpec, TOptions, TReturns> | LoadReference;
}

export type OutputConfig<TSpec, TOptions extends object, TReturns = void> =
  | LoadReference
  | OutputFunction<TSpec, TOptions, TReturns>
  | OutputConfigObject<TSpec, TOptions, TReturns>;

export type InferCreateOutputOptions<T extends OutputConfig<any, any, any>> =
  T extends LoadReference
    ? InferLoadOptions<T>
    : // eslint-disable-next-line ts/no-empty-object-type
      {};

export interface Output<TSpec, TOptions extends object, TReturns = void> {
  /**
   * The schema that defines the structure of the specification output for the generator. This schema is used to validate the output specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema: SchemaOf<TSpec, TOptions>;

  /**
   * Optional metadata that provides contextual information for the output.
   */
  meta?: OutputMeta<TSpec, TOptions>;

  /**
   * The output of the generator, which can be used to specify where the generator sends its output data. This can be defined as a function that takes the specification and returns a value, or it can be a static value.
   *
   * @remarks
   * The `output` property is defined as a function that takes the specification object and any additional parameters, and returns a value or a promise that resolves to a value. This allows for flexibility in how the generator sends its output data, enabling both synchronous and asynchronous data handling based on the specification.
   *
   * @param spec - The specification object that conforms to the defined schema output.
   * @param options - Additional parameters that may be needed for the output function to process the output data.
   * @param documents - An array of generated documents that are produced by the generator. This can be used to provide context or additional information to the output function when processing the output data.
   * @returns A promise that resolves when the output function is complete.
   */
  output: OutputFunction<TSpec, TOptions, TReturns>;
}
