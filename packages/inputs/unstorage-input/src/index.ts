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

import { defineInput } from "@power-plant/core";
import { isFileReference } from "@stryke/resolve/type-checks";
import { isString } from "@stryke/type-checks/is-string";
import { isURL } from "@stryke/type-checks/is-url";
import packageJson from "../package.json";
import { input } from "./input";
import type { Options } from "./types";

export default defineInput<any, Options>({
  meta: {
    name: "unstorage-input",
    description:
      "An input extension that reads the specification from an Unstorage driver.",
    readFrom: (spec: any, options: Options) =>
      `Reads the ${
        (spec as { name: string }).name
          ? `${(spec as { name: string }).name} `
          : ""
      }specification from the file "${
        isString(options.inputPath)
          ? options.inputPath
          : isURL(options.inputPath)
            ? options.inputPath.toString()
            : isFileReference(options.inputPath)
              ? options.inputPath.file
              : "Unknown Type"
      }"${
        options.inputStorage &&
        options.inputStorage.getMount(
          isString(options.inputPath)
            ? options.inputPath
            : isURL(options.inputPath)
              ? options.inputPath.toString()
              : isFileReference(options.inputPath)
                ? options.inputPath.file
                : undefined
        )?.driver.name
          ? ` using the "${
              options.inputStorage.getMount(
                isString(options.inputPath)
                  ? options.inputPath
                  : isURL(options.inputPath)
                    ? options.inputPath.toString()
                    : isFileReference(options.inputPath)
                      ? options.inputPath.file
                      : undefined
              )?.driver.name
            }" Unstorage driver`
          : ""
      }.`,
    version: packageJson.version,
    tags: ["unstorage", "input"],
    links: [
      {
        href: "https://unstorage.unjs.io",
        description: "Unstorage documentation"
      },
      {
        href: "https://unstorage.unjs.io/drivers",
        description: "Unstorage Drivers documentation"
      },
      {
        href: "https://github.com/unjs/unstorage",
        description: "Unstorage GitHub repository"
      }
    ]
  },
  input
});
