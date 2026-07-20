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

import type { GeneratorFunctionResult } from "@power-plant/core";
import { defineGenerator, useExecution } from "@power-plant/core";
import type { Tokens } from "@power-plant/dtcg-schema";
import schema from "@power-plant/dtcg-schema";
import type { Options as InputOptions } from "@power-plant/terrazzo-input";
import input from "@power-plant/terrazzo-input";
import { isString } from "@stryke/type-checks/is-string";
import { isAbsolute, resolve } from "node:path";
import StyleDictionary from "style-dictionary";
import type { Config } from "style-dictionary/types";

export type Options = Config & InputOptions;

function toChunkContent(contents: unknown): string {
  if (isString(contents)) {
    return contents;
  }

  if (
    contents != null &&
    typeof contents === "object" &&
    "toString" in contents &&
    typeof contents.toString === "function"
  ) {
    const asString = contents.toString();
    if (asString !== "[object Object]") {
      return asString;
    }
  }

  return JSON.stringify(contents);
}

function resolvePaths(
  paths: string[] | undefined,
  cwd: string
): string[] | undefined {
  if (!paths) {
    return undefined;
  }

  return paths.map(path => (isAbsolute(path) ? path : resolve(cwd, path)));
}

/**
 * The Style Dictionary generator.
 *
 * Runs `style-dictionary` `formatAllPlatforms()` against a design tokens
 * document and returns the in-memory formatted output files.
 *
 * @see https://styledictionary.com
 * @see https://styledictionary.com/reference/api/
 *
 * @param spec - The design tokens document to generate from.
 * @param options - Style Dictionary config (platforms, hooks, …).
 * @returns Generated documents keyed by output filename.
 */
export default defineGenerator<Tokens, Options, void>({
  meta: {
    name: "style-dictionary",
    title: "Style Dictionary",
    description:
      "A generator that uses Style Dictionary to generate platform code from design tokens.",
    version: "1.0",
    tags: ["dtcg", "style-dictionary"],
    links: [
      {
        href: "https://styledictionary.com",
        description: "Style Dictionary"
      },
      {
        href: "https://styledictionary.com/reference/api/",
        description: "Style Dictionary - API"
      },
      {
        href: "https://github.com/style-dictionary/style-dictionary",
        description: "Style Dictionary GitHub Repository"
      }
    ]
  },
  schema,
  input,
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<Tokens, Options>> => {
    const {
      inputPath: _inputPath,
      config: _inputConfig,
      ...rawConfig
    } = options;
    const { cwd } = useExecution();

    const sd = new StyleDictionary({
      ...rawConfig,
      source: resolvePaths(rawConfig.source, cwd),
      include: resolvePaths(rawConfig.include, cwd),
      tokens: spec,
      usesDtcg: rawConfig.usesDtcg ?? true
    });

    const platformOutputs = (await sd.formatAllPlatforms()) as Record<
      string,
      Array<{ output: unknown; destination?: string }>
    >;

    return Object.entries(platformOutputs).reduce(
      (documents, [platform, files]) => {
        for (const file of files) {
          const path = file.destination ?? `${platform}.output`;

          documents[path] = {
            path,
            chunks: [
              {
                content: toChunkContent(file.output),
                meta: {
                  name: platform
                }
              }
            ]
          };
        }

        return documents;
      },
      {} as GeneratorFunctionResult<Tokens, Options>
    );
  }
});
