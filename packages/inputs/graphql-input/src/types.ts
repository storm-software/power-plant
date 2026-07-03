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

import type { CodeFileLoaderConfig } from "@graphql-tools/code-file-loader";
import type { LoadSchemaOptions } from "@graphql-tools/load";
import type { LoadReference } from "@stryke/resolve/types";

export interface Options
  extends Omit<LoadSchemaOptions, "loaders" | "cwd">, CodeFileLoaderConfig {
  /**
   * Pointer to the GraphQL schema source. Supports local files, globs, URLs,
   * introspection JSON, and remote schema endpoints.
   */
  inputPath: LoadReference;
}
