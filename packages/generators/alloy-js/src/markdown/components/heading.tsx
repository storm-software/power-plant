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

import type { HeadingProps as BaseHeadingProps } from "@alloy-js/markdown";
import { Heading as BaseHeading } from "@alloy-js/markdown";
import { Spacing } from "../../core/components/spacing";

export interface HeadingProps extends BaseHeadingProps {}

/**
 * Renders a heading for a markdown file.
 *
 * @see https://www.markdownguide.org/basic-syntax/#headings
 *
 * @example
 * ```tsx
 * <Heading level={1}>This is a heading</Heading>
 * ```
 */
export function Heading(props: HeadingProps) {
  const { children, ...rest } = props;

  return (
    <>
      <BaseHeading level={1} {...rest}>
        {children}
      </BaseHeading>
      <Spacing />
    </>
  );
}
