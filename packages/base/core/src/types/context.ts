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

import type { Storage } from "unstorage";
import type { Execution, ExecutionDocument } from "./execution";
import type { Input } from "./input";
import type { Output } from "./output";
import type { SchemaOf } from "./schema";
import type { Session } from "./session";
import type { Logger, Settings } from "./settings";

export interface SessionContext {
  /**
   * The current working directory.
   */
  cwd: string;

  /**
   * The settings for the context.
   */
  settings: Settings;

  /**
   * The Unstorage storage for the context.
   *
   * @remarks
   * This storage can be used to store the input and output of the execution.
   */
  storage: Storage;

  /**
   * The logger for the context.
   */
  logger: Logger;

  /**
   * The session for the context.
   */
  session: Session;

  /**
   * The executions that have been performed in the context.
   */
  executions: Execution<any, any>[];
}

export interface ExecutionContext<
  TSpec,
  TOptions extends object,
  TReturns = void
>
  extends SessionContext, Execution<TSpec, TOptions> {
  /**
   * The options for the execution.
   */
  options: TOptions;

  /**
   * The specification for the execution.
   */
  get spec(): TSpec;

  /**
   * The schema for the execution.
   */
  get schema(): SchemaOf<TSpec, TOptions>;

  /**
   * The input for the execution.
   */
  get input(): Input<TSpec, TOptions>;

  /**
   * The output for the execution.
   */
  get output(): Output<TSpec, TOptions, TReturns>;

  /**
   * The documents that are currently being processed, indexed by the document path.
   */
  get documents(): Record<string, ExecutionDocument<TSpec, TOptions>>;

  /**
   * Adds a document to the currently processing documents.
   *
   * @param pathOrDocument - A string representing the path of the document to add, or the document to add.
   * @param document - The document to add (without the path), if {@link pathOrDocument} is a string representing the document path.
   */
  addDocument: (
    pathOrDocument: string | ExecutionDocument<TSpec, TOptions>,
    document?: Omit<ExecutionDocument<TSpec, TOptions>, "path">
  ) => void;
}
