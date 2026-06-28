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

import defu from "defu";
import { AsyncLocalStorage } from "node:async_hooks";
import { debug, error, info, warn } from "node:console";
import * as fs from "node:fs";
import type { UserConfig } from "../types/config";
import type { Context } from "../types/context";

export function createContext(userConfig: UserConfig = {}): Context {
  return {
    fs: defu(userConfig.fs, fs),
    logger: defu(userConfig.logger, {
      debug,
      info,
      warn,
      error
    })
  };
}

export interface ContextStore {
  asyncLocalStorage: AsyncLocalStorage<Context>;
  use: () => Context;
  tryUse: () => Context | undefined;
  call: <R>(instance: Context, callback: () => R) => R;
  callAsync: <R>(
    instance: Context,
    callback: () => R | Promise<R>
  ) => Promise<R>;
}

const globalStore = globalThis as unknown as Record<string, ContextStore>;
const GLOBAL_STORE_KEY = "$$__power_plant_context__";

export const context: ContextStore =
  globalStore[GLOBAL_STORE_KEY] ??
  (globalStore[GLOBAL_STORE_KEY] = {
    asyncLocalStorage: new AsyncLocalStorage<Context>(),
    use(): Context {
      const instance = this.asyncLocalStorage.getStore();
      if (instance === undefined) {
        throw new Error("Context is not available");
      }
      return instance;
    },
    tryUse(): Context | undefined {
      return this.asyncLocalStorage.getStore();
    },
    call<R>(instance: Context, callback: () => R): R {
      return this.asyncLocalStorage.run(instance, callback);
    },
    async callAsync<R>(
      instance: Context,
      callback: () => R | Promise<R>
    ): Promise<R> {
      return this.asyncLocalStorage.run(instance, callback);
    }
  });

export const asyncLocalStorage = context.asyncLocalStorage;

export const useContext = context.use;
export const tryUseContext = context.tryUse;
export const callContext = context.call;
export const callAsyncContext = context.callAsync;
