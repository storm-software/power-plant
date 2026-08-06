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

import type { Children, For, ForProps } from "@alloy-js/core";
import { useSchema } from "@power-plant/alloy-js/core/contexts/schema";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import type { OpenAPIPath } from "../contexts/path";
import { getPaths } from "../contexts/path";
import { PathProvider } from "./Path";

export type PathsProps = Omit<ForProps<OpenAPIPath[], Children>, "each">;

/**
 * Renders children once per OpenAPI path defined on the schema.
 */
export function Paths({ children, ...props }: PathsProps) {
  const schema = useSchema() as OpenAPISchema;
  const paths = getPaths(schema);

  return (
    <For {...props} each={paths}>
      {(entry, index) => (
        <PathProvider path={entry.path}>{children(entry, index)}</PathProvider>
      )}
    </For>
  );
}
