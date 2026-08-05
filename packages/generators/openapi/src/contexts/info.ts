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
  useSchemaSafe,
  useSchema
} from "@power-plant/alloy-js/core/contexts/schema";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import type { InfoSchema, ModelSchema } from "../types";

/**
 * Flatten `schema.components.schemas` into model entries.
 */
export function getInfo(schema: OpenAPISchema): InfoSchema {
  return schema.info;
}

/**
 * Hook to access the info context.
 *
 * @returns A reactive version of the current info schema.
 */
export function useInfo(): InfoSchema {
  return getInfo(useSchema<OpenAPISchema>() as OpenAPISchema);
}

/**
 * Hook to safely access the info context.
 *
 * @returns The model schema or undefined if not set / not found.
 */
export function useInfoSafe(): InfoSchema | undefined {
  const schema = useSchemaSafe<OpenAPISchema>();
  if (!schema) {
    return undefined;
  }
  return getInfo(schema);
}
