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
import type { PathSchema } from "../types";

/**
 * A single OpenAPI path resolved from `schema.paths`.
 */
export interface OpenAPIPath {
  path: string;
  pathItem: PathSchema;
}

/**
 * Flatten `schema.paths` into path entries.
 */
export function getPaths(schema: OpenAPISchema): OpenAPIPath[] {
  return Object.entries(schema.paths ?? {}).map(([path, pathItem]) => ({
    path,
    pathItem
  }));
}

/**
 * The path context used in template rendering.
 */
export const PathContext: ComponentContext<string> = createContext<string>();

/**
 * Hook to access the path context.
 *
 * @returns A reactive version of the current path item.
 */
export function usePath(): PathSchema {
  const path = useContext<string>(PathContext)!;
  if (!path) {
    throw new Error(
      "Path is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  const schema = useSchema() as OpenAPISchema;
  if (!schema) {
    throw new Error(
      "OpenAPI Schema is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  const match = getPaths(schema).find(entry => entry.path === path);
  if (!match) {
    throw new Error(`Path "${path}" is not defined on the OpenAPI schema.`);
  }

  return match.pathItem;
}

/**
 * Hook to safely access the path context.
 *
 * @returns The path item or undefined if not set / not found.
 */
export function usePathSafe(): PathSchema | undefined {
  const path = useContext<string>(PathContext);
  if (!path) {
    return undefined;
  }

  const schema = useSchemaSafe() as OpenAPISchema | undefined;
  if (!schema) {
    return undefined;
  }

  return getPaths(schema).find(entry => entry.path === path)?.pathItem;
}
