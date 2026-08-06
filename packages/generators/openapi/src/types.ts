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

import type {
  infoSchema,
  operationSchema,
  pathItemSchema,
  securityRequirementSchema
} from "@power-plant/openapi-schema";
import type { jsonSchema } from "@power-plant/schema/zod";
import type * as z from "zod/mini";

export type OperationSchema = z.infer<typeof operationSchema>;
export type PathSchema = z.infer<typeof pathItemSchema>;
export type ModelSchema = z.infer<typeof jsonSchema>;
export type InfoSchema = z.infer<typeof infoSchema>;
export type SecuritySchema = z.infer<typeof securityRequirementSchema>;
