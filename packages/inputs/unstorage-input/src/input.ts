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

import { useExecution } from "@power-plant/core";
import { mapStorageToFileSystem } from "@power-plant/schema/storage";
import { findFileExtensionSafe } from "@stryke/path/find";
import { load } from "@stryke/resolve/load";
import { isString } from "@stryke/type-checks/is-string";
import { isURL } from "@stryke/type-checks/is-url";
import type { Storage, StorageValue } from "unstorage";
import { createStorage } from "unstorage";
import fsLite from "unstorage/drivers/fs-lite";
import type { Options } from "./types";

/**
 * Reads the specification from an Unstorage driver.
 *
 * @see https://unstorage.unjs.io/drivers
 * @see https://github.com/unjs/unstorage
 *
 * @param options - The options for the input.
 * @returns The specification.
 */
export async function input<TSpec>(options: Options): Promise<TSpec> {
  const { inputPath, allowedExtensions, ...rest } = options;

  const normalizedAllowedExtensions = allowedExtensions?.map(
    extension => extension.toLowerCase().replace(/^\./, "") // remove leading dot
  );
  if (
    normalizedAllowedExtensions &&
    normalizedAllowedExtensions.length > 0 &&
    isString(inputPath) &&
    findFileExtensionSafe(inputPath) &&
    !normalizedAllowedExtensions.includes(findFileExtensionSafe(inputPath))
  ) {
    throw new Error(
      `Invalid extension provided in input path: ${findFileExtensionSafe(inputPath)}`
    );
  } else if (
    normalizedAllowedExtensions &&
    normalizedAllowedExtensions.length > 0 &&
    isURL(inputPath) &&
    findFileExtensionSafe(inputPath.toString()) &&
    !normalizedAllowedExtensions.includes(
      findFileExtensionSafe(inputPath.toString())
    )
  ) {
    throw new Error(
      `Invalid extension provided in input path: ${findFileExtensionSafe(inputPath.toString())}`
    );
  }

  const { storage } = useExecution();

  const inputStorage = (
    options as {
      inputStorage?: Storage<StorageValue>;
    }
  ).inputStorage
    ? (
        options as {
          inputStorage: Storage<StorageValue>;
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
