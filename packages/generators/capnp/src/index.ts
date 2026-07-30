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

import type { CapnpSchema } from "@power-plant/capnp-schema";
import schema from "@power-plant/capnp-schema";
import type { GeneratorFunctionResult } from "@power-plant/core";
import { defineGenerator, useExecution } from "@power-plant/core";
import { capnpc } from "@stryke/capnp/compile";
import { resolveOptions } from "@stryke/capnp/helpers";
import type { CapnpcOptions } from "@stryke/capnp/types";
import { toArray } from "@stryke/convert/to-array";
import { joinPaths } from "@stryke/path/join-paths";
import { isString } from "@stryke/type-checks/is-string";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import packageJson from "../package.json";

export interface Options {
  /**
   * Cap'n Proto schema file paths or globs. When omitted, paths are taken from
   * the input {@link CapnpSchema} document.
   */
  schemas?: string | string[];

  /**
   * Directory where generated sources are written (and then collected).
   *
   * @defaultValue a temporary directory
   */
  output?: string;

  /**
   * Path to a TypeScript config used by `@stryke/capnp` `capnpc`.
   *
   * @defaultValue `tsconfig.json` under the execution cwd
   */
  tsconfigPath?: string;

  /**
   * Generate TypeScript sources.
   *
   * @defaultValue true
   */
  ts?: boolean;

  /**
   * Generate JavaScript sources.
   *
   * @defaultValue false
   */
  js?: boolean;

  /**
   * Generate declaration files.
   *
   * @defaultValue false
   */
  dts?: boolean;

  /**
   * Additional import search paths for the Cap'n Proto compiler.
   */
  importPath?: string | string[];

  /**
   * Skip generating a unique file id helper.
   */
  skipGenerateId?: boolean;

  /**
   * Skip the standard Cap'n Proto runtime import.
   */
  noStandardImport?: boolean;

  /**
   * Enable TTY-friendly compiler logging.
   *
   * @defaultValue false
   */
  tty?: boolean;
}

function toGeneratedFileEntries(
  files: Map<string, string> | Record<string, string>
): Array<[string, string]> {
  if (files instanceof Map) {
    return [...files.entries()];
  }

  return Object.entries(files);
}

function resolvePath(path: string, cwd: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

/**
 * The Cap'n Proto generator.
 *
 * Compiles `.capnp` schemas into source code via `@stryke/capnp` `capnpc`,
 * then returns the generated files as in-memory documents.
 *
 * @see https://capnproto.org/language.html
 * @see https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-capnp/src/index.ts
 */
export default defineGenerator<CapnpSchema, Options, void>({
  meta: {
    name: "capnp",
    title: "Cap'n Proto",
    description:
      "A generator that uses `@stryke/capnp` `capnpc` to compile Cap'n Proto schemas into TypeScript/JavaScript source code.",
    version: packageJson.version,
    tags: ["capnp", "capnproto", "capnpc"],
    links: [
      {
        href: "https://capnproto.org",
        description: "Cap'n Proto"
      },
      {
        href: "https://capnproto.org/capnp-tool.html",
        description: "The capnp Tool"
      },
      {
        href: "https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-capnp/src/index.ts",
        description: "Powerlines Cap'n Proto plugin"
      }
    ]
  },
  schema,
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<CapnpSchema, Options>> => {
    const { cwd } = useExecution();

    const schemaPaths = toArray(
      options.schemas ?? spec.files.map(file => file.path)
    )
      .filter(isString)
      .map(path => resolvePath(path, cwd));

    if (schemaPaths.length === 0) {
      throw new Error(
        "No Cap'n Proto schema paths provided. Pass `schemas` or load a CapnpSchema with file paths."
      );
    }

    const tsconfigPath = resolvePath(
      options.tsconfigPath ?? "tsconfig.json",
      cwd
    );

    const output =
      options.output != null
        ? resolvePath(options.output, cwd)
        : await mkdtemp(joinPaths(tmpdir(), "power-plant-capnp-gen-"));

    const capnpcOptions: Parameters<typeof resolveOptions>[0] = {
      schemas: schemaPaths,
      projectRoot: cwd,
      workspaceRoot: cwd,
      tsconfigPath,
      output,
      js: options.js ?? false,
      dts: options.dts ?? false,
      tty: options.tty ?? false,
      skipGenerateId: options.skipGenerateId,
      noStandardImport: options.noStandardImport,
      noTs: options.ts === false,
      importPath: options.importPath
        ? toArray(options.importPath).join(",")
        : undefined
    } satisfies CapnpcOptions & {
      schemas: string[];
      projectRoot: string;
      workspaceRoot: string;
      tsconfigPath: string;
    };

    const resolvedOptions = await resolveOptions(capnpcOptions);
    if (!resolvedOptions?.schemas?.length) {
      throw new Error(
        `No Cap'n Proto schemas found to compile: ${schemaPaths.join(", ")}`
      );
    }

    const result = await capnpc(resolvedOptions);
    const documents: GeneratorFunctionResult<CapnpSchema, Options> = {};

    for (const [filePath, content] of toGeneratedFileEntries(result.files)) {
      documents[filePath] = {
        path: filePath,
        language: filePath.endsWith(".ts")
          ? "typescript"
          : filePath.endsWith(".js")
            ? "javascript"
            : filePath.endsWith(".d.ts")
              ? "typescript"
              : undefined,
        chunks: [
          {
            content,
            meta: {
              name: "capnpc"
            }
          }
        ]
      };
    }

    return documents;
  }
});
