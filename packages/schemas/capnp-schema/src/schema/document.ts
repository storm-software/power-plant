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
import { fileSchema } from "./nodes";

/**
 * Validates a Cap'n Proto schema document produced from `.capnp` sources.
 *
 * The document mirrors Cap'n Proto schema language constructs (structs, fields,
 * unions/groups, enums, interfaces, constants, and annotations).
 *
 * @see https://capnproto.org/language.html
 */
export const capnpSchema = z
  .object({
    files: z.array(fileSchema)
  })
  .check(
    z.superRefine((document, context) => {
      const ids = new Set<string>();

      for (const [fileIndex, file] of document.files.entries()) {
        if (ids.has(file.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate Cap'n Proto file id "${file.id}"`,
            path: ["files", fileIndex, "id"]
          });
        }
        ids.add(file.id);

        for (const [structIndex, struct] of file.structs.entries()) {
          const ordinals = new Set<number>();
          for (const [fieldIndex, field] of struct.fields.entries()) {
            if (ordinals.has(field.ordinal)) {
              context.addIssue({
                code: "custom",
                message: `Duplicate field ordinal @${field.ordinal} on struct "${struct.name}"`,
                path: [
                  "files",
                  fileIndex,
                  "structs",
                  structIndex,
                  "fields",
                  fieldIndex,
                  "ordinal"
                ]
              });
            }
            ordinals.add(field.ordinal);
          }
        }
      }
    })
  );
