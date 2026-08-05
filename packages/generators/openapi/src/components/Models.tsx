import type { Children } from "@alloy-js/core";
import { For, type ForProps } from "@alloy-js/core";
import { useSchema } from "@power-plant/alloy-js/core/contexts/schema";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import { getModels, type OpenAPIModel } from "../contexts/model";
import { ModelProvider } from "./Model";

export type ModelsProps = Omit<ForProps<OpenAPIModel[], Children>, "each">;

/**
 * Renders children once per OpenAPI model defined on the schema.
 */
export function Models({ children, ...props }: ModelsProps) {
  const schema = useSchema() as OpenAPISchema;
  const models = getModels(schema);

  return (
    <For {...props} each={models}>
      {(model, index) => (
        <ModelProvider modelName={model.name}>
          {children(model, index)}
        </ModelProvider>
      )}
    </For>
  );
}
