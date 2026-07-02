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
  ExecutionContext,
  Input,
  Logger,
  Output,
  SchemaOf,
  SessionContext,
  UserConfig,
  UserConfigExport
} from "@power-plant/core";
import { toArray } from "@stryke/convert/to-array";
import { toMode } from "@stryke/env/environment-checks";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { readFileIfExisting } from "@stryke/fs/read-file";
import { writeFile } from "@stryke/fs/write-file";
import { joinPaths } from "@stryke/path/join";
import { isFunction } from "@stryke/type-checks/is-function";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { uuid } from "@stryke/unique-id/uuid";
import { loadConfig } from "c12";
import defu from "defu";
import { createJiti } from "jiti";
import * as fs from "node:fs";
import { existsSync } from "node:fs";
import os from "node:os";

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
export async function createSessionContext(
  userConfig: UserConfig = {}
): Promise<SessionContext> {
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

  const context = defu(
    {
      cwd,
      executions: [] as any[],
      sessionId: uuid(),
      startedAt: new Date(),
      deviceId: null as string | null,
      userId: null as string | null,
      tenantId: null as string | null
    },
    userConfig,
    ...projectConfig,
    {
      settings,
      fs,
      logger
    },
    config1,
    config2,
    config3,
    config4,
    config5,
    config6,
    config7,
    config8
  ) as SessionContext;

  const ids = JSON.parse(
    (await readFileIfExisting(joinPaths(cwd, ".id-store.json"))) || "{}"
  ) as { deviceId?: string; userId?: string; tenantId?: string };

  context.deviceId = ids.deviceId || uuid();
  context.userId = context.settings.userId || ids.userId || uuid();
  context.tenantId = context.settings.tenantId || ids.tenantId || uuid();

  if (!ids.deviceId || !ids.userId || !ids.tenantId) {
    await writeFile(
      joinPaths(cwd, ".id-store.json"),
      JSON.stringify(
        {
          deviceId: ids.deviceId || context.deviceId,
          userId: ids.userId || context.userId,
          tenantId: ids.tenantId || context.tenantId
        },
        null,
        2
      )
    );
  }

  return context;
}

export async function createExecutionContext<
  TSpec,
  TOptions extends object,
  TReturns = void
>(
  executionId: string,
  context: SessionContext,
  options: TOptions,
  schema: SchemaOf<TSpec, TOptions>,
  input: Input<TSpec, TOptions>,
  output: Output<TSpec, TOptions, TReturns>
): Promise<ExecutionContext<TSpec, TOptions, TReturns>> {
  const executionContext = {
    meta: {
      id: executionId,
      executedAt: new Date(),
      executedBy: context.userId
    },
    documents: [],
    ...context,
    options,
    schema,
    input,
    output
  };

  context.executions.push({
    documents: executionContext.documents,
    meta: executionContext.meta
  });

  return executionContext;
}
