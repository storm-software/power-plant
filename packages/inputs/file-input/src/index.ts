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

import { defineInput, useContext } from "@power-plant/core";
import { load } from "@stryke/resolve/load";
import type { LoadReference } from "@stryke/resolve/types";
import { isString } from "@stryke/type-checks/is-string";
import { isURL } from "@stryke/type-checks/is-url";
import packageJson from "../package.json" with { type: "json" };

export interface Options {
  path: LoadReference;
}

export default defineInput<any, Options>({
  meta: {
    name: "file",
    version: packageJson.version,
    description: (_: any, options: Options) =>
      `Reads the specification from the file "${
        isString(options.path)
          ? options.path
          : isURL(options.path)
            ? options.path.toString()
            : options.path.file
      }"`
  },
  input: async (options: Options) => {
    const { path, ...rest } = options;
    const { fs } = useContext();

    return load(path, { ...rest, fs });
  }
});
