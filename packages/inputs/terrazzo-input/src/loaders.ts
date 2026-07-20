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

import { toArray } from "@stryke/convert/to-array";
import { load } from "@stryke/resolve/load";
import type { LoadReference } from "@stryke/resolve/types";
import { toTokenFilename } from "./utilities";

/**
 * A Terrazzo `parse()` input source (filename + raw document).
 *
 * @see https://terrazzo.app/docs/reference/js-api/
 */
export interface TokenInputSource {
  filename: URL;
  src: unknown;
}

/**
 * Loads one or more DTCG token documents into Terrazzo input sources.
 *
 * @see https://github.com/terrazzoapp/terrazzo/tree/main/packages/parser
 *
 * @param references - Token file paths, URLs, or loadable module references.
 * @param cwd - Working directory used to resolve relative paths.
 * @returns Input sources ready for `@terrazzo/parser` `parse()`.
 */
export async function loadTokenSources(
  references: LoadReference | LoadReference[],
  cwd: string
): Promise<TokenInputSource[]> {
  const sources: TokenInputSource[] = [];

  for (const reference of toArray(references)) {
    const filename = toTokenFilename(reference, cwd);
    const src = await load(reference);

    sources.push({ filename, src });
  }

  return sources;
}
