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

import { For } from "@alloy-js/core";

export interface SpacingProps {
  /**
   * A scale factor that determines the amount of vertical space to be added.
   *
   * @remarks
   * The default value is 1, which corresponds to a standard spacing. A value of 2 would double the spacing, while a value of 0.5 would halve it.
   *
   * @defaultValue 1
   */
  scale?: number;
}

/**
 * A simple component that renders two horizontal breaks to create vertical spacing between elements.
 */
export function Spacing({ scale = 1 }: SpacingProps) {
  return (
    <For each={Array.from({ length: scale })}>
      {_ => (
        <>
          <hbr />
          <hbr />
        </>
      )}
    </For>
  );
}
