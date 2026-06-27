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
  resolveMetaId,
  resolveMetaLinks,
  resolveMetaName,
  resolveMetaTitle,
  resolveMetaVersion
} from "@power-plant/schema/metadata";
import type {
  ExtractedSchema,
  Meta,
  MetaInput
} from "@power-plant/schema/types";

/**
 * Extracts and normalizes metadata for a source based on the provided schema and optional input.
 *
 * @param schema - The schema that the source is expected to conform to.
 * @param input - Optional metadata input to extract and normalize.
 * @returns The normalized source metadata.
 */
export function extractMeta<TSpec>(
  schema?: ExtractedSchema<TSpec>,
  input?: MetaInput<TSpec>
): Meta<TSpec> {
  const extractedSchema = schema ?? ({ schema: {} } as ExtractedSchema<TSpec>);
  const meta = (extractedSchema?.meta ?? {}) as Meta<TSpec>;

  meta.name = resolveMetaName(extractedSchema?.schema, meta, input?.name);
  meta.version = resolveMetaVersion(
    extractedSchema?.schema,
    meta,
    input?.version
  );
  meta.id = resolveMetaId(extractedSchema?.schema, meta);
  meta.title = resolveMetaTitle(extractedSchema?.schema, meta, input?.title);
  meta.links = resolveMetaLinks(extractedSchema?.schema, meta, input?.links);

  if (input?.deprecated) {
    meta.deprecated = input?.deprecated;
  }
  if (input?.usage) {
    meta.usage = input?.usage;
  }
  if (input?.tags) {
    meta.tags = input?.tags;
  }

  return meta;
}
