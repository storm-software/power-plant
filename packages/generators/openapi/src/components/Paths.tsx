import type { Children } from "@alloy-js/core";
import { For, type ForProps } from "@alloy-js/core";
import { useSchema } from "@power-plant/alloy-js/core/contexts/schema";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import { getPaths, type OpenAPIPath } from "../contexts/path";
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
