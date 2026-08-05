import type { ComponentProps } from "@power-plant/alloy-js/core/types";
import { OperationIdContext } from "../contexts/operation";

export interface OperationProps extends ComponentProps {
  operationId: string;
}

/**
 * Provides the operation id to the operation context.
 */
export function OperationProvider({ operationId, children }: OperationProps) {
  return (
    <OperationIdContext.Provider value={operationId}>
      {children}
    </OperationIdContext.Provider>
  );
}
