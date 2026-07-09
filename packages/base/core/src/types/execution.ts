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
import type { InferExtractedMeta, Meta } from "./meta";
import type { OutputMeta } from "./output";
import type { SchemaMeta } from "./schema";

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
  meta: Meta<TSpec, TOptions>;
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

  /**
   * The metadata of the document.
   */
  meta: Meta<TSpec, TOptions>;
}

export interface ExecutionMeta<TSpec, TOptions extends object> extends Meta<
  TSpec,
  TOptions
> {
  /**
   * A unique identifier for the execution, typically used by the backend systems.
   *
   * @remarks
   * This value will be in the UUID format, which is a 128-bit number represented as a string of hexadecimal digits. It is used to uniquely identify the execution in the backend systems and can be used for tracking and auditing purposes.
   */
  executionId: string;

  /**
   * The date and time when the execution was performed.
   */
  executedAt: Date;

  /**
   * The user who performed the execution.
   */
  executedBy: string;

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

export type ExtractedExecutionSource<TSpec, TOptions extends object> = Omit<
  ExecutionSource<TSpec, TOptions>,
  "meta"
> & {
  /**
   * The extracted metadata of the execution.
   */
  meta: InferExtractedMeta<ExecutionSource<TSpec, TOptions>["meta"]>;
};

export type ExtractedExecutionDocument<TSpec, TOptions extends object> = Omit<
  ExecutionDocument<TSpec, TOptions>,
  "source" | "meta"
> & {
  /**
   * The source of the document.
   */
  source: ExtractedExecutionSource<TSpec, TOptions>[];

  /**
   * The extracted metadata of the execution.
   */
  meta: InferExtractedMeta<ExecutionDocument<TSpec, TOptions>["meta"]>;
};

// export type ExtractedExecutionMeta<
//   TSpec,
//   TOptions extends object
// > = Omit<ExecutionMeta<TSpec, TOptions>> InferExtractedMeta<ExecutionMeta<TSpec, TOptions>>;

// extends Meta<
//   TSpec,
//   TOptions
// > {
//   /**
//    * A unique identifier for the execution, typically used by the backend systems.
//    *
//    * @remarks
//    * This value will be in the UUID format, which is a 128-bit number represented as a string of hexadecimal digits. It is used to uniquely identify the execution in the backend systems and can be used for tracking and auditing purposes.
//    */
//   executionId: string;

//   /**
//    * The date and time when the execution was performed.
//    */
//   executedAt: Date;

//   /**
//    * The user who performed the execution.
//    */
//   executedBy: string;

//   /**
//    * The specification used to generate the source code during the execution.
//    */
//   spec: TSpec;

//   /**
//    * The metadata of the generator used to execute the source code during the execution.
//    */
//   generator: GeneratorMeta<TSpec, TOptions>;

//   /**
//    * The metadata of the schema used to generate the source code during the execution.
//    */
//   schema: SchemaMeta<TSpec, TOptions>;

//   /**
//    * The metadata of the input used to generate the source code during the execution.
//    */
//   input: InputMeta<TSpec, TOptions>;

//   /**
//    * The metadata of the output used to generate the source code during the execution.
//    */
//   output: OutputMeta<TSpec, TOptions>;

//   /**
//    * Additional data associated with the execution.
//    */
//   data?: MetaValue<TSpec, TOptions, MetaData<TSpec, TOptions>>;
// }

export type ExtractedExecution<TSpec, TOptions extends object> = Omit<
  Execution<TSpec, TOptions>,
  "documents" | "meta"
> & {
  /**
   * The documents of the execution, indexed by the document path.
   */
  documents: Record<string, ExtractedExecutionDocument<TSpec, TOptions>>;

  /**
   * The extracted metadata of the execution.
   */
  meta: InferExtractedMeta<ExecutionMeta<TSpec, TOptions>>;
};
