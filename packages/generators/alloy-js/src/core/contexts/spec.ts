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

/**
 * The Specification context used in template rendering.
 */
export const SpecContext: ComponentContext<any> =
  createNamedContext<any>("SpecContext");

/**
 * Hook to access the {@link SpecContext | Specification context}.
 *
 * @returns The Specification context.
 * @throws An error if the Specification context is not set.
 */
export function useSpec(): any {
  const context = useContext(SpecContext);
  if (!context) {
    throw new Error(
      "Specification context is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  return context;
}

/**
 * Hook to safely access the {@link SpecContext | Specification context}.
 *
 * @returns The Specification context or undefined if not set.
 */
export function useSpecSafe(): any | undefined {
  return useContext(SpecContext);
}
