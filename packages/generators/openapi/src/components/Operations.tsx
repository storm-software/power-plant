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
import type { OpenAPIOperation } from "../contexts/operation";
import { getOperations } from "../contexts/operation";
import { OperationProvider } from "./Operation";

export type OperationsProps = Omit<
  ForProps<OpenAPIOperation[], Children>,
  "each"
>;

/**
 * Renders children once per OpenAPI operation defined on the schema.
 */
export function Operations({ children, ...props }: OperationsProps) {
  const schema = useSchema() as OpenAPISchema;
  const operations = getOperations(schema);

  return (
    <For {...props} each={operations}>
      {(operation, index) => (
        <OperationProvider operationId={operation.operationId}>
          {children(operation, index)}
        </OperationProvider>
      )}
    </For>
  );
}
