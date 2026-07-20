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
  GeneratedDocument,
  GeneratorConfigObject,
  InputConfigObject,
  InputFunction,
  OutputFunction
} from "@power-plant/core";
import { isFunction } from "@stryke/type-checks/is-function";

export async function invokeInput<TSpec, TOptions extends object>(
  config: InputConfigObject<TSpec, TOptions>,
  options: TOptions = {} as TOptions
): Promise<TSpec> {
  const value = config.input;

  if (isFunction(value)) {
    return (value as InputFunction<TSpec, TOptions>)(options);
  }

  return value as TSpec;
}

export async function invokeOutput<TReturns>(
  config: { output: unknown },
  spec: unknown,
  options: object = {},
  documents: Record<string, GeneratedDocument> = {}
): Promise<TReturns> {
  const output = config.output as OutputFunction<any, object, TReturns>;

  return output(spec, options, documents);
}

export function createTestExecute() {
  return async <TSpec, TOptions extends object, TReturns>(
    executable: GeneratorConfigObject<TSpec, TOptions, TReturns>,
    options: TOptions
  ): Promise<TReturns> => {
    const inputConfig = executable.input;
    if (inputConfig === undefined) {
      throw new Error("missing input");
    }

    let spec: TSpec;

    if (isFunction(inputConfig)) {
      spec = await (inputConfig as InputFunction<TSpec, TOptions>)(options);
    } else if (
      inputConfig &&
      typeof inputConfig === "object" &&
      "input" in inputConfig
    ) {
      const inner = inputConfig.input;
      spec = isFunction(inner)
        ? await (inner as InputFunction<TSpec, TOptions>)(options)
        : (inner as TSpec);
    } else {
      spec = inputConfig as TSpec;
    }

    const generatorFn = executable.generator as (
      spec: TSpec,
      options: TOptions
    ) => Promise<Record<string, GeneratedDocument>>;
    const documents = await generatorFn(spec, options);

    const outputConfig = executable.output;
    if (outputConfig === undefined) {
      return undefined as TReturns;
    }

    if (isFunction(outputConfig)) {
      return (outputConfig as OutputFunction<TSpec, TOptions, TReturns>)(
        spec,
        options,
        documents
      );
    }

    if (
      typeof outputConfig === "object" &&
      "output" in outputConfig &&
      isFunction(outputConfig.output)
    ) {
      return (outputConfig.output as OutputFunction<TSpec, TOptions, TReturns>)(
        spec,
        options,
        documents
      );
    }

    return undefined as TReturns;
  };
}
