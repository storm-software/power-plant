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
import { appendPath } from "@stryke/path/append";
import { isSetString } from "@stryke/type-checks/is-set-string";
import packageJson from "../package.json" with { type: "json" };

export interface Options {
  outputPath?: string;
}

export default defineOutput<any, Options>({
  meta: {
    name: "local",
    title: "Local File System Output",
    description:
      "An output that writes generated documents to the local file system.",
    version: packageJson.version,
    tags: ["local", "file-system", "output"]
  },
  output: async (spec, options, documents) => {
    const { fs, cwd } = useContext();

    const outputPath =
      (options.outputPath ? appendPath(options.outputPath, cwd) : cwd) ||
      process.cwd();

    await Promise.all(
      documents.map(async document => {
        const filePath = `${outputPath}/${document.path}`;

        return Promise.all(
          document.source
            ?.filter(source => isSetString(source?.content))
            ?.map(async source =>
              fs.promises.writeFile(filePath, String(source.content), {
                encoding: "utf8"
              })
            ) ?? []
        );
      })
    );
  }
});
