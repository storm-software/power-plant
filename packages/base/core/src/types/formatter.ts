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

import type { BaseExtractOptions } from "@power-plant/schema";
import type { InferLoadOptions, LoadReference } from "@stryke/resolve/types";
import type { MaybePromise } from "@stryke/types/base";
import type { GeneratedDocument } from "./generator";
import type { MetaConfig } from "./meta";

export type FormatterFunction<TSpec, TOptions extends object> = (
  spec: TSpec,
  options: TOptions,
  documents: Record<string, GeneratedDocument>
) => MaybePromise<Record<string, GeneratedDocument>>;

export interface FormatterConfigObject<TSpec, TOptions extends object> {
  /**
   * Optional metadata that provides contextual information for the formatter.
   */
  meta?: MetaConfig;

  /**
   * The formatter implementation, either as a callable function or a file reference.
   */
  format: FormatterFunction<TSpec, TOptions> | LoadReference;
}

export type FormatterConfig<TSpec, TOptions extends object> =
  | LoadReference
  | FormatterFunction<TSpec, TOptions>
  | FormatterConfigObject<TSpec, TOptions>;

export type InferCreateFormatterOptions<T extends FormatterConfig<any, any>> =
  (T extends LoadReference
    ? InferLoadOptions<T>
    : // eslint-disable-next-line ts/no-empty-object-type
      {}) &
    BaseExtractOptions;

export interface Formatter<TSpec, TOptions extends object> {
  /**
   * Optional metadata that provides contextual information for the formatter.
   */
  meta?: MetaConfig;

  /**
   * The formatter function, which receives the documents produced by the generator and returns the formatted documents that will be passed to the output.
   *
   * @param spec - The specification object used to generate the documents.
   * @param options - The options used to generate the documents.
   * @param documents - The generated documents to format.
   * @returns The formatted documents.
   */
  format: FormatterFunction<TSpec, TOptions>;
}
