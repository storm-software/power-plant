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

export type SourceFunction<TSpec, TOptions extends object> = (
  options: TOptions
) => MaybePromise<TSpec>;

export interface SourceMetaInput<
  TSpec,
  TOptions extends object
> extends MetaInput<TSpec, TOptions> {
  /**
   * A string that describes how the specification will be extracted/generated. This property can provide context about the source of the specification, such as whether it is derived from a file, a database, an API, or any other source. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  input?: string;
}

export interface SourceMeta<TSpec, TOptions extends object> extends Meta<
  TSpec,
  TOptions
> {
  /**
   * A string that describes how the specification will be extracted/generated. This property can provide context about the source of the specification, such as whether it is derived from a file, a database, an API, or any other source. The presence of this property does not affect the validation behavior of the schema itself, but it can provide additional context or information about the expected data when used in conjunction with compatible tools.
   */
  input?: string;
}

export interface SourceInputObject<TSpec, TOptions extends object> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema?:
    | SchemaSourceInput<TSpec>
    | SchemaEnvelopeOf<TSpec>
    | SchemaInputObject<TSpec, TOptions>;

  /**
   * The source implementation, either as a callable function, a static value, or a file reference.
   */
  source: TSpec | SourceFunction<TSpec, TOptions> | LoadInput;

  /**
   * Optional metadata that provides contextual information for the source.
   */
  meta?: SourceMetaInput<TSpec, TOptions>;
}

export type SourceInput<TSpec, TOptions extends object> =
  | LoadInput
  | TSpec
  | SourceFunction<TSpec, TOptions>
  | SourceInputObject<TSpec, TOptions>;

export type InferCreateSourceOptions<T extends SourceInput<any, any>> =
  T extends LoadInput
    ? InferLoadOptions<T>
    : // eslint-disable-next-line ts/no-empty-object-type
      {};

export interface Source<TSpec, TOptions extends object> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema: SchemaOf<TSpec, TOptions>;

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
