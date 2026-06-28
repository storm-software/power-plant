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
  InferExtractOptions,
  SchemaEnvelopeOf,
  SchemaSourceInput
} from "@power-plant/schema";
import type { Meta, MetaInput, MetaValue } from "./meta";

export type SchemaMetaExample<TSpec> =
  | TSpec
  | { description?: string; value: TSpec };

export interface SchemaMetaInput<
  TSpec,
  TOptions extends object
> extends MetaInput<TSpec, TOptions> {
  /**
   * Examples of valid data for the schema. This can be a single example or an array of examples.
   */
  examples?:
    | SchemaMetaExample<TSpec>
    | MetaValue<TSpec, TOptions, SchemaMetaExample<TSpec>[]>;
}

export interface SchemaMeta<TSpec, TOptions extends object> extends Meta<
  TSpec,
  TOptions
> {
  /**
   * Examples of valid data for the schema.
   */
  examples: MetaValue<TSpec, TOptions, SchemaMetaExample<TSpec>[]>;
}

/**
 * Schema input wrapper that attaches optional contextual metadata.
 */
export interface SchemaInputObject<TSpec, TOptions extends object> {
  /**
   * The schema that defines the structure of the specification input for the generator. This schema is used to validate the input specification and ensure that it conforms to the expected format before being processed by the generator.
   */
  schema: SchemaSourceInput<TSpec> | SchemaEnvelopeOf<TSpec>;

  /**
   * Optional metadata that provides contextual information for the schema.
   */
  meta?: SchemaMetaInput<TSpec, TOptions>;
}

export type InferCreateSchemaOptions<
  T extends
    | SchemaSourceInput<any>
    | SchemaEnvelopeOf<any>
    | SchemaInputObject<any, any>
> = T extends SchemaSourceInput<any> | SchemaEnvelopeOf<any>
  ? InferExtractOptions<T>
  : // eslint-disable-next-line ts/no-empty-object-type
    {};

/**
 * A schema extracted from a source input, normalized to JSON Schema.
 */
export interface Schema<
  TSpec,
  TOptions extends object
> extends SchemaEnvelopeOf<TSpec> {
  /**
   * Optional contextual metadata associated with the schema.
   */
  meta: SchemaMeta<TSpec, TOptions>;
}

/**
 * A normalized JSON Schema extracted from a source input of type `T`. This type represents the result of the schema extraction process, where a raw schema input (which could be in various formats such as Zod, Untyped, Valibot, or as a type definition in TypeScript source code) is transformed into a standardized JSON Schema format. The `SchemaOf<T>` type captures the normalized JSON Schema along with metadata about the source variant and a content hash for caching or identification purposes.
 *
 * @template TSpec - The original TypeScript type for which the schema is being extracted. This type parameter is used to derive the appropriate JSON Schema representation based on the structure and constraints of `T`.
 *
 * @see {@link Schema}
 */
export type SchemaOf<TSpec, TOptions extends object> = Schema<TSpec, TOptions>;
