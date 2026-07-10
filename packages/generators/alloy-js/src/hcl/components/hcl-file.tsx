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
import { computed, Show, SourceFile, splitProps } from "@alloy-js/core";
import { SingleLineComment } from "../../core/components/single-line-comment";
import type { SourceFileProps } from "../../core/components/source-file";
import {
  HEADER_TEXT_LINE_1,
  HEADER_TEXT_LINE_2
} from "../../core/helpers/header-constants";
import type { ComponentProps } from "../../core/types/components";

export type HCLFileProps = Omit<SourceFileProps, "header" | "filetype"> &
  ComponentProps & {
    header?: Children;
    filetype?: "hcl" | "tf" | `${string}.hcl` | `${string}.tf`;
  };

/**
 * A base component representing a Powerlines generated HCL source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function HCLFile(props: HCLFileProps) {
  const [{ children, header, filetype: _filetype }, rest] = splitProps(props, [
    "children",
    "header",
    "filetype"
  ]);

  const filetype = computed(() => _filetype || "hcl");

  return (
    <SourceFile
      header={<HCLFileHeader>{header}</HCLFileHeader>}
      {...rest}
      filetype={filetype.value}>
      <Show when={Boolean(children)}>{children}</Show>
    </SourceFile>
  );
}

/**
 * Renders the header for a Powerlines HCL source file.
 *
 * @param props - The properties for the source file header.
 * @returns The rendered source file header.
 */
export function HCLFileHeader(props: ComponentProps) {
  const [{ children }] = splitProps(props, ["children"]);

  return (
    <>
      <Show when={Boolean(children)}>
        <>
          {children}
          <hbr />
        </>
      </Show>
      <SingleLineComment variant="hcl">{HEADER_TEXT_LINE_1}</SingleLineComment>
      <hbr />
      <SingleLineComment variant="hcl">{HEADER_TEXT_LINE_2}</SingleLineComment>
      <hbr />
    </>
  );
}
