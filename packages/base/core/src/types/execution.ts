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

import type { GeneratorMeta } from "./generator";
import type { InputMeta } from "./input";
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
   * The metadata of the generator used to generate the source code during the execution.
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
}

export interface ExecutionSource<TSpec, TOptions extends object> {
  language: string;
  content: string;
  meta: ExecutionSourceMeta<TSpec, TOptions>;
}

export interface ExecutionDocument<TSpec, TOptions extends object> {
  /**
   * The name of the document.
   */
  name: string;

  /**
   * The path of the document.
   */
  path: string;

  /**
   * The extension of the document.
   */
  extension: string;

  /**
   * The sources of the document.
   */
  source: ExecutionSource<TSpec, TOptions>[];
}

export interface ExecutionMeta {
  /**
   * The id of the execution.
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
}

export interface Execution<TSpec, TOptions extends object> {
  /**
   * The documents of the execution.
   */
  documents: ExecutionDocument<TSpec, TOptions>[];

  /**
   * The metadata of the execution.
   */
  meta: ExecutionMeta;
}
