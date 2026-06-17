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

import type { FrameworkOptions } from "powerlines";
import packageJson from "../../package.json" with { type: "json" };

/**
 * Retrieves the framework information for Power Plant.
 *
 * @returns An object containing the name, version, and organization ID of the Power Plant framework.
 */
export function getFramework(): FrameworkOptions {
  return {
    name: "power-plant",
    version: packageJson.version,
    orgId: "storm-software"
  };
}
