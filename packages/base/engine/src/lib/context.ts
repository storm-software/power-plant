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
  ExecutionDocument,
  Input,
  Logger,
  Output,
  SchemaOf,
  SessionContext,
  Settings,
  UserConfig
} from "@power-plant/core";
import type { Unstable_ExecutionContext } from "@power-plant/core/types/__internal";
import { getEnvPaths } from "@stryke/env/get-env-paths";
import { readFileIfExisting } from "@stryke/fs/read-file";
import { joinPaths } from "@stryke/path/join-paths";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { uuid } from "@stryke/unique-id/uuid";
import defu from "defu";
import os from "node:os";
import { createStorage } from "unstorage";
import fsLite from "unstorage/drivers/fs-lite";
import type { LocalStore } from "../types/local-store";

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

/**
 * Create a session context for the engine.
 *
 * @param session - The session for the context.
 * @param userConfig - The user configuration.
 * @returns A session context.
 */
export async function createSessionContext(
  userConfig: UserConfig = {}
): Promise<SessionContext> {
  const cwd = userConfig.cwd || process.cwd();
  const now = new Date();

  const storage = createStorage({
    driver: fsLite({
      base: cwd
    })
  });

  const store = JSON.parse(
    (await readFileIfExisting(joinPaths(paths.data, ".local-store.json"))) ||
      "{}"
  ) as LocalStore;

  const device = store.device ?? os.hostname();
  const user = store.user ?? os.userInfo().username;

  return defu(
    {
      cwd,
      session: {
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        device,
        user,
        executions: []
      }
    },
    userConfig,
    {
      storage,
      settings: {} as Settings,
      logger
    }
  );
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
  schema: SchemaOf<TSpec>,
  input: Input<TSpec, TOptions>,
  output: Output<TSpec, TOptions, TReturns>
): Promise<Unstable_ExecutionContext<TSpec, TOptions, TReturns>> {
  const documents: Record<string, ExecutionDocument> = {};
  const addDocument = (
    pathOrDocument: string | ExecutionDocument,
    document?: Omit<ExecutionDocument, "path">
  ) => {
    if (isSetString(pathOrDocument)) {
      documents[pathOrDocument] = defu(
        {
          path: pathOrDocument
        },
        document,
        {
          chunks: [],
          meta: {}
        }
      );
    } else {
      documents[pathOrDocument.path] = defu(pathOrDocument, document);
    }
  };

  let specValue: TSpec | undefined;

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
      if (!specValue) {
        throw new Error(
          "The specification was accessed prior to the input processing."
        );
      }

      return specValue;
    },
    addDocument,
    meta: {
      id: executionId,
      executedAt: new Date(),
      executedBy: ""
    }
  } as unknown as Unstable_ExecutionContext<TSpec, TOptions, TReturns> & {
    "~spec"?: TSpec;
  };

  Object.defineProperty(context, "~spec", {
    get() {
      return specValue;
    },
    set(value: TSpec) {
      specValue = value;
    },
    enumerable: false
  });

  return context;
}
