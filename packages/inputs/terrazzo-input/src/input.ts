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
import type { DTCGSchema } from "@power-plant/dtcg-schema";
import { defineConfig, parse } from "@terrazzo/parser";
import { pathToFileURL } from "node:url";
import { loadTokenSources } from "./loaders";
import type { Options } from "./types";
import { formatParseError, fromTokenNormalizedSet } from "./utilities";

/**
 * Loads DTCG design tokens and validates them with `@terrazzo/parser`.
 *
 * @see https://terrazzo.app/docs/reference/js-api/
 * @see https://github.com/terrazzoapp/terrazzo/tree/main/packages/parser
 *
 * @param options - The options for the input.
 * @returns The loaded {@link DTCGSchema} document.
 */
export async function input(options: Options): Promise<DTCGSchema> {
  const { inputPath, config: rawConfig, ...parseOptions } = options;
  const { cwd } = useExecution();

  try {
    const sources = await loadTokenSources(inputPath, cwd);
    const config = defineConfig(rawConfig ?? {}, {
      cwd: pathToFileURL(cwd)
    });

    const { tokens } = await parse(sources, {
      ...parseOptions,
      config
    });

    return fromTokenNormalizedSet(tokens);
  } catch (error) {
    throw new Error(
      [
        `Failed to parse DTCG tokens from ${String(inputPath)}:`,
        formatParseError(error),
        "",
        "Supported token sources include:",
        "- Local JSON / JSONC token files",
        "- Remote token URLs",
        "- Inline JSON objects via loadable module exports"
      ].join("\n")
    );
  }
}
