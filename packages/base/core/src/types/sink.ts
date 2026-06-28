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
import type { InferLoadOptions, LoadInput } from "@stryke/resolve/types";
import type { MaybePromise } from "@stryke/types/base";
import type { Meta, MetaInput } from "./meta";
import type { SchemaInputObject, SchemaOf } from "./schema";

export type SinkFunction<TSpec, TOptions extends object, TReturns = void> = (
  spec: TSpec,
  context: TOptions
) => MaybePromise<TReturns>;

export interface SinkMetaInput<
  TSpec,
  TOptions extends object
> extends MetaInput<TSpec, TOptions> {
  /**
   * A string that describes how the specification will be extracted or generated. This property can provide context about the source of the specification, such as whether it is derived from a file, a database, an API, or any other source. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  produces?: string;
}

export interface SinkMeta<TSpec, TOptions extends object> extends Meta<
  TSpec,
  TOptions
> {
  /**
   * A string that describes how the specification will be extracted or generated. This property can provide context about the source of the specification, such as whether it is derived from a file, a database, an API, or any other source. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  produces?: string;
}

export interface SinkInputObject<
  TSpec,
  TOptions extends object,
  TReturns = void
> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema?:
    | SchemaSourceInput<TSpec>
    | SchemaEnvelopeOf<TSpec>
    | SchemaInputObject<TSpec, TOptions>;

  /**
   * Optional metadata that provides contextual information for the sink.
   */
  meta?: SinkMeta<TSpec, TOptions>;

  /**
   * The sink implementation, either as a callable function or a file reference.
   */
  sink: SinkFunction<TSpec, TOptions, TReturns> | LoadInput;
}

export type SinkInput<TSpec, TOptions extends object, TReturns = void> =
  | LoadInput
  | SinkFunction<TSpec, TOptions, TReturns>
  | SinkInputObject<TSpec, TOptions, TReturns>;

export type InferCreateSinkOptions<T extends SinkInput<any, any, any>> =
  T extends LoadInput
    ? InferLoadOptions<T>
    : // eslint-disable-next-line ts/no-empty-object-type
      {};

export interface Sink<TSpec, TOptions extends object, TReturns = void> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema: SchemaOf<TSpec, TOptions>;

  /**
   * Optional metadata that provides contextual information for the sink.
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
  sink: SinkFunction<TSpec, TOptions, TReturns>;
}
