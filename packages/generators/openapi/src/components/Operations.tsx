import type { Children } from "@alloy-js/core";
import { For, type ForProps } from "@alloy-js/core";
import { useSchema } from "@power-plant/alloy-js/core/contexts/schema";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import {
  getOperations,
  type OpenAPIOperation
} from "../contexts/operation";
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
