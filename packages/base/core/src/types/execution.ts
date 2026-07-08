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

import type { GeneratedDocument, GeneratorMeta } from "./generator";
import type { InputMeta } from "./input";
import type { MetaData, MetaValue } from "./meta";
import type { OutputMeta } from "./output";
import type { SchemaMeta } from "./schema";

export interface ExecutionSourceMeta<TSpec, TOptions extends object> {
  /**
   * The options used to generate the source code during the execution.
   */
  options: TOptions;

  /**
   * The specification used to generate the source code during the execution.
   */
  spec: TSpec;

  /**
   * The metadata of the generator used to execute the source code during the execution.
   */
  generator: GeneratorMeta<TSpec, TOptions>;

  /**
   * The metadata of the schema used to generate the source code during the execution.
   */
  schema: SchemaMeta<TSpec, TOptions>;

  /**
   * The metadata of the input used to generate the source code during the execution.
   */
  input: InputMeta<TSpec, TOptions>;

  /**
   * The metadata of the output used to generate the source code during the execution.
   */
  output: OutputMeta<TSpec, TOptions>;

  /**
   * Additional data associated with the execution source.
   */
  data?: MetaValue<TSpec, TOptions, MetaData<TSpec, TOptions>>;
}

export interface ExecutionSource<TSpec, TOptions extends object> {
  /**
   * The language of the document.
   */
  language?: string;

  /**
   * The content of the source code.
   */
  content: string;

  /**
   * The metadata of the source code.
   */
  meta: ExecutionSourceMeta<TSpec, TOptions>;
}

export interface ExecutionDocument<TSpec, TOptions extends object> {
  /**
   * The path of the document.
   */
  path: string;

  /**
   * The source of the document.
   */
  source: ExecutionSource<TSpec, TOptions>[];
}

export interface ExecutionMeta<TSpec, TOptions extends object> {
  /**
   * A unique identifier for the execution, typically used by the backend systems.
   *
   * @remarks
   * This value will be in the UUID format, which is a 128-bit number represented as a string of hexadecimal digits. It is used to uniquely identify the execution in the backend systems and can be used for tracking and auditing purposes.
   */
  id: string;

  /**
   * The date and time when the execution was performed.
   */
  executedAt: Date;

  /**
   * The user who performed the execution.
   */
  executedBy: string;

  /**
   * Additional data associated with the execution.
   */
  data?: MetaValue<TSpec, TOptions, MetaData<TSpec, TOptions>>;
}

export interface Execution<TSpec, TOptions extends object> {
  /**
   * The documents of the execution, indexed by the document path.
   */
  documents: Record<string, ExecutionDocument<TSpec, TOptions>>;

  /**
   * The metadata of the execution.
   */
  meta: ExecutionMeta<TSpec, TOptions>;
}

export type ExecutionResult<
  TSpec,
  TOptions extends object,
  TReturns = void
> = GeneratedDocument<TSpec, TOptions> & {
  /**
   * The returned value of the generator function.
   */
  returns?: TReturns;
};
