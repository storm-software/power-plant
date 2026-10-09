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

import type { GeneratedDocument } from "@power-plant/core";
import { defineFormatter, useContext } from "@power-plant/core";
import { appendPath, findFileExtension } from "@stryke/path";
import defu from "defu";
import type { Config } from "prettier";
import { format, resolveConfig } from "prettier";
import packageJson from "../package.json";

export interface Options {
  prettier?: Config;
}

export default defineFormatter<any, Options>({
  meta: {
    name: "prettier-formatter",
    description:
      "A formatter that uses Prettier to format the generated documents.",
    version: packageJson.version,
    tags: ["prettier"],
    links: [
      {
        href: "https://prettier.io",
        description: "Prettier documentation"
      }
    ]
  },
  format: async (
    spec,
    options,
    documents
  ): Promise<Record<string, GeneratedDocument>> => {
    const context = useContext();

    const entries = await Promise.all(
      Object.entries(documents).map(async ([key, document]) => {
        if (document.chunks && document.chunks.length > 0) {
          const path = appendPath(
            document.path,
            context?.cwd ?? process.cwd()
          );

          let resolvedConfig = options?.prettier as Config | undefined;
          if (!resolvedConfig) {
            try {
              resolvedConfig = (await resolveConfig(path)) ?? undefined;
            } catch {
              // If resolving the config fails, we can ignore it and use the default Prettier settings
            }

            // If no config was found, we can use the default Prettier settings
            resolvedConfig ??= options?.prettier ?? {};
          }

          try {
            const formatted = await format(
              document.chunks.map(chunk => chunk.content ?? "").join(""),
              defu(
                {
                  ...resolvedConfig,
                  filepath: path
                },
                findFileExtension(path) === "ts" ||
                  findFileExtension(path) === "tsx"
                  ? { plugins: ["prettier-plugin-organize-imports"] }
                  : {}
              )
            );

            return [
              key,
              { ...document, chunks: [{ content: formatted }] }
            ] as const;
          } catch (error) {
            context.logger.warn(
              `Error formatting document with Prettier: ${String(error)}`
            );
          }
        }

        return [key, document] as const;
      })
    );

    return Object.fromEntries(entries);
  }
});
