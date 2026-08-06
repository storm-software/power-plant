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

import type { ComponentContext } from "@alloy-js/core";
import { createContext, useContext } from "@alloy-js/core";
import {
  useSchema,
  useSchemaSafe
} from "@power-plant/alloy-js/core/contexts/schema";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import type { ModelSchema } from "../types";

/**
 * A single OpenAPI model resolved from `schema.components.schemas`.
 */
export interface OpenAPIModel {
  name: string;
  schema: ModelSchema;
}

/**
 * Flatten `schema.components.schemas` into model entries.
 */
export function getModels(schema: OpenAPISchema): OpenAPIModel[] {
  return Object.entries(schema.components?.schemas ?? {}).map(
    ([name, modelSchema]) => ({
      name,
      schema: modelSchema
    })
  );
}

/**
 * The model name context used in template rendering.
 */
export const ModelNameContext: ComponentContext<string> =
  createContext<string>();

/**
 * Hook to access the model context.
 *
 * @returns A reactive version of the current model schema.
 */
export function useModel(): ModelSchema {
  const modelName = useContext<string>(ModelNameContext)!;
  if (!modelName) {
    throw new Error(
      "Model name is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  const schema = useSchema() as OpenAPISchema;
  if (!schema) {
    throw new Error(
      "OpenAPI Schema is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  const match = getModels(schema).find(model => model.name === modelName);
  if (!match) {
    throw new Error(
      `Model "${modelName}" is not defined on the OpenAPI schema.`
    );
  }

  return match.schema;
}

/**
 * Hook to safely access the model context.
 *
 * @returns The model schema or undefined if not set / not found.
 */
export function useModelSafe(): ModelSchema | undefined {
  const modelName = useContext<string>(ModelNameContext);
  if (!modelName) {
    return undefined;
  }

  const schema = useSchemaSafe() as OpenAPISchema | undefined;
  if (!schema) {
    return undefined;
  }

  return getModels(schema).find(model => model.name === modelName)?.schema;
}
