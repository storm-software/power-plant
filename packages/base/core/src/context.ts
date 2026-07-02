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

import { snakeCase } from "@stryke/string-format/snake-case";
import { titleCase } from "@stryke/string-format/title-case";
import { AsyncLocalStorage } from "node:async_hooks";
import type {
  Context,
  ExecutionContext,
  SessionContext
} from "./types/context";

/**
 * The context store for a specific context.
 */
export interface ContextStore<TContext extends Context> {
  asyncLocalStorage: AsyncLocalStorage<TContext>;
  use: () => TContext;
  tryUse: () => TContext | undefined;
  call: <R>(instance: TContext, callback: () => R) => R;
  callAsync: <R>(
    instance: TContext,
    callback: () => R | Promise<R>
  ) => Promise<R>;
}

const globalStore = globalThis as unknown as Record<string, ContextStore<any>>;

const GLOBAL_CONTEXT_KEY = "$$__power_plant_{key}_context__";

function createContextStore<TContext extends Context>(
  key: string
): ContextStore<TContext> {
  const contextKey = GLOBAL_CONTEXT_KEY.replace(
    "{key}",
    snakeCase(
      key
        .trim()
        .replace(/^[_-]*/g, "")
        .replace(/[_-]*$/g, "")
    )
  );
  globalStore[contextKey] ??
    (globalStore[contextKey] = {
      asyncLocalStorage: new AsyncLocalStorage<TContext>(),
      use(): TContext {
        const instance = this.asyncLocalStorage.getStore();
        if (instance === undefined) {
          throw new Error(
            `The ${titleCase(
              key
                .trim()
                .replace(/^[_-]*/g, "")
                .replace(/[_-]*$/g, "")
            )} context is not available. Please ensure that the context has been initialized before using it.`
          );
        }

        return instance;
      },
      tryUse(): TContext | undefined {
        return this.asyncLocalStorage.getStore();
      },
      call<R>(instance: TContext, callback: () => R): R {
        return this.asyncLocalStorage.run(instance, callback);
      },
      async callAsync<R>(
        instance: TContext,
        callback: () => R | Promise<R>
      ): Promise<R> {
        return this.asyncLocalStorage.run(instance, callback);
      }
    });

  return globalStore[contextKey] as ContextStore<TContext>;
}

/**
 * The context store for the session context.
 */
export const sessionContext = createContextStore<SessionContext>("session");

/**
 * The async local storage for the session context.
 */
export const sessionAsyncLocalStorage = sessionContext.asyncLocalStorage;

/**
 * The function to use the session context.
 *
 * @returns The session context.
 * @throws An error if the session context is not available.
 */
export const useSessionContext = sessionContext.use;

/**
 * The function to try to use the session context.
 *
 * @returns The session context or undefined if the session context is not available.
 */
export const tryUseSessionContext = sessionContext.tryUse;

/**
 * The function to call the session context.
 *
 * @param instance - The instance of the session context.
 * @param callback - The callback to call.
 * @returns The result of the callback.
 */
export const callSessionContext = sessionContext.call;

/**
 * The function to call the session context asynchronously.
 *
 * @param instance - The instance of the session context.
 * @param callback - The callback to call.
 * @returns The result of the callback.
 */
export const callAsyncSessionContext = sessionContext.callAsync;

/**
 * The context store for the execution context. This is used to store the execution context for a specific execution.
 */
export const executionContext =
  createContextStore<ExecutionContext<any, any, any>>("execution");

/**
 * The async local storage for the execution context. This is used to store the execution context for a specific execution.
 */
export const executionAsyncLocalStorage = executionContext.asyncLocalStorage;

/**
 * The function to use the execution context.
 *
 * @returns The execution context.
 * @throws An error if the execution context is not available.
 */
export const useExecutionContext = executionContext.use;

/**
 * The function to try to use the execution context.
 *
 * @returns The execution context or undefined if the execution context is not available.
 */
export const tryUseExecutionContext = executionContext.tryUse;

/**
 * The function to call the execution context.
 *
 * @param instance - The instance of the execution context.
 * @param callback - The callback to call.
 * @returns The result of the callback.
 */
export const callExecutionContext = executionContext.call;

/**
 * The function to call the execution context asynchronously.
 *
 * @param instance - The instance of the execution context.
 * @param callback - The callback to call.
 * @returns The result of the callback.
 */
export const callAsyncExecutionContext = executionContext.callAsync;

/**
 * Returns the current context. If no execution context is available, it will return the session context.
 *
 * @returns The current execution context or the session context if no execution context is available.
 * @throws An error if both execution and session context are not available.
 */
export const useContext = <TContext extends SessionContext>(): TContext => {
  const context = tryUseExecutionContext();
  if (context === undefined) {
    const sessionContext = useSessionContext();
    if (sessionContext === undefined) {
      throw new Error(
        `Both execution and session context are not available. Please ensure that the context has been initialized before using it.`
      );
    }

    return sessionContext as unknown as TContext;
  }

  return context as unknown as TContext;
};
