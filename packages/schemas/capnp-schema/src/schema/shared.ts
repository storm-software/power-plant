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

/**
 * Built-in Cap'n Proto scalar / blob types.
 *
 * @see https://capnproto.org/language.html#built-in-types
 */
export const builtinTypeKindSchema = z.enum([
  "void",
  "bool",
  "int8",
  "int16",
  "int32",
  "int64",
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "float32",
  "float64",
  "text",
  "data",
  "anyPointer"
]);

export const fieldKindSchema = z.enum(["slot", "group"]);

export const nodeKindSchema = z.enum([
  "file",
  "struct",
  "enum",
  "interface",
  "const",
  "annotation"
]);

/**
 * Cap'n Proto type IDs are 64-bit integers, represented as hex strings
 * (e.g. `"0xdbb9ad1f14bf0b36"`).
 */
export const typeIdSchema = z.string();
