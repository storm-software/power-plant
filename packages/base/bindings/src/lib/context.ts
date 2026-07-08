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
  Context,
  ExecutionDocument,
  Input,
  Logger,
  Output,
  SchemaOf,
  SessionContext,
  UserConfig,
  UserConfigExport
} from "@power-plant/core";
import type { Unstable_ExecutionContext } from "@power-plant/core/types/__internal";
import { toArray } from "@stryke/convert/to-array";
import { toMode } from "@stryke/env/environment-checks";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { readFileIfExisting } from "@stryke/fs/read-file";
import { joinPaths } from "@stryke/path/join";
import { isFunction } from "@stryke/type-checks/is-function";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { loadConfig } from "c12";
import defu from "defu";
import { createJiti } from "jiti";
import { existsSync } from "node:fs";
import os from "node:os";
import { createStorage } from "unstorage";
import fsLite from "unstorage/drivers/fs-lite";

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

/**
 * Create a context for the engine.
 *
 * @param userConfig - The user configuration.
 * @returns A promise that resolves to a context.
 */
export async function createContext(
  userConfig: UserConfig = {}
): Promise<Context> {
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

  const configFile = existsSync(joinPaths(cwd, `power-plant.${mode}.config.ts`))
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

  const storage = createStorage({
    driver: fsLite({
      base: cwd
    })
  });

  return defu(
    {
      cwd
    },
    userConfig,
    ...projectConfig,
    {
      settings,
      logger
    },
    config1,
    config2,
    config3,
    config4,
    config5,
    config6,
    config7,
    config8,
    {
      storage
    }
  ) as Context;
}

/**
 * Create an execution context for the engine.
 *
 * @param executionId - The ID of the execution.
 * @param sessionContext - The session context.
 * @param options - The options.
 * @param schema - The schema.
 * @param input - The input.
 * @param output - The output.
 * @returns A promise that resolves to an execution context.
 */
export async function createExecutionContext<
  TSpec,
  TOptions extends object,
  TReturns = void
>(
  executionId: string,
  sessionContext: SessionContext,
  options: TOptions,
  schema: SchemaOf<TSpec, TOptions>,
  input: Input<TSpec, TOptions>,
  output: Output<TSpec, TOptions, TReturns>
): Promise<Unstable_ExecutionContext<TSpec, TOptions, TReturns>> {
  const documents: Record<string, ExecutionDocument<TSpec, TOptions>> = {};
  const addDocument = (
    pathOrDocument: string | ExecutionDocument<TSpec, TOptions>,
    document?: Omit<ExecutionDocument<TSpec, TOptions>, "path">
  ) => {
    if (isSetString(pathOrDocument)) {
      documents[pathOrDocument] = defu(
        {
          path: pathOrDocument
        },
        document,
        {
          source: []
        }
      );
    } else {
      documents[pathOrDocument.path] = defu(pathOrDocument, document);
    }
  };

  const context = {
    ...sessionContext,
    id: executionId,
    createdAt: new Date(),
    updatedAt: new Date(),
    options,
    schema,
    input,
    output,
    documents,
    spec() {
      if (!this["~spec"]) {
        throw new Error(
          "The specification was accessed prior to the input processing."
        );
      }

      return this["~spec"] as TSpec;
    },
    addDocument,
    meta: {
      id: executionId,
      executedAt: new Date(),
      executedBy: ""
    }
  } as unknown as Unstable_ExecutionContext<TSpec, TOptions, TReturns>;

  return context;
}
