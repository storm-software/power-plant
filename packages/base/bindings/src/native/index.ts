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

import type { Execution, Session, UserConfig } from "@power-plant/core";
import type { BindingError, BindingExecutionDocument } from "../bindings.cjs";
import {
  BindingEngine,
  shutdownAsyncRuntime,
  startAsyncRuntime
} from "../bindings.cjs";

// @ts-expect-error TS2540: the polyfill of `asyncDispose`.
Symbol.asyncDispose ??= Symbol("Symbol.asyncDispose");

export class NativeBindingEngine {
  #config: UserConfig;

  #isClosed = false;

  #binding: BindingEngine;

  #stopWorkers?: () => Promise<void>;

  protected static asyncRuntimeShutdown = false;

  /**
   * Create a new instance of the Power Plant native storage engine, which is responsible for managing the generation process, including storing the execution metadata and coordinating with the underlying storage engine. The constructor initializes the engine with the provided context, sets up the storage engine with the appropriate configuration and plugin API, and prepares it for use in the generation process.
   *
   * @param context - The context containing configuration and utilities for the engine.
   */
  public constructor(config: UserConfig) {
    this.#config = config;

    this.#binding = new BindingEngine({
      logLevel: config.settings?.logLevel,
      cwd: config.cwd
    });
  }

  /**
   * Indicates whether the engine has been closed and its resources have been released. Once the engine is closed, it should not be used for further operations, and any attempts to do so may result in errors. This property can be used to check the state of the engine before performing actions that require it to be open.
   *
   * @returns `true` if the engine is closed; otherwise, `false`.
   */
  public get isClosed(): boolean {
    return this.#isClosed;
  }

  /**
   * Retrieve the current session information from the engine, which includes details about the execution environment, configuration, and any relevant metadata. This method interacts with the underlying binding engine to obtain the session data and returns it in a structured format. It is useful for understanding the context in which the engine is operating and for debugging purposes.
   *
   * @returns A promise that resolves to the current session information.
   * @throws An error if the get session operation fails due to binding errors or other issues.
   */
  public async getSession(): Promise<Session> {
    await this.#stopWorkers?.();
    if (NativeBindingEngine.asyncRuntimeShutdown) {
      startAsyncRuntime();
    }

    const result: Awaited<ReturnType<BindingEngine["getSession"]>> =
      await this.#binding.getSession();
    if ("isBindingErrors" in result && result.isBindingErrors) {
      throw new Error(
        `Power Plant - Get Session failed with errors: ${result.errors
          .map(e => e.field0.message)
          .join("\n")}`
      );
    }

    return {
      ...result.session,
      startedAt: new Date(result.session.startedAt)
    };
  }

  /**
   * Collect the project's source code and metadata, and store it in the backend storage for later use.
   *
   * @remarks
   * In this context, backend storage does not necessarily mean a database or external service. It can be a file system, a cloud storage, or any other storage that is accessible to the backend.
   *
   * @param execution - The execution to store.
   * @returns The output of the store operation, including the success status and any warnings.
   * @throws An error if the store operation fails due to binding errors or other issues.
   */
  public async store<TSpec, TOptions extends object>(
    execution: Execution<TSpec, TOptions>
  ): Promise<void> {
    await this.#stopWorkers?.();
    if (NativeBindingEngine.asyncRuntimeShutdown) {
      startAsyncRuntime();
    }

    const result: Awaited<ReturnType<BindingEngine["store"]>> =
      await this.#binding.store({
        execution: {
          documents: Object.entries(execution.documents).map(
            ([path, document]) =>
              ({
                ...document,
                path
              }) as BindingExecutionDocument
          ),
          meta: {
            id: execution.meta.id,
            executedAt: execution.meta.executedAt.toISOString(),
            executedBy: execution.meta.executedBy
          }
        }
      });
    if (
      (result as { errors: BindingError[]; isBindingErrors: boolean })
        ?.isBindingErrors
    ) {
      throw new Error(
        `Power Plant - Scan failed with errors: ${(
          result as { errors: BindingError[] }
        ).errors
          .map(e => e.field0.message)
          .join("\n")}`
      );
    }
  }

  /**
   * Recall a previously stored execution from backend storage.
   *
   * @param executionId - The id of the execution to recall.
   * @returns The recalled execution.
   * @throws An error if the recall operation fails due to binding errors or other issues.
   */
  public async recall<TSpec, TOptions extends object>(
    executionId: string
  ): Promise<Execution<TSpec, TOptions>> {
    await this.#stopWorkers?.();
    if (NativeBindingEngine.asyncRuntimeShutdown) {
      startAsyncRuntime();
    }

    const result: Awaited<ReturnType<BindingEngine["recall"]>> =
      await this.#binding.recall({ executionId });
    if ("isBindingErrors" in result && result.isBindingErrors) {
      throw new Error(
        `Power Plant - Recall failed with errors: ${result.errors
          .map(e => e.field0.message)
          .join("\n")}`
      );
    }

    return {
      documents: result.execution.documents.reduce((ret, document) => {
        ret[document.path] = document;
        return ret;
      }, {}),
      meta: {
        id: result.execution.meta.id,
        executedAt: new Date(result.execution.meta.executedAt),
        executedBy: result.execution.meta.executedBy
      }
    };
  }

  /**
   * Close the build and free resources.
   */
  public async close(): Promise<void> {
    await this.#stopWorkers?.();
    await this.#binding.close();

    shutdownAsyncRuntime();

    NativeBindingEngine.asyncRuntimeShutdown = true;
    this.#stopWorkers = undefined;
  }

  /**
   * Asynchronously dispose of the engine instance, ensuring that all resources are properly released. This method is intended to be used with the `using` statement for automatic resource management. When called, it will invoke the `close` method to perform the necessary cleanup operations.
   *
   * @returns A promise that resolves when the disposal process is complete.
   */
  public async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }
}
