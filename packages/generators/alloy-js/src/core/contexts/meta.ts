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

import type { ComponentContext } from "@alloy-js/core";
import { createNamedContext, useContext } from "@alloy-js/core";
import type { MetaConfig } from "@power-plant/core";

/**
 * The Meta context used in template rendering.
 */
export const MetaContext: ComponentContext<
  Record<string, MetaConfig<any, any>>
> = createNamedContext<Record<string, MetaConfig<any, any>>>("MetaContext");

/**
 * Hook to access the {@link MetaContext | Meta context}.
 *
 * @returns The Meta context.
 * @throws An error if the Meta context is not set.
 */
export function useMeta(): Record<string, MetaConfig<any, any>> {
  const context = useContext(MetaContext);
  if (!context) {
    throw new Error(
      "Meta context is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@powerlines/plugin-alloy`."
    );
  }

  return context;
}

/**
 * Hook to safely access the {@link MetaContext | Meta context}.
 *
 * @returns The Meta context or undefined if not set.
 */
export function useMetaSafe():
  Record<string, MetaConfig<any, any>> | undefined {
  return useContext(MetaContext);
}
