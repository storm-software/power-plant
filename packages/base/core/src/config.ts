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

// import type {
//   UserConfig,
//   UserConfigExport,
//   UserConfigFn,
//   UserConfigFnObject,
//   UserConfigFnPromise
// } from "./types/config";

export type * from "./types/config";

/**
 * Type helper to make it easier to use `power-plant.config.ts` files. Accepts a direct {@link UserConfig} object, or a function that returns it. The function receives a {@link ConfigParams} object.
 *
 * @example
 * ```ts
 * import { defineConfig } from '@power-plant/core/config';
 *
 * export default defineConfig({
 *   // Your configuration here
 * });
 *
 * // Or with a function
 * export default defineConfig((env) => {
 *   console.log(`Running command: ${env.command} in mode: ${env.mode}`);
 *   return {
 *     // Your configuration here
 *   };
 * });
 * ```
 *
 * @param config - The user configuration object or a function that returns it.
 * @returns The provided configuration, unmodified.
 */
// export function defineConfig(config: UserConfig): UserConfig;
// export function defineConfig(config: UserConfig[]): UserConfig[];
// export function defineConfig(config: Promise<UserConfig>): Promise<UserConfig>;
// export function defineConfig(
//   config: Promise<UserConfig[]>
// ): Promise<UserConfig[]>;
// export function defineConfig(config: UserConfigFnObject): UserConfigFnObject;
// export function defineConfig(config: UserConfigFnPromise): UserConfigFnPromise;
// export function defineConfig(config: UserConfigFn): UserConfigFn;
// export function defineConfig(config: UserConfigExport): UserConfigExport;
// export function defineConfig(config: UserConfigExport): UserConfigExport {
//   return config;
// }
