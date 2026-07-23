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

import { useExecution } from "@power-plant/core";
import type { PrismaSchema } from "@power-plant/prisma-schema";
import prismaInternals from "@prisma/internals";
import { toArray } from "@stryke/convert/to-array";
import { joinPaths } from "@stryke/path/join-paths";
import { glob, readdir, readFile, stat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import type { Options } from "./types";
import {
  formatLoadError,
  normalizeInputPaths,
  toAbsolutePath,
  toSchemaFiles
} from "./utilities";

const { getDMMF } = prismaInternals;

async function collectPrismaFiles(
  reference: string,
  cwd: string
): Promise<string[]> {
  const absolute = toAbsolutePath(reference, cwd);
  const hasGlob = absolute.includes("*") || absolute.includes("?");

  if (hasGlob) {
    const matched: string[] = [];
    for await (const entry of glob(absolute)) {
      if (entry.endsWith(".prisma")) {
        matched.push(isAbsolute(entry) ? entry : resolve(cwd, entry));
      }
    }

    return matched;
  }

  const info = await stat(absolute);
  if (info.isFile()) {
    return [absolute];
  }

  if (info.isDirectory()) {
    const entries = await readdir(absolute, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const child = joinPaths(absolute, entry.name);
      if (entry.isFile() && entry.name.endsWith(".prisma")) {
        files.push(child);
      } else if (entry.isDirectory() && entry.name !== "node_modules") {
        files.push(...(await collectPrismaFiles(child, cwd)));
      }
    }

    return files;
  }

  return [];
}

/**
 * Loads Prisma schema files and converts them into a DMMF document via
 * `@prisma/internals` `getDMMF`.
 *
 * @see https://www.prisma.io/docs/orm/prisma-schema
 * @see https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-prisma/src/index.ts
 *
 * @param options - The options for the input.
 * @returns A validated {@link PrismaSchema} DMMF document.
 */
export async function input(options: Options): Promise<PrismaSchema> {
  const { inputPath } = options;
  const { cwd } = useExecution();

  try {
    const references = normalizeInputPaths(inputPath);
    const schemaPaths = (
      await Promise.all(
        references.map(async reference => collectPrismaFiles(reference, cwd))
      )
    ).flat();

    const uniquePaths = [...new Set(schemaPaths)];
    if (uniquePaths.length === 0) {
      throw new Error(
        `No Prisma schema files found for inputPath: ${toArray(inputPath)
          .map(String)
          .join(", ")}`
      );
    }

    const contents = new Map<string, string>();
    await Promise.all(
      uniquePaths.map(async path => {
        contents.set(path, await readFile(path, "utf8"));
      })
    );

    const schemaFiles = toSchemaFiles(uniquePaths, contents);

    return (await getDMMF({
      datamodel: schemaFiles
    })) as PrismaSchema;
  } catch (error) {
    throw new Error(
      [
        `Failed to load Prisma schema from ${toArray(inputPath)
          .map(String)
          .join(", ")}:`,
        formatLoadError(error),
        "",
        "Supported schema sources include:",
        "- Local `.prisma` files",
        "- Directories containing `.prisma` files",
        "- Glob expressions matching `.prisma` files"
      ].join("\n")
    );
  }
}
