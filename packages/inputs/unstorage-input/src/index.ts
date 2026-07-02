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
import { mapStorageToFileSystem } from "@power-plant/schema/storage";
import { load } from "@stryke/resolve/load";
import { isFileReference } from "@stryke/resolve/type-checks";
import type { LoadReference } from "@stryke/resolve/types";
import { isString } from "@stryke/type-checks/is-string";
import { isURL } from "@stryke/type-checks/is-url";
import type { Storage } from "unstorage";
import { createStorage } from "unstorage";
import fsLite from "unstorage/drivers/fs-lite";
import packageJson from "../package.json" with { type: "json" };

export interface Options {
  inputStorage?: Storage;
  inputPath: LoadReference;
}

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
  input: async (options: Options) => {
    const { inputPath, ...rest } = options;
    const { storage } = useContext();

    const inputStorage = (
      options as {
        inputStorage?: Storage;
      }
    ).inputStorage
      ? (
          options as {
            inputStorage: Storage;
          }
        ).inputStorage
      : (
            options as {
              inputPath?: string;
            }
          ).inputPath
        ? createStorage({
            driver: fsLite({
              base: (
                options as {
                  inputPath: string;
                }
              ).inputPath
            })
          })
        : storage;

    return load(inputPath, {
      ...rest,
      fs: mapStorageToFileSystem(inputStorage)
    });
  }
});
