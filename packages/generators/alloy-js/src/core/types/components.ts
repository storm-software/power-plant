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

import type { Children } from "@alloy-js/core";
import type { GeneratedDocument } from "@power-plant/core";

export type OutputFile<TSpec, TOptions extends object> = Omit<
  GeneratedDocument<TSpec, TOptions>,
  "source"
> & {
  kind: "file";
};

export interface OutputDirectory<TSpec, TOptions extends object> {
  kind: "directory";
  path: string;
  content: (OutputDirectory<TSpec, TOptions> | OutputFile<TSpec, TOptions>)[];
}

/**
 * A type that represents the props of a component that can have children.
 */
export interface ComponentProps {
  children?: Children;
}

/**
 * A type that requires the `children` prop in a component.
 */
export type ComponentPropsWithChildren = Omit<ComponentProps, "children"> &
  Required<Pick<ComponentProps, "children">>;

export interface SourceFileHeaderProps extends ComponentProps {
  /**
   * If true, disables the ESLint directive at the top of the file.
   *
   * @see https://eslint.org/docs
   *
   * @defaultValue true
   */
  disableEslint?: boolean;

  /**
   * If true, disables the Biome directive at the top of the file.
   *
   * @see https://biomejs.dev/guides/getting-started/
   *
   * @defaultValue true
   */
  disableBiome?: boolean;

  /**
   * If true, disables the Oxlint directive at the top of the file.
   *
   * @see https://oxc.rs/docs/guide/usage/linter
   *
   * @defaultValue true
   */
  disableOxlint?: boolean;

  /**
   * If true, disables the Prettier directive at the top of the file.
   *
   * @defaultValue false
   */
  disablePrettier?: boolean;
}
