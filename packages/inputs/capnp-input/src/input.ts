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
import { useExecution } from "@power-plant/core";
import { capnpc } from "@stryke/capnp/compile";
import { resolveOptions } from "@stryke/capnp/helpers";
import { toArray } from "@stryke/convert/to-array";
import { joinPaths } from "@stryke/path/join-paths";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import type { Options } from "./types";
import {
  formatLoadError,
  normalizeInputPaths,
  toAbsolutePath,
  toCapnpSchema
} from "./utilities";

async function collectCapnpFiles(
  reference: string,
  cwd: string
): Promise<string[]> {
  const absolute = toAbsolutePath(reference, cwd);
  const hasGlob = absolute.includes("*") || absolute.includes("?");

  if (hasGlob) {
    const { glob } = await import("node:fs/promises");
    const matched: string[] = [];
    for await (const entry of glob(absolute)) {
      if (entry.endsWith(".capnp")) {
        matched.push(isAbsolute(entry) ? entry : resolve(cwd, entry));
      }
    }

    return matched;
  }

  const { readdir, stat } = await import("node:fs/promises");
  const info = await stat(absolute);
  if (info.isFile()) {
    return absolute.endsWith(".capnp") ? [absolute] : [];
  }

  if (info.isDirectory()) {
    const entries = await readdir(absolute, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const child = joinPaths(absolute, entry.name);
      if (entry.isFile() && entry.name.endsWith(".capnp")) {
        files.push(child);
      } else if (entry.isDirectory() && entry.name !== "node_modules") {
        files.push(...(await collectCapnpFiles(child, cwd)));
      }
    }

    return files;
  }

  return [];
}

/**
 * Loads Cap'n Proto schema files and converts them into a Cap'n Proto schema
 * document via `@stryke/capnp` `capnpc`.
 *
 * @see https://capnproto.org/language.html
 * @see https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-capnp/src/index.ts
 *
 * @param options - The options for the input.
 * @returns A validated {@link CapnpSchema} document.
 */
export async function input(options: Options): Promise<CapnpSchema> {
  const { inputPath, tsconfigPath, output, capnpc: capnpcOptions } = options;
  const { cwd } = useExecution();

  try {
    const references = normalizeInputPaths(inputPath);
    const schemaPaths = (
      await Promise.all(
        references.map(async reference => collectCapnpFiles(reference, cwd))
      )
    ).flat();

    const uniquePaths = [...new Set(schemaPaths)];
    if (uniquePaths.length === 0) {
      throw new Error(
        `No Cap'n Proto schema files found for inputPath: ${toArray(inputPath)
          .map(String)
          .join(", ")}`
      );
    }

    const resolvedTsconfigPath =
      tsconfigPath != null
        ? toAbsolutePath(tsconfigPath, cwd)
        : resolve(cwd, "tsconfig.json");

    const resolvedOutput =
      output != null
        ? toAbsolutePath(output, cwd)
        : await mkdtemp(joinPaths(tmpdir(), "power-plant-capnp-"));

    const resolvedOptions = await resolveOptions({
      ...capnpcOptions,
      schemas: uniquePaths,
      projectRoot: cwd,
      workspaceRoot: cwd,
      tsconfigPath: resolvedTsconfigPath,
      output: resolvedOutput,
      js: capnpcOptions?.js ?? false,
      dts: capnpcOptions?.dts ?? false,
      tty: capnpcOptions?.tty ?? false
    });

    if (!resolvedOptions?.schemas?.length) {
      throw new Error(
        `No Cap'n Proto schemas resolved for inputPath: ${uniquePaths.join(", ")}`
      );
    }

    const result = await capnpc(resolvedOptions);

    return toCapnpSchema(result);
  } catch (error) {
    throw new Error(
      [
        `Failed to load Cap'n Proto schema from ${toArray(inputPath)
          .map(String)
          .join(", ")}:`,
        formatLoadError(error),
        "",
        "Supported schema sources include:",
        "- Local `.capnp` files",
        "- Directories containing `.capnp` files",
        "- Glob expressions matching `.capnp` files"
      ].join("\n")
    );
  }
}
