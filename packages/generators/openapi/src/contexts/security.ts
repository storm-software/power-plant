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

import {
  useSchema,
  useSchemaSafe
} from "@power-plant/alloy-js/core/contexts/schema";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import type { SecuritySchema } from "../types";

/**
 * Get the security requirements from the schema.
 */
export function getSecurity(schema: OpenAPISchema): SecuritySchema {
  return (schema.security ?? {}) as SecuritySchema;
}

/**
 * Hook to access the security context.
 *
 * @returns A reactive version of the current security schema.
 */
export function useSecurity(): SecuritySchema {
  return getSecurity(useSchema() as OpenAPISchema);
}

/**
 * Hook to safely access the security context.
 *
 * @returns The security schema or undefined if not set / not found.
 */
export function useSecuritySafe(): SecuritySchema | undefined {
  const schema = useSchemaSafe() as OpenAPISchema | undefined;
  if (!schema) {
    return undefined;
  }
  return getSecurity(schema);
}
