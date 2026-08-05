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
import type { OperationSchema } from "../types";

export const HTTP_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace"
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

/**
 * A single OpenAPI operation resolved from a path item.
 */
export interface OpenAPIOperation {
  path: string;
  method: HttpMethod;
  operationId: string;
  operation: OperationSchema;
}

/**
 * Flatten `schema.paths` into operation entries (one per HTTP method).
 */
export function getOperations(schema: OpenAPISchema): OpenAPIOperation[] {
  const operations: OpenAPIOperation[] = [];

  for (const [path, pathItem] of Object.entries(schema.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) {
        continue;
      }

      operations.push({
        path,
        method,
        operationId: operation.operationId ?? `${method.toUpperCase()} ${path}`,
        operation
      });
    }
  }

  return operations;
}

/**
 * The operation id context used in template rendering.
 */
export const OperationIdContext: ComponentContext<string> =
  createContext<string>();

/**
 * Hook to access the operation context.
 *
 * @returns A reactive version of the current operation.
 */
export function useOperation(): OperationSchema {
  const operationId = useContext<string>(OperationIdContext)!;
  if (!operationId) {
    throw new Error(
      "Operation ID is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  const schema = useSchema() as OpenAPISchema;
  if (!schema) {
    throw new Error(
      "OpenAPI Schema is not available in the rendering context. Please make sure the Alloy components are being provided to an invocation of the `render` function added to plugins by `@power-plant/alloy-js`."
    );
  }

  const match = getOperations(schema).find(
    operation => operation.operationId === operationId
  );
  if (!match) {
    throw new Error(
      `Operation "${operationId}" is not defined on the OpenAPI schema.`
    );
  }

  return match.operation;
}

/**
 * Hook to safely access the operation context.
 *
 * @returns The operation or undefined if not set / not found.
 */
export function useOperationSafe(): OperationSchema | undefined {
  const operationId = useContext<string>(OperationIdContext);
  if (!operationId) {
    return undefined;
  }

  const schema = useSchemaSafe() as OpenAPISchema | undefined;
  if (!schema) {
    return undefined;
  }

  return getOperations(schema).find(
    operation => operation.operationId === operationId
  )?.operation;
}
