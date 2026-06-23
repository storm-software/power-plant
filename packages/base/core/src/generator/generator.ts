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

import type { ExtractOptions } from "@power-plant/schema/extract";
import { extract as extractSchema } from "@power-plant/schema/extract";
import { isFunction } from "@stryke/type-checks/is-function";
import { extractSink } from "../sink/extract";
import { extractSource } from "../source/extract";
import type { Generator, GeneratorInput } from "../types/generator";

/**
 * Creates a generator from raw schema/source/sink inputs and resolves all descriptors.
 *
 * @remarks
 * This function is used to create a generator from raw schema, source, and sink inputs. It resolves all descriptors and returns a fully constructed generator that can be used to generate output based on the provided schema and options.
 *
 * @template TSpec - The type of the specification that the generator will produce.
 * @template TOptions - The type of the options that will be passed to the generator during generation.
 * @param input - The generator input containing schema, source, sink, and optional meta information.
 * @param options - Optional extraction options for schema, source, and sink.
 * @returns A promise that resolves to a fully constructed generator.
 */
export async function createGenerator<TSpec, TOptions = any>(
  input: GeneratorInput<TSpec, TOptions>,
  options?: ExtractOptions
): Promise<Generator<TSpec, TOptions>> {
  const schema = await extractSchema(input.schema, options);

  const [source, sink] = await Promise.all([
    extractSource(schema, input.source, options),
    extractSink(schema, input.sink, options)
  ]);

  const generate = async (options: TOptions) => {
    const spec = isFunction(source.source)
      ? await (
          source.source as unknown as (
            options: TOptions
          ) => TSpec | Promise<TSpec>
        )(options)
      : source.source;

    const description =
      typeof input.meta?.description === "function"
        ? input.meta.description(spec)
        : input.meta?.description;

    if (description) {
      // eslint-disable-next-line no-console
      console.log(`Generating ${description}...`);
    }

    await sink.sink(spec, options);
  };

  return {
    meta: input.meta,
    schema,
    source,
    sink,
    generate
  };
}
