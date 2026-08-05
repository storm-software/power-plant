import type { ComponentProps } from "@power-plant/alloy-js/core/types";
import { ModelNameContext } from "../contexts/model";

export interface ModelProps extends ComponentProps {
  modelName: string;
}

/**
 * Provides the model name to the model context.
 */
export function ModelProvider({ modelName, children }: ModelProps) {
  return (
    <ModelNameContext.Provider value={modelName}>
      {children}
    </ModelNameContext.Provider>
  );
}
