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

import { defineOutput, useContext } from "@power-plant/core";
import { appendPath, isValidFileSystemPath } from "@stryke/path";
import { isSetString } from "@stryke/type-checks/is-set-string";
import type { Storage } from "unstorage";
import { createStorage } from "unstorage";
import fsLite from "unstorage/drivers/fs-lite";
import packageJson from "../package.json" with { type: "json" };

export type Options =
  | {
      outputStorage?: Storage;
    }
  | {
      outputPath?: string;
    };

export default defineOutput<any, Options>({
  meta: {
    name: "unstorage-output",
    description:
      "An output that writes generated documents to an Unstorage driver.",
    version: packageJson.version,
    tags: ["unstorage", "output"],
    links: [
      {
        href: "https://unstorage.dev",
        description: "Unstorage Documentation"
      },
      {
        href: "https://github.com/unjs/unstorage",
        description: "Unstorage GitHub Repository"
      }
    ]
  },
  output: async (spec, options, documents) => {
    const { cwd } = useContext();

    const outputStorage =
      (
        options as {
          outputStorage?: Storage;
        }
      ).outputStorage ??
      createStorage({
        driver: fsLite({
          base:
            (
              options as {
                outputPath?: string;
              }
            ).outputPath || cwd
        })
      });

    await Promise.all(
      documents.map(async document => {
        return Promise.all(
          document.source
            ?.filter(source => isSetString(source?.content))
            ?.map(async source =>
              outputStorage.setItem(
                isValidFileSystemPath(document.path)
                  ? appendPath(
                      document.path,
                      (
                        options as {
                          outputPath?: string;
                        }
                      ).outputPath || cwd
                    )
                  : document.path,
                String(source.content)
              )
            ) ?? []
        );
      })
    );
  }
});
