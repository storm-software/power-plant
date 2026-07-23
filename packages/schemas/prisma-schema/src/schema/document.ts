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

import * as z from "zod/mini";
import {
  datamodelSchema,
  dmmfSchemaTypesSchema,
  mappingsSchema
} from "./datamodel";

/**
 * Validates a Prisma DMMF (Data Model Meta Format) document.
 *
 * The DMMF is the AST of a Prisma schema used by Prisma Client generators.
 *
 * @see https://github.com/prisma/prisma/blob/main/packages/dmmf/src/dmmf.ts
 * @see https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types
 */
export const prismaSchema = z
  .object({
    datamodel: datamodelSchema,
    schema: dmmfSchemaTypesSchema,
    mappings: mappingsSchema
  })
  .check(
    z.superRefine((document, context) => {
      const modelNames = new Set(document.datamodel.models.map(m => m.name));

      for (const mapping of document.mappings.modelOperations) {
        if (!modelNames.has(mapping.model)) {
          context.addIssue({
            code: "custom",
            message: `Model mapping references unknown model "${mapping.model}"`,
            path: ["mappings", "modelOperations"]
          });
        }
      }
    })
  );
