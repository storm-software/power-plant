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

import type { SchemaEnvelopeOf, SchemaSourceConfig } from "@power-plant/schema";
import { toArray } from "@stryke/convert/to-array";
import { toMode } from "@stryke/env/environment-checks";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { readFileIfExisting } from "@stryke/fs/read-file";
import { joinPaths } from "@stryke/path/join";
import { load } from "@stryke/resolve/load";
import { isFunction } from "@stryke/type-checks/is-function";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { uuid } from "@stryke/unique-id/uuid";
import { loadConfig } from "c12";
import defu from "defu";
import { createJiti } from "jiti";
import * as fs from "node:fs";
import { existsSync } from "node:fs";
import os from "node:os";
import { callAsyncContext } from "../context";
import { isGeneratorConfigObject } from "../helpers/type-checks";
import { NativeBindingEngine } from "../native";
import type { UserConfig, UserConfigExport } from "../types/config";
import type { Context } from "../types/context";
import type {
  Generator,
  GeneratorConfig,
  GeneratorConfigObject,
  InferCreateGeneratorOptions
} from "../types/generator";
import type { SchemaConfigObject } from "../types/schema";
import type { Logger } from "../types/settings";
import { createInput } from "./input";
import { createOutput } from "./output";
import { createSchema } from "./schema";

const homeDir = os.homedir();

const logger: Logger = {
  // eslint-disable-next-line no-console
  debug: console.debug,
  // eslint-disable-next-line no-console
  info: console.info,
  // eslint-disable-next-line no-console
  warn: console.warn,
  // eslint-disable-next-line no-console
  error: console.error
};

const paths = getEnvPaths({
  appId: "power-plant",
  orgId: "storm-software"
});

const jiti = createJiti(process.cwd(), {
  fsCache: joinPaths(paths.cache, "jiti")
});

async function createContext(userConfig: UserConfig = {}): Promise<Context> {
  const cwd = userConfig.cwd || process.cwd();
  const mode = toMode(
    userConfig.debug === true
      ? "development"
      : userConfig.settings?.mode ||
          process.env.STORM_MODE ||
          process.env.NEXT_PUBLIC_VERCEL_ENV ||
          process.env.NODE_ENV ||
          "production"
  );

  const configFile =
    userConfig.configFile ||
    existsSync(joinPaths(cwd, `power-plant.${mode}.config.ts`))
      ? joinPaths(cwd, `power-plant.${mode}.config.ts`)
      : existsSync(joinPaths(cwd, `power-plant.${mode}.config.tsx`))
        ? joinPaths(cwd, `power-plant.${mode}.config.tsx`)
        : existsSync(joinPaths(cwd, `power-plant.config.mts`))
          ? joinPaths(cwd, `power-plant.config.mts`)
          : existsSync(joinPaths(cwd, `power-plant.config.cts`))
            ? joinPaths(cwd, `power-plant.config.cts`)
            : existsSync(joinPaths(cwd, `power-plant.config.mjs`))
              ? joinPaths(cwd, `power-plant.config.mjs`)
              : existsSync(joinPaths(cwd, `power-plant.config.cjs`))
                ? joinPaths(cwd, `power-plant.config.cjs`)
                : existsSync(joinPaths(cwd, `power-plant.config.js`))
                  ? joinPaths(cwd, `power-plant.config.js`)
                  : existsSync(joinPaths(cwd, `power-plant.config.jsx`))
                    ? joinPaths(cwd, `power-plant.config.jsx`)
                    : undefined;

  let projectConfig: UserConfig[] = [];
  if (configFile) {
    const resolved = await jiti.import<{ default: UserConfigExport }>(
      jiti.esmResolve(configFile)
    );
    if (resolved?.default) {
      let config:
        UserConfig | UserConfig[] | Promise<UserConfig | UserConfig[]> = {};
      if (isFunction(resolved.default)) {
        config = await Promise.resolve(resolved.default({ cwd, mode }));
      } else if (
        isSetObject(resolved.default) ||
        Array.isArray(resolved.default)
      ) {
        config = resolved.default;
      }

      if (isSetObject(config) || Array.isArray(config)) {
        projectConfig = toArray(await Promise.resolve(config));
      }
    }
  }

  const settings = defu(
    userConfig.settings ?? {},
    JSON.parse(
      (await readFileIfExisting(
        joinPaths(
          userConfig.settings?.paths?.config ?? paths.config,
          "settings.json"
        )
      )) || "{}"
    ),
    {
      paths,
      mode
    }
  );

  const [
    { config: config1 },
    { config: config2 },
    { config: config3 },
    { config: config4 },
    { config: config5 },
    { config: config6 },
    { config: config7 },
    { config: config8 }
  ] = await Promise.all([
    loadConfig<UserConfig>({
      name: "power-plant",
      cwd: process.cwd(),
      dotenv: true,
      globalRc: true,
      packageJson: "power-plant",
      envName: settings.mode
    }),
    loadConfig<UserConfig>({
      name: "powerplant",
      cwd: process.cwd(),
      dotenv: true,
      globalRc: true,
      packageJson: "powerplant",
      envName: settings.mode
    }),
    loadConfig<UserConfig>({
      name: "power-plant",
      cwd: process.cwd(),
      dotenv: true,
      globalRc: true,
      packageJson: "power-plant"
    }),
    loadConfig<UserConfig>({
      name: "powerplant",
      cwd: process.cwd(),
      dotenv: true,
      globalRc: true,
      packageJson: "powerplant"
    }),
    loadConfig<UserConfig>({
      name: "power-plant",
      cwd: homeDir,
      dotenv: true,
      globalRc: true,
      envName: settings.mode
    }),
    loadConfig<UserConfig>({
      name: "powerplant",
      cwd: homeDir,
      dotenv: true,
      globalRc: true,
      envName: settings.mode
    }),
    loadConfig<UserConfig>({
      name: "power-plant",
      cwd: homeDir,
      dotenv: true,
      globalRc: true
    }),
    loadConfig<UserConfig>({
      name: "powerplant",
      cwd: homeDir,
      dotenv: true,
      globalRc: true
    })
  ]);

  return defu(
    {
      cwd,
      session: {
        sessionId: uuid(),
        startedAt: new Date(),
        systemId: uuid()
      }
    },
    userConfig,
    ...projectConfig,
    { settings, fs, logger },
    config1,
    config2,
    config3,
    config4,
    config5,
    config6,
    config7,
    config8
  ) as Context;
}

/**
 * Creates a generator from raw schema/input/output configurations and resolves all descriptors.
 *
 * @remarks
 * This function is used to create a generator from raw schema, input, and output configurations. It resolves all descriptors and returns a fully constructed generator that can be used to generate output based on the provided schema and options.
 *
 * @template TSpec - The type of the specification that the generator will produce.
 * @template TOptions - The type of the options that will be passed to the generator during generation.
 * @param config - The generator configuration containing schema, input, output, and optional meta information.
 * @param options - Optional extraction options for schema, input, and output.
 * @returns A promise that resolves to a fully constructed generator.
 */
export async function createGenerator<
  TSpec,
  TOptions extends object,
  TReturns = void
>(
  config: GeneratorConfig<TSpec, TOptions, TReturns>,
  options: InferCreateGeneratorOptions<typeof config> = {}
): Promise<Generator<TSpec, TOptions, TReturns>> {
  let configObject!: GeneratorConfigObject<TSpec, TOptions, TReturns>;
  if (isGeneratorConfigObject<TSpec, TOptions, TReturns>(config)) {
    configObject = config;
  } else {
    configObject = await load<GeneratorConfigObject<TSpec, TOptions, TReturns>>(
      config,
      options
    );
  }

  const schema = await createSchema<TSpec, TOptions>(
    configObject.schema as
      | SchemaSourceConfig<TSpec>
      | SchemaEnvelopeOf<TSpec>
      | SchemaConfigObject<TSpec, TOptions>,
    options
  );
  const [input, output] = await Promise.all([
    createInput<TSpec, TOptions>(schema, configObject.input, options),
    createOutput<TSpec, TOptions, TReturns>(
      schema,
      configObject.output,
      options
    )
  ]);

  const generate = async (options: TOptions & UserConfig) => {
    const context = await createContext(options);
    const engine = new NativeBindingEngine(context);

    return callAsyncContext(context, async () => {
      const spec = isFunction(input.input)
        ? await (
            input.input as unknown as (
              options: TOptions
            ) => TSpec | Promise<TSpec>
          )(options)
        : input.input;

      const description =
        typeof configObject.meta?.description === "function"
          ? configObject.meta.description(spec, options)
          : await Promise.resolve(configObject.meta?.description);

      if (description) {
        context.logger.info(
          `Generating ${await Promise.resolve(description)}...`
        );
      }

      const result = await output.output(spec, options);
      if (!context.settings.skipStorage) {
        await engine.store({
          documents: [],
          meta: {
            id: uuid(),
            executedAt: new Date(),
            executedBy: context.settings.userId
          }
        });
      }

      return result;
    });
  };

  return {
    meta: configObject.meta,
    schema,
    input,
    output,
    generate
  };
}
