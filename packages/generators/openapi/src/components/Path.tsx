import type { ComponentProps } from "@power-plant/alloy-js/core/types";
import { PathContext } from "../contexts/path";

export interface PathProps extends ComponentProps {
  path: string;
}

/**
 * Provides the path to the path context.
 */
export function PathProvider({ path, children }: PathProps) {
  return <PathContext.Provider value={path}>{children}</PathContext.Provider>;
}
