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
  GeneratorConfig,
  GeneratorConfigObject,
  InferInputConfig,
  InferOutputConfig,
  InferSchemaConfig
} from "@power-plant/core";

export type AnyGeneratorConfig = GeneratorConfig<any, any, any>;

export type InferGeneratorSpec<T extends AnyGeneratorConfig> =
  T extends GeneratorConfigObject<infer TSpec, any, any> ? TSpec : unknown;

export type InferGeneratorOptions<T extends AnyGeneratorConfig> =
  T extends GeneratorConfigObject<any, infer TOptions, any>
    ? TOptions
    : // eslint-disable-next-line ts/no-empty-object-type
      {};

export type InferGeneratorReturns<T extends AnyGeneratorConfig> =
  T extends GeneratorConfigObject<any, any, infer TReturns> ? TReturns : void;

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

// #region Pipe Types

/**
 * Last element of a readonly tuple/array type.
 */
type LastOf<T extends readonly unknown[]> = T extends readonly [
  ...infer _Rest,
  infer Last
]
  ? Last
  : never;

/**
 * Spec shape as a tuple aligned with each generator in the pipe.
 *
 * @example
 * `[TsSpec, PySpec]`
 */
export type PipeSpec<TGenerators extends AnyGeneratorConfig[]> = {
  [I in keyof TGenerators]: InferGeneratorSpec<
    Extract<TGenerators[I], AnyGeneratorConfig>
  >;
};

/**
 * Intersection of all generator option types in the pipe.
 */
export type PipeOptions<TGenerators extends AnyGeneratorConfig[]> =
  UnionToIntersection<
    {
      [I in keyof TGenerators]: InferGeneratorOptions<
        Extract<TGenerators[I], AnyGeneratorConfig>
      >;
    }[number]
  > &
    object;

/**
 * Return type of the last generator in the pipe.
 */
export type PipeReturns<TGenerators extends AnyGeneratorConfig[]> =
  InferGeneratorReturns<Extract<LastOf<TGenerators>, AnyGeneratorConfig>>;

/**
 * Schema configs as a tuple aligned with each generator in the pipe.
 */
export type PipeSchemas<TGenerators extends AnyGeneratorConfig[]> = {
  [I in keyof TGenerators]: InferSchemaConfig<
    Extract<TGenerators[I], AnyGeneratorConfig>
  >;
};

/**
 * Input configs as a tuple aligned with each generator in the pipe.
 */
export type PipeInputs<TGenerators extends AnyGeneratorConfig[]> = {
  [I in keyof TGenerators]: InferInputConfig<
    Extract<TGenerators[I], AnyGeneratorConfig>
  >;
};

/**
 * Output configs as a tuple aligned with each generator in the pipe.
 */
export type PipeOutputs<TGenerators extends AnyGeneratorConfig[]> = {
  [I in keyof TGenerators]: InferOutputConfig<
    Extract<TGenerators[I], AnyGeneratorConfig>
  >;
};

/**
 * Generator config whose `generator` is an ordered array of child configs.
 *
 * @remarks
 * `schema` / `input` validate and produce the tuple {@link PipeSpec}.
 * `output` produces {@link PipeReturns} (last generator only; all outputs run).
 * When `schema` is omitted, the composed input/output schemas from
 * {@link pipeInputs} / {@link pipeOutputs} are used instead.
 */
export type PipeGeneratorConfig<TGenerators extends AnyGeneratorConfig[]> =
  Omit<
    GeneratorConfigObject<
      PipeSpec<TGenerators>,
      PipeOptions<TGenerators>,
      PipeReturns<TGenerators>
    >,
    "generator"
  > & {
    generator: [...TGenerators];
  };

// #endregion Pipe Types

// #region Combine Types

/**
 * Spec shape joined by each generator's string key.
 *
 * @example
 * `{ typescript: TsSpec; python: PySpec }`
 */
export type CombinedSpec<
  TGenerators extends Record<string, AnyGeneratorConfig>
> = {
  [K in keyof TGenerators]: InferGeneratorSpec<TGenerators[K]>;
};

/**
 * Intersection of all generator option types in the combined map.
 */
export type CombinedOptions<
  TGenerators extends Record<string, AnyGeneratorConfig>
> = UnionToIntersection<
  {
    [K in keyof TGenerators]: InferGeneratorOptions<TGenerators[K]>;
  }[keyof TGenerators]
> &
  object;

/**
 * Return shape joined by each generator's string key.
 *
 * @example
 * `{ typescript: TsReturns; python: PyReturns }`
 */
export type CombinedReturns<
  TGenerators extends Record<string, AnyGeneratorConfig>
> = {
  [K in keyof TGenerators]: InferGeneratorReturns<TGenerators[K]>;
};

/**
 * Schema configs joined by each generator's string key.
 */
export type CombinedSchemas<
  TGenerators extends Record<string, AnyGeneratorConfig>
> = {
  [K in keyof TGenerators]: InferSchemaConfig<TGenerators[K]>;
};

/**
 * Input configs joined by each generator's string key.
 */
export type CombinedInputs<
  TGenerators extends Record<string, AnyGeneratorConfig>
> = {
  [K in keyof TGenerators]: InferInputConfig<TGenerators[K]>;
};

/**
 * Output configs joined by each generator's string key.
 */
export type CombinedOutputs<
  TGenerators extends Record<string, AnyGeneratorConfig>
> = {
  [K in keyof TGenerators]: InferOutputConfig<TGenerators[K]>;
};

/**
 * Generator config whose `generator` is a string-keyed map of child configs.
 *
 * @remarks
 * `schema` / `input` / `output` validate and produce the joined
 * {@link CombinedSpec} / {@link CombinedReturns} shapes (keys match `generator`).
 * When `schema` is omitted, the composed input/output schemas from
 * {@link combineInputs} / {@link combineOutputs} are used instead.
 */
export type CombinedGeneratorConfig<
  TGenerators extends Record<string, AnyGeneratorConfig>
> = Omit<
  GeneratorConfigObject<
    CombinedSpec<TGenerators>,
    CombinedOptions<TGenerators>,
    CombinedReturns<TGenerators>
  >,
  "generator"
> & {
  generator: TGenerators;
};

// #endregion Combine Types
