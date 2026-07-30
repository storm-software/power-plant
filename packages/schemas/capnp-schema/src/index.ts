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

import { defineSchema } from "@power-plant/core";
import type * as z from "zod/mini";
import packageJson from "../package.json";
import { capnpSchema } from "./schema";

export * from "./schema";
export type CapnpSchema = z.infer<typeof capnpSchema>;

export default defineSchema<CapnpSchema>({
  meta: {
    name: "capnp-schema",
    title: "Cap'n Proto Schema",
    version: packageJson.version,
    description:
      "A Cap'n Proto schema language document describing structs, fields, unions/groups, enums, interfaces, constants, and annotations.",
    tags: ["capnp", "capnproto"],
    links: [
      {
        href: "https://capnproto.org",
        description: "Cap'n Proto"
      },
      {
        href: "https://capnproto.org/language.html",
        description: "Cap'n Proto Schema Language"
      },
      {
        href: "https://github.com/capnproto/capnproto",
        description: "Cap'n Proto GitHub Repository"
      }
    ]
  },
  schema: capnpSchema
});
