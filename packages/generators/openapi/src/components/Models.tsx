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

import type { Children, ForProps } from "@alloy-js/core";
import { For } from "@alloy-js/core";
import { useSchema } from "@power-plant/alloy-js/core/contexts/schema";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import type { OpenAPIModel } from "../contexts/model";
import { getModels } from "../contexts/model";
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
