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

import type { InferLoadOptions, LoadReference } from "@stryke/resolve/types";
import type { UserConfig } from "./config";
import type { GeneratedDocument, GeneratorConfig } from "./generator";
import type { MetaConfig } from "./meta";
import type { SchemaMetaConfig } from "./schema";

export interface ExecutionMeta<TSpec> extends MetaConfig {
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
   * The metadata of the schema used to generate the source code during the execution.
   */
  schema: SchemaMetaConfig<TSpec>;

  /**
   * The metadata of the input used to generate the source code during the execution.
   */
  input: MetaConfig;

  /**
   * The metadata of the output used to generate the source code during the execution.
   */
  output: MetaConfig;

  /**
   * The metadata of the generator used to execute the source code during the execution.
   */
  generator: MetaConfig;
}

export interface Execution<TSpec> {
  /**
   * The documents of the execution, indexed by the document path.
   */
  documents: Record<string, GeneratedDocument>;

  /**
   * The metadata of the execution.
   */
  meta: ExecutionMeta<TSpec>;
}

export type ExecutionResult<TReturns = void> = GeneratedDocument & {
  /**
   * The returned value of the generator function.
   */
  returns?: TReturns;
};

export type InferEngineOptions<
  TGeneratorConfig extends GeneratorConfig<any, any, any>
> = TGeneratorConfig extends LoadReference
  ? InferLoadOptions<TGeneratorConfig> & UserConfig
  : UserConfig;

export type ExecuteFunction = <TSpec, TOptions extends object, TReturns = void>(
  generatorConfig: GeneratorConfig<TSpec, TOptions, TReturns>,
  options?: InferEngineOptions<typeof generatorConfig> & TOptions
) => Promise<TReturns>;
