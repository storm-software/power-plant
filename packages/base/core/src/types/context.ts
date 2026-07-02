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
import type { Execution } from "./execution";
import type { Input } from "./input";
import type { Output } from "./output";
import type { SchemaOf } from "./schema";
import type { Logger, Settings } from "./settings";

export interface Context {
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
}

export interface SessionContext extends Context {
  /**
   * A unique identifier for the session.
   */
  sessionId: string;

  /**
   * A unique identifier for the device the session started on.
   */
  deviceId: string;

  /**
   * The user ID of the user who started the session.
   */
  userId: string;

  /**
   * The tenant ID of the user who started the session.
   */
  tenantId: string;

  /**
   * The timestamp when the session was started.
   */
  startedAt: Date;

  /**
   * The executions of the session.
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
   * The schema for the execution.
   */
  schema: SchemaOf<TSpec, TOptions>;

  /**
   * The input for the execution.
   */
  input: Input<TSpec, TOptions>;

  /**
   * The output for the execution.
   */
  output: Output<TSpec, TOptions, TReturns>;
}
