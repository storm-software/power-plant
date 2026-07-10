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
import type { SessionContext as SessionContextCore } from "@power-plant/core";

/**
 * The session context used to access the session data.
 */
export const SessionContext: ComponentContext<SessionContextCore> =
  createNamedContext<SessionContextCore>("Session");

/**
 * Hook to access the session context.
 *
 * @returns The session context.
 * @throws An error if the session context is not set.
 */
export function useSession(): SessionContextCore {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error(
      "Session is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  return session;
}

/**
 * Hook to safely access the session context.
 *
 * @returns The session context or undefined if not set.
 */
export function useSessionSafe(): SessionContextCore | undefined {
  return useContext(SessionContext);
}
