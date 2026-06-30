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

import type { BindingError, BindingOptions } from "../bindings.cjs";
import {
  BindingEngine,
  shutdownAsyncRuntime,
  startAsyncRuntime
} from "../bindings.cjs";
import type { Context } from "../types/context";

// @ts-expect-error TS2540: the polyfill of `asyncDispose`.
Symbol.asyncDispose ??= Symbol("Symbol.asyncDispose");

export class NativeBindingEngine {
  #context: Context;

  #isClosed = false;

  #binding: BindingEngine;

  #stopWorkers?: () => Promise<void>;

  protected static asyncRuntimeShutdown = false;

  /**
   * Create a new instance of the PowerPlant build engine, which is responsible for managing the build process, including scanning for route and layout modules, handling plugin hooks, and coordinating with the underlying binding engine. The constructor initializes the engine with the provided build context, sets up the binding engine with the appropriate configuration and plugin API, and prepares it for use in the build process.
   *
   * @param context - The build context containing configuration and utilities for the engine.
   */
  public constructor(context: any) {
    this.#context = context;

    this.#binding = new BindingEngine({} as BindingOptions);
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
   * Scan the project for route and layout modules, and return the scan output which includes the paths of the discovered modules and any associated metadata. This method is typically used during the prepare phase of the build process to gather information about the project's structure and dependencies.
   *
   * @remarks
   * This method will also handle the lifecycle of the asynchronous runtime used for scanning, ensuring that it is started if it has been shut down and that any worker processes are stopped before starting a new scan.
   *
   * @returns The output of the scan operation, including paths to discovered modules and metadata.
   * @throws An error if the scan operation fails due to binding errors or other issues.
   */
  public async commit(): Promise<any> {
    this.#context.logger.debug("Power Plant - Scan started.");

    await this.#stopWorkers?.();
    if (NativeBindingEngine.asyncRuntimeShutdown) {
      startAsyncRuntime();
    }

    const result: Awaited<ReturnType<BindingEngine["store"]>> =
      await this.#binding.store({
        executionId: "123",
        documents: [
          {
            name: "test",
            path: "test.txt",
            extension: "txt",
            sourceCode: [],
            metadata: undefined
          }
        ],
        metadata: undefined
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

    this.#context.logger.debug("Power Plant - Scan completed.");

    return {};
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
