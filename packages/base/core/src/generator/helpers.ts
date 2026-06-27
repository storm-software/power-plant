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

import { isSetObject } from "@stryke/type-checks/is-set-object";
import type { GeneratorInputObject } from "../types";

export function isGeneratorInputObject<
  TSpec,
  TOptions extends object,
  TReturns = void
>(input: unknown): input is GeneratorInputObject<TSpec, TOptions, TReturns> {
  return (
    isSetObject(input) &&
    "schema" in input &&
    "source" in input &&
    "sink" in input
  );
}
