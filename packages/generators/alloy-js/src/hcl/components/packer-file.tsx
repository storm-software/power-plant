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

import { Show, splitProps } from "@alloy-js/core";
import type { PartialKeys } from "@stryke/types/base";
import type { HCLFileProps } from "./hcl-file";
import { HCLFile } from "./hcl-file";

export type PackerFileProps = PartialKeys<HCLFileProps, "filetype">;

/**
 * A base component representing a Powerlines generated [Packer](https://developer.hashicorp.com/packer/docs/templates/hcl_templates) source file.
 *
 * @see https://developer.hashicorp.com/packer
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function PackerFile(props: PackerFileProps) {
  const [{ children }, rest] = splitProps(props, ["children"]);

  return (
    <HCLFile filetype="pkr.hcl" {...rest}>
      <Show when={Boolean(children)}>{children}</Show>
    </HCLFile>
  );
}
