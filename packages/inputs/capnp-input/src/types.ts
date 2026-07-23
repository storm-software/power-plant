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

import type { CapnpcOptions } from "@stryke/capnp/types";
import type { LoadReference } from "@stryke/resolve/types";
import type { Arrayable } from "@stryke/types/array";

export interface Options {
  /**
   * Pointer to one or more Cap'n Proto schema sources (`.capnp` files or globs).
   */
  inputPath: Arrayable<LoadReference>;

  /**
   * Path to a TypeScript config used by `@stryke/capnp` `capnpc`.
   *
   * @defaultValue nearest `tsconfig.json` from the execution cwd
   */
  tsconfigPath?: string;

  /**
   * Output directory passed to `capnpc` (generated sources are discarded by the
   * input; only the compiled schema AST is returned).
   *
   * @defaultValue a temporary directory under the project root
   */
  output?: string;

  /**
   * Additional `capnpc` options (ts/js/dts flags, import paths, etc.).
   */
  capnpc?: Omit<
    CapnpcOptions,
    "schemas" | "workspaceRoot" | "projectRoot" | "tsconfig" | "tsconfigPath"
  >;
}
