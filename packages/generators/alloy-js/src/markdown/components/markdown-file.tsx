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
import { Link } from "@alloy-js/markdown";
import { isSetObject } from "@stryke/type-checks";
import { SingleLineComment } from "../../core/components/single-line-comment";
import type { SourceFileProps } from "../../core/components/source-file";
import { SourceFile } from "../../core/components/source-file";
import {
  HEADER_TEXT_LINE_1,
  HEADER_TEXT_LINE_2
} from "../../core/helpers/header-constants";
import type {
  ComponentProps,
  SourceFileHeaderProps
} from "../../core/types/components";
import type { FrontMatterProps } from "./front-matter";
import { FrontMatter } from "./front-matter";

export type MarkdownFileProps = Omit<SourceFileProps, "filetype"> &
  ComponentProps &
  MarkdownFileHeaderProps;

/**
 * A base component representing a Powerlines generated markdown source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function MarkdownFile(props: MarkdownFileProps) {
  const [{ children, frontMatter }, rest] = splitProps(props, [
    "children",
    "frontMatter"
  ]);

  return (
    <SourceFile {...rest} filetype="md" reference={Link}>
      <Show when={Boolean(children)}>
        <MarkdownFileHeader frontMatter={frontMatter}>
          {children}
        </MarkdownFileHeader>
      </Show>
    </SourceFile>
  );
}

export type MarkdownFileHeaderProps = SourceFileHeaderProps & {
  frontMatter?: FrontMatterProps["data"];
};

/**
 * Renders the header for a Powerlines Typescript source file.
 *
 * @param props - The properties for the source file header.
 * @returns The rendered source file header.
 */
export function MarkdownFileHeader(props: MarkdownFileHeaderProps) {
  const [
    {
      children,
      disableEslint = true,
      disableBiome = true,
      disableOxlint = true,
      disablePrettier = false,
      frontMatter
    }
  ] = splitProps(props, [
    "children",
    "disableEslint",
    "disableBiome",
    "disableOxlint",
    "disablePrettier",
    "frontMatter"
  ]);

  return (
    <>
      <Show
        when={isSetObject(frontMatter) && Object.keys(frontMatter).length > 0}>
        <FrontMatter data={frontMatter ?? {}} />
      </Show>
      <Show when={Boolean(disableEslint)}>
        <SingleLineComment variant="markdown">
          {"eslint-disable"}
        </SingleLineComment>
        <hbr />
      </Show>
      <Show when={Boolean(disableOxlint)}>
        <SingleLineComment variant="markdown">
          {"oxlint-disable"}
        </SingleLineComment>
        <hbr />
      </Show>
      <Show when={Boolean(disablePrettier)}>
        <SingleLineComment variant="markdown">
          {"prettier-ignore"}
        </SingleLineComment>
        <hbr />
      </Show>
      <Show when={Boolean(disableBiome)}>
        <SingleLineComment variant="markdown">
          {"biome-ignore lint: disable"}
        </SingleLineComment>
        <hbr />
      </Show>
      <Show
        when={
          Boolean(disableEslint) ||
          Boolean(disablePrettier) ||
          Boolean(disableBiome) ||
          Boolean(disableOxlint)
        }>
        <hbr />
      </Show>
      <Show when={Boolean(children)}>
        <>
          {children}
          <hbr />
        </>
      </Show>
      <SingleLineComment variant="markdown">
        {HEADER_TEXT_LINE_1}
      </SingleLineComment>
      <hbr />
      <SingleLineComment variant="markdown">
        {HEADER_TEXT_LINE_2}
      </SingleLineComment>
      <hbr />
    </>
  );
}
