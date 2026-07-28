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
import type { ExecutionContext, SessionContext } from "./types/context";

/**
 * The context store for a specific context.
 */
export interface ContextStore<TContext extends SessionContext> {
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

function createContextStore<TContext extends SessionContext>(
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

  const asyncLocalStorage = new AsyncLocalStorage<TContext>();

  globalStore[contextKey] ??
    (globalStore[contextKey] = {
      asyncLocalStorage,
      use(): TContext {
        const instance = asyncLocalStorage.getStore();
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
        return asyncLocalStorage.getStore();
      },
      call<R>(instance: TContext, callback: () => R): R {
        return asyncLocalStorage.run(instance, callback);
      },
      async callAsync<R>(
        instance: TContext,
        callback: () => R | Promise<R>
      ): Promise<R> {
        return asyncLocalStorage.run(instance, callback);
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
 * Alias for {@link useSessionContext}.
 */
export const useSession = useSessionContext;

/**
 * The function to try to use the session context.
 *
 * @returns The session context or undefined if the session context is not available.
 */
export const tryUseSessionContext = sessionContext.tryUse;

/**
 * Alias for {@link tryUseSessionContext}.
 */
export const tryUseSession = tryUseSessionContext;

/**
 * The function to call the session context.
 *
 * @param instance - The instance of the session context.
 * @param callback - The callback to call.
 * @returns The result of the callback.
 */
export const callSessionContext = sessionContext.call;

/**
 * Alias for {@link callSessionContext}.
 */
export const callSession = callSessionContext;

/**
 * The function to call the session context asynchronously.
 *
 * @param instance - The instance of the session context.
 * @param callback - The callback to call.
 * @returns The result of the callback.
 */
export const callAsyncSessionContext = sessionContext.callAsync;

/**
 * Alias for {@link callAsyncSessionContext}.
 */
export const callAsyncSession = callAsyncSessionContext;

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
 * A hook to allow access to the execution context.
 *
 * @template TSpec - The type of the specification that the generator will produce.
 * @template TOptions - The type of the options that will be passed to the generator during generation.
 * @template TReturns - The type of the returns that the generator will produce.
 * @returns The execution context.
 * @throws An error if the execution context is not available.
 */
export function useExecutionContext<
  TSpec,
  TOptions extends object,
  TReturns = void
>() {
  return executionContext.use() as ExecutionContext<TSpec, TOptions, TReturns>;
}

/**
 * A hook to allow access to the execution context.
 *
 * @remarks
 * Alias for {@link useExecutionContext}.
 *
 * @template TSpec - The type of the specification that the generator will produce.
 * @template TOptions - The type of the options that will be passed to the generator during generation.
 * @template TReturns - The type of the returns that the generator will produce.
 * @returns The execution context.
 * @throws An error if the execution context is not available.
 */
export function useExecution<
  TSpec,
  TOptions extends object,
  TReturns = void
>() {
  return useExecutionContext<TSpec, TOptions, TReturns>();
}

/**
 * A hook to allow access to the execution context.
 *
 * @remarks
 * Alias for {@link useExecutionContext}.
 *
 * @template TSpec - The type of the specification that the generator will produce.
 * @template TOptions - The type of the options that will be passed to the generator during generation.
 * @template TReturns - The type of the returns that the generator will produce.
 * @returns The execution context.
 * @throws An error if the execution context is not available.
 */
export function useContext<TSpec, TOptions extends object, TReturns = void>() {
  return useExecutionContext<TSpec, TOptions, TReturns>();
}

/**
 * The function to try to use the execution context.
 *
 * @returns The execution context or undefined if the execution context is not available.
 */
export const tryUseExecutionContext = executionContext.tryUse;

/**
 * Alias for {@link tryUseExecutionContext}.
 */
export const tryUseExecution = tryUseExecutionContext;

/**
 * The function to call the execution context.
 *
 * @param instance - The instance of the execution context.
 * @param callback - The callback to call.
 * @returns The result of the callback.
 */
export const callExecutionContext = executionContext.call;

/**
 * Alias for {@link callExecutionContext}.
 */
export const callExecution = callExecutionContext;

/**
 * The function to call the execution context asynchronously.
 *
 * @param instance - The instance of the execution context.
 * @param callback - The callback to call.
 * @returns The result of the callback.
 */
export const callAsyncExecutionContext = executionContext.callAsync;

/**
 * Alias for {@link callAsyncExecutionContext}.
 */
export const callAsyncExecution = callAsyncExecutionContext;
