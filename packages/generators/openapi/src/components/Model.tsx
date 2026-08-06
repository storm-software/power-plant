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

import type { ComponentProps } from "@power-plant/alloy-js/core/types";
import { ModelNameContext } from "../contexts/model";

export interface ModelProps extends ComponentProps {
  modelName: string;
}

/**
 * Provides the model name to the model context.
 */
export function ModelProvider({ modelName, children }: ModelProps) {
  return (
    <ModelNameContext.Provider value={modelName}>
      {children}
    </ModelNameContext.Provider>
  );
}
