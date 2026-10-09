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

import { load } from "@stryke/resolve/load";
import { isLoadReference } from "@stryke/resolve/type-checks";
import { isFormatterConfigObject } from "../helpers/type-checks";
import type {
  Formatter,
  FormatterConfig,
  FormatterConfigObject,
  FormatterFunction,
  InferCreateFormatterOptions
} from "../types";

/**
 * Normalizes any accepted formatter config into a concrete formatter descriptor.
 *
 * @param config - The formatter config to normalize.
 * @param options - Optional options for resolving the formatter config.
 * @returns A promise that resolves to a normalized formatter descriptor.
 */
export async function createFormatter<TSpec, TOptions extends object>(
  config: FormatterConfig<TSpec, TOptions>,
  options: InferCreateFormatterOptions<typeof config> = {}
): Promise<Formatter<TSpec, TOptions>> {
  const { format, meta } = isFormatterConfigObject<TSpec, TOptions>(config)
    ? config
    : { format: config, meta: undefined };

  let resolvedFormatter!: FormatterFunction<TSpec, TOptions>;
  let resolvedMeta = meta;
  if (isLoadReference(format)) {
    try {
      const loaded = await load<
        | FormatterFunction<TSpec, TOptions>
        | FormatterConfigObject<TSpec, TOptions>
      >(format, options);

      if (isFormatterConfigObject<TSpec, TOptions>(loaded)) {
        const created = await createFormatter<TSpec, TOptions>(loaded, options);
        resolvedFormatter = created.format;
        resolvedMeta ??= created.meta;
      } else {
        resolvedFormatter = loaded;
      }
    } catch {
      // Do nothing
    }
  }

  if (!resolvedFormatter) {
    resolvedFormatter = format as FormatterFunction<TSpec, TOptions>;
  }

  return {
    format: resolvedFormatter,
    meta: resolvedMeta
  };
}
