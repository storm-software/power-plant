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

import type { LoadReference } from "@stryke/resolve/types";
import type { Config, ParseOptions } from "@terrazzo/parser";

export interface Options extends Omit<
  ParseOptions,
  "config" | "logger" | "req"
> {
  /**
   * Pointer to the DTCG tokens source. Supports local files, URLs, and loadable module references.
   */
  inputPath: LoadReference | LoadReference[];

  /**
   * Terrazzo config passed to `defineConfig` before parsing.
   *
   * @see https://terrazzo.app/docs/reference/config/
   */
  config?: Config;
}
