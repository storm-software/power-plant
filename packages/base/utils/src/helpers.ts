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
  GeneratorFunction,
  InferInputConfig,
  InferOutputConfig,
  InferSchemaConfig,
  InputConfig,
  InputFunction,
  OutputConfig,
  OutputFunction,
  SchemaConfigObject
} from "@power-plant/core";
import {
  isGeneratorConfigObject,
  isInputConfigObject,
  isOutputConfigObject,
  isSchemaConfigObject
} from "@power-plant/core/helpers/type-checks";
import type { SchemaConfig, SchemaSourceConfig } from "@power-plant/schema";
import { isFunction } from "@stryke/type-checks/is-function";
import type { AnyGeneratorConfig } from "./types";

export type CompositeUtility = "combine" | "pipe";

function formatChildLabel(
  utility: CompositeUtility,
  identifier: string | number
): string {
  if (utility === "combine") {
    return `Combined generator "${identifier}"`;
  }

  return `Pipe generator at index ${identifier}`;
}

export function resolveChildSchema(
  config: AnyGeneratorConfig
): InferSchemaConfig<AnyGeneratorConfig> | undefined {
  if (isGeneratorConfigObject(config)) {
    return config.schema;
  }

  return undefined;
}

export function resolveChildInput(
  config: AnyGeneratorConfig
): InferInputConfig<AnyGeneratorConfig> | undefined {
  if (isGeneratorConfigObject(config)) {
    return config.input;
  }

  return undefined;
}

export function resolveChildOutput(
  config: AnyGeneratorConfig
): InferOutputConfig<AnyGeneratorConfig> | undefined {
  if (isGeneratorConfigObject(config)) {
    return config.output;
  }

  return undefined;
}

export function unwrapSchemaSource(
  schema:
    | SchemaConfig
    | SchemaConfigObject<any>
    | InferSchemaConfig<AnyGeneratorConfig>
    | undefined
): SchemaSourceConfig | { type: "any" } {
  if (schema === undefined) {
    return { type: "any" };
  }

  if (isSchemaConfigObject(schema)) {
    return schema.schema as SchemaSourceConfig;
  }

  return schema as SchemaSourceConfig;
}

export function resolveSchemaOverride<TSpec>(
  schemaOverride: NonNullable<
    InferSchemaConfig<AnyGeneratorConfig> | SchemaConfigObject<any>
  >
): SchemaConfigObject<TSpec> {
  if (isSchemaConfigObject(schemaOverride)) {
    return schemaOverride as SchemaConfigObject<TSpec>;
  }

  return {
    schema: schemaOverride
  } as SchemaConfigObject<TSpec>;
}

export function resolveInputValue<TSpec, TOptions extends object>(
  input: InputConfig<TSpec, TOptions> | undefined,
  options: TOptions,
  utility: CompositeUtility,
  identifier: string | number
): TSpec | Promise<TSpec> {
  const label = formatChildLabel(utility, identifier);
  const configLabel = utility === "combine" ? "combined" : "pipe";

  if (input === undefined) {
    throw new TypeError(
      `${label} has no input config. Provide \`input\` on the child generator or on the ${configLabel} config.`
    );
  }

  if (isFunction(input)) {
    return input(options);
  }

  if (isInputConfigObject(input)) {
    const inner = input.input as TSpec | InputFunction<TSpec, TOptions>;

    return isFunction(inner) ? inner(options) : inner;
  }

  if (typeof input === "string") {
    throw new TypeError(
      `${label} uses a load-reference input, which is not supported inside ${utility}(). Provide a concrete input value or function.`
    );
  }

  return input as TSpec;
}

export function resolveOutputFunction<TSpec, TOptions extends object, TReturns>(
  output: OutputConfig<TSpec, TOptions, TReturns> | undefined,
  utility: CompositeUtility,
  identifier: string | number
): OutputFunction<TSpec, TOptions, TReturns> {
  const label = formatChildLabel(utility, identifier);

  if (output === undefined) {
    return async () => undefined as TReturns;
  }

  if (isFunction(output)) {
    return output;
  }

  if (isOutputConfigObject(output) && isFunction(output.output)) {
    return output.output;
  }

  throw new TypeError(
    `${label} uses a load-reference output, which is not supported inside ${utility}(). Provide a concrete output function.`
  );
}

export function resolveGeneratorFunction<TSpec, TOptions extends object>(
  config: AnyGeneratorConfig,
  utility: CompositeUtility,
  identifier: string | number
): GeneratorFunction<TSpec, TOptions> {
  const label = formatChildLabel(utility, identifier);

  if (!isGeneratorConfigObject(config)) {
    throw new TypeError(
      `${label} must be a generator config object (load references are not supported inside ${utility}()).`
    );
  }

  if (!isFunction(config.generator)) {
    throw new TypeError(
      `${label} must provide an inline generator function (load references are not supported inside ${utility}()).`
    );
  }

  return config.generator;
}
