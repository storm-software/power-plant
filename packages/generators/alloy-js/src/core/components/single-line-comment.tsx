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

import { Prose } from "@alloy-js/core";
import type { ComponentProps } from "../types/components";

export type SingleLineCommentVariant =
  | "double-slash"
  | "triple-slash"
  | "slash-star"
  | "slash-star-star"
  | "markdown"
  | "yaml"
  | "hcl";

export interface SingleLineCommentProps extends ComponentProps {
  /**
   * The variant of the single line comment.
   *
   * @defaultValue "double-slash"
   */
  variant?: SingleLineCommentVariant;
}

/**
 * A single line comment block. The children are rendered as a prose element, which means that they
 * are broken into multiple lines
 */
export function SingleLineComment(props: SingleLineCommentProps) {
  const { variant = "double-slash", children } = props;

  const commentStart =
    variant === "slash-star"
      ? "/* "
      : variant === "slash-star-star"
        ? "/** "
        : variant === "triple-slash"
          ? "/// "
          : variant === "markdown"
            ? "<!-- "
            : variant === "yaml" || variant === "hcl"
              ? "# "
              : "// ";

  return (
    <>
      {commentStart}
      <align string={commentStart}>
        <Prose>{children}</Prose>

        {variant === "slash-star" || variant === "slash-star-star"
          ? " */ "
          : variant === "markdown"
            ? " -->"
            : ""}
      </align>
    </>
  );
}
