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

import type { SchemaDefinitionNode, SchemaExtensionNode } from "graphql";
import { Kind } from "graphql";
import * as z from "zod/mini";

/** Human-readable description for a schema element. */
export const descriptionSchema = z.optional(z.string());

/** Custom extension fields reserved for users. */
export const extensionsSchema = z.record(z.string(), z.unknown());

function isSchemaDefinitionNode(value: unknown): value is SchemaDefinitionNode {
  return (
    value != null &&
    typeof value === "object" &&
    "kind" in value &&
    value.kind === Kind.SCHEMA_DEFINITION
  );
}

function isSchemaExtensionNode(value: unknown): value is SchemaExtensionNode {
  return (
    value != null &&
    typeof value === "object" &&
    "kind" in value &&
    value.kind === Kind.SCHEMA_EXTENSION
  );
}

/** AST node from which a schema element was built. */
export const astNodeSchema = z.optional(
  z.custom<SchemaDefinitionNode>(
    value => value == null || isSchemaDefinitionNode(value),
    "Expected a SchemaDefinitionNode"
  )
);

/** AST extension nodes applied to a schema element. */
export const extensionAstNodesSchema = z.optional(
  z.array(
    z.custom<SchemaExtensionNode>(
      value => isSchemaExtensionNode(value),
      "Expected a SchemaExtensionNode"
    )
  )
);
