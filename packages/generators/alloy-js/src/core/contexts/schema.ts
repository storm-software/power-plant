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
import { createContext, createNamedContext, useContext } from "@alloy-js/core";
import type { JsonSchemaLike } from "@power-plant/schema";

/**
 * The schema context used in template rendering.
 */
export const SchemaContext: ComponentContext<any> =
  createContext<any>();

/**
 * Hook to access the schema context.
 *
 * @returns A reactive version of the current schema.
 */
export function useSchema<TSchema = JsonSchemaLike>(): TSchema {
  const context = useContext<TSchema>(SchemaContext)!;
  if (!context) {
    throw new Error(
      "Schema is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  return context as TSchema;
}

/**
 * Hook to safely access the schema context.
 *
 * @returns The schema context or undefined if not set.
 */
export function useSchemaSafe<TSchema = JsonSchemaLike>(): TSchema | undefined {
  return useContext(SchemaContext) as TSchema | undefined;
}

/**
 * The schema property context used in template rendering.
 */
export const SchemaPropertyContext: ComponentContext<any> =
  createNamedContext<any>("SchemaProperty");

/**
 * Hook to access the Schema Property context.
 *
 * @returns A reactive version of the current schema property.
 */
export function useSchemaProperty<TSchemaProperty = JsonSchemaLike>(): TSchemaProperty {
  const context = useContext<TSchemaProperty>(SchemaPropertyContext)!;
  if (!context) {
    throw new Error(
      "Schema property is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  return context as TSchemaProperty;
}

/**
 * Hook to safely access the schema property context.
 *
 * @returns The schema property context or undefined if not set.
 */
export function useSchemaPropertySafe<TSchemaProperty = JsonSchemaLike>(): TSchemaProperty | undefined {
  return useContext(SchemaPropertyContext) as TSchemaProperty | undefined;
}
