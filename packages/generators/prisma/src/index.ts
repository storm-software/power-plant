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

import type { GeneratorFunctionResult } from "@power-plant/core";
import { defineGenerator, useExecution } from "@power-plant/core";
import type { PrismaSchema } from "@power-plant/prisma-schema";
import schema from "@power-plant/prisma-schema";
import { defaultRegistry } from "@prisma/client-generator-registry";
import { enginesVersion } from "@prisma/engines";
import type { Generator } from "@prisma/internals";
import prismaInternals from "@prisma/internals";
import { readdir, readFile, stat } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";

const { getGenerators, parseEnvValue } = prismaInternals;

export interface Options {
  /**
   * Path to the Prisma schema file (or directory) used by `getGenerators`.
   */
  schemaPath: string;

  /**
   * When true, print Prisma engine download progress.
   *
   * @defaultValue true
   */
  printDownloadProgress?: boolean;

  /**
   * Allow generation when the schema has no models.
   *
   * @defaultValue true
   */
  allowNoModels?: boolean;

  /**
   * Optional subset of generator block names to run.
   */
  generatorNames?: string[];

  /**
   * Skip downloading Prisma engines.
   */
  skipDownload?: boolean;
}

async function collectGeneratedFiles(
  root: string,
  base = root
): Promise<Array<{ path: string; content: string }>> {
  const info = await stat(root);
  if (info.isFile()) {
    return [
      {
        path: relative(base, root) || root,
        content: await readFile(root, "utf8")
      }
    ];
  }

  if (!info.isDirectory()) {
    return [];
  }

  const entries = await readdir(root, { withFileTypes: true });
  const files: Array<{ path: string; content: string }> = [];

  for (const entry of entries) {
    const child = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectGeneratedFiles(child, base)));
    } else if (entry.isFile()) {
      files.push({
        path: relative(base, child),
        content: await readFile(child, "utf8")
      });
    }
  }

  return files;
}

function resolveSchemaPath(schemaPath: string, cwd: string): string {
  return isAbsolute(schemaPath) ? schemaPath : resolve(cwd, schemaPath);
}

/**
 * The Prisma generator.
 *
 * Runs Prisma generators defined in a `schema.prisma` file via
 * `@prisma/internals` `getGenerators`, then returns the generated files
 * as in-memory documents.
 *
 * @see https://www.prisma.io/docs/orm/prisma-schema/overview/generators
 * @see https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-prisma/src/index.ts
 */
export default defineGenerator<PrismaSchema, Options, void>({
  meta: {
    name: "prisma",
    title: "Prisma",
    description:
      "A generator that uses `@prisma/internals` to run Prisma schema generators (including Prisma Client).",
    version: "1.0",
    tags: ["prisma", "dmmf"],
    links: [
      {
        href: "https://www.prisma.io",
        description: "Prisma"
      },
      {
        href: "https://www.prisma.io/docs/orm/prisma-schema/overview/generators",
        description: "Prisma Generators"
      },
      {
        href: "https://github.com/prisma/prisma",
        description: "Prisma GitHub Repository"
      }
    ]
  },
  schema,
  generator: async (
    _spec,
    options
  ): Promise<GeneratorFunctionResult<PrismaSchema, Options>> => {
    const { cwd } = useExecution();
    const schemaPath = resolveSchemaPath(options.schemaPath, cwd);

    let generators: Generator[] = [];

    try {
      generators = await getGenerators({
        schemaPath,
        printDownloadProgress: options.printDownloadProgress ?? true,
        version: enginesVersion,
        allowNoModels: options.allowNoModels ?? true,
        generatorNames: options.generatorNames,
        skipDownload: options.skipDownload,
        registry: defaultRegistry.toInternal()
      });

      const documents: GeneratorFunctionResult<PrismaSchema, Options> = {};

      for (const generator of generators) {
        const provider =
          generator.options?.generator.provider != null
            ? parseEnvValue(generator.options.generator.provider)
            : "unknown";

        try {
          await generator.generate();

          const outputValue = generator.options?.generator.output?.value;
          if (!outputValue) {
            continue;
          }

          const generatedFiles = await collectGeneratedFiles(outputValue);
          for (const file of generatedFiles) {
            const path = file.path || `${provider}.output`;
            documents[path] = {
              path,
              chunks: [
                {
                  content: file.content,
                  meta: {
                    name: provider
                  }
                }
              ]
            };
          }
        } catch (error) {
          throw new Error(
            `Error while generating with ${provider}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        } finally {
          generator.stop();
        }
      }

      return documents;
    } catch (error) {
      for (const generator of generators) {
        generator.stop();
      }

      throw error;
    }
  }
});
