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
import { toTokenFilename } from "@power-plant/terrazzo-input/utilities";
import { isString } from "@stryke/type-checks/is-string";
import type { Config } from "@terrazzo/parser";
import { build, defineConfig, parse } from "@terrazzo/parser";
import type { Buffer } from "node:buffer";
import { pathToFileURL } from "node:url";
import packageJson from "../package.json";

export type Options = Config & InputOptions;

function toChunkContent(contents: string | Buffer): string {
  return isString(contents) ? contents : contents.toString("utf8");
}

/**
 * The Terrazzo generator.
 *
 * Runs `@terrazzo/parser` `parse()` + `build()` against a DTCG tokens document
 * and returns the in-memory plugin output files.
 *
 * @see https://terrazzo.app/docs/
 * @see https://terrazzo.app/docs/reference/js-api/
 *
 * @param spec - The DTCG tokens document to generate from.
 * @param options - Terrazzo config (plugins, outDir, lint, …).
 * @returns Generated documents keyed by output filename.
 */
export default defineGenerator<Tokens, Options, void>({
  meta: {
    name: "terrazzo",
    title: "Terrazzo",
    description:
      "A generator that uses Terrazzo to generate platform code from Design Tokens Community Group (DTCG) tokens.",
    version: packageJson.version,
    tags: ["dtcg", "terrazzo"],
    links: [
      {
        href: "https://terrazzo.app",
        description: "Terrazzo"
      },
      {
        href: "https://terrazzo.app/docs/",
        description: "Terrazzo Documentation"
      },
      {
        href: "https://terrazzo.app/docs/reference/js-api/",
        description: "Terrazzo - JS API"
      },
      {
        href: "https://github.com/terrazzoapp/terrazzo",
        description: "Terrazzo GitHub Repository"
      }
    ]
  },
  schema,
  input,
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<Tokens, Options>> => {
    const { inputPath, ...rawConfig } = options;
    const { cwd } = useExecution();

    const config = defineConfig(rawConfig, {
      cwd: pathToFileURL(cwd)
    });

    const reference = Array.isArray(inputPath) ? inputPath[0]! : inputPath;
    const { tokens, sources, resolver } = await parse(
      [
        {
          filename: toTokenFilename(reference, cwd),
          src: spec
        }
      ],
      { config }
    );

    const { outputFiles } = await build(tokens, {
      sources,
      resolver,
      config
    });

    return outputFiles.reduce(
      (documents, file) => {
        documents[file.filename] = {
          path: file.filename,
          chunks: [
            {
              content: toChunkContent(file.contents),
              meta: file.plugin
                ? {
                    name: file.plugin
                  }
                : undefined
            }
          ]
        };

        return documents;
      },
      {} as GeneratorFunctionResult<Tokens, Options>
    );
  }
});
