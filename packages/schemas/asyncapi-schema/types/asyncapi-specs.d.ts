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

declare module "@asyncapi/specs" {
  import type { JSONSchema7 } from "json-schema";

  export const schemas: Record<
    | "2.0.0"
    | "2.1.0"
    | "2.2.0"
    | "2.3.0"
    | "2.4.0"
    | "2.5.0"
    | "2.6.0"
    | "3.0.0"
    | "3.1.0",
    JSONSchema7
  >;
}
