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
  Execution,
  ExtractedExecution,
  ExtractedExecutionDocument,
  ExtractedExecutionSource,
  InferExtractedMeta,
  Meta,
  MetaValue
} from "@power-plant/core";
import { isFunction } from "@stryke/type-checks/is-function";

export async function extractMetaValue<TSpec, TOptions extends object, TValue>(
  metaValue: MetaValue<TSpec, TOptions, TValue>,
  spec: TSpec,
  options: TOptions
): Promise<TValue> {
  return isFunction(metaValue)
    ? Promise.resolve(metaValue(spec, options))
    : Promise.resolve(metaValue);
}

export async function extractMeta<TSpec, TOptions extends object>(
  meta: Meta<TSpec, TOptions>,
  spec: TSpec,
  options: TOptions
): Promise<InferExtractedMeta<Meta<TSpec, TOptions>>> {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(meta).map(async ([key, value]) => {
        const extractedValue = await extractMetaValue(value, spec, options);

        return [key, extractedValue];
      })
    )
  ) as InferExtractedMeta<Meta<TSpec, TOptions>>;
}

export async function extractExecution<TSpec, TOptions extends object>(
  execution: Execution<TSpec, TOptions>,
  spec: TSpec,
  options: TOptions
): Promise<ExtractedExecution<TSpec, TOptions>> {
  const extractedDocuments: Record<
    string,
    ExtractedExecutionDocument<TSpec, TOptions>
  > = {};

  for (const [path, document] of Object.entries(execution.documents)) {
    const extractedSources: ExtractedExecutionSource<TSpec, TOptions>[] = [];

    for (const source of document.source) {
      const extractedSource: ExtractedExecutionSource<TSpec, TOptions> = {
        ...source,
        meta: await extractMeta(source.meta, spec, options)
      };
      extractedSources.push(extractedSource);
    }

    const extractedDocument: ExtractedExecutionDocument<TSpec, TOptions> = {
      ...document,
      source: extractedSources,
      meta: await extractMeta(document.meta, spec, options)
    };

    extractedDocuments[path] = extractedDocument;
  }

  const meta = await extractMeta(execution.meta, spec, options);

  return {
    ...execution,
    documents: extractedDocuments,
    meta: {
      ...meta,
      executionId: execution.meta.executionId,
      executedAt: execution.meta.executedAt,
      executedBy: execution.meta.executedBy
    } as InferExtractedMeta<Execution<TSpec, TOptions>["meta"]>
  };
}
