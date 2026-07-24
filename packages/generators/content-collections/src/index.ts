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

import type { AnyContent, Hooks } from "@content-collections/core";
import {
  createBuilder,
  createInternalBuilder,
  defineCollection
} from "@content-collections/core";
import type { GeneratorFunctionResult } from "@power-plant/core";
import { defineGenerator, useExecution } from "@power-plant/core";
import type { JsonSchema, SchemaEnvelope } from "@power-plant/schema";
import { isJsonSchema, isSchema, isStandardSchema } from "@power-plant/schema";
import { toZodSchema } from "@power-plant/schema/zod";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { isSetObject } from "@stryke/type-checks/is-set-object";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { existsSync } from "node:fs";
import { mkdtemp, readdir, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";

/**
 * Document schema accepted by the Content Collections generator.
 *
 * Prefer a Standard Schema (Zod, Valibot, …). JSON Schema and Power Plant
 * {@link SchemaEnvelope} values are converted via `toZodSchema`.
 */
export type ContentCollectionsSchema =
  StandardSchemaV1 | JsonSchema | SchemaEnvelope;

export type ContentParser =
  "frontmatter" | "json" | "yaml" | "frontmatter-only";

export interface Options {
  /**
   * Path to an existing `content-collections.ts` (or similar) config file.
   * When set, `@content-collections/core` `createBuilder` loads that file.
   */
  configPath?: string;

  /**
   * Collection name used with the provided document schema.
   * Required when `configPath` / `content` are not set.
   */
  name?: string;

  /**
   * Directory of content files relative to the execution cwd.
   * Required when `configPath` / `content` are not set.
   */
  directory?: string;

  /**
   * Glob(s) of files to include in the collection directory.
   * Required when `configPath` / `content` are not set.
   */
  include?: string | string[];

  /**
   * Glob(s) of files to exclude from the collection directory.
   */
  exclude?: string | string[];

  /**
   * Content file parser.
   *
   * @defaultValue `"frontmatter"`
   */
  parser?: ContentParser;

  /**
   * Generated TypeScript type name. Defaults from `name`.
   */
  typeName?: string;

  /**
   * Pre-built content collections / singletons (schemas already attached).
   * Used when generating without a config file or document schema `spec`.
   */
  content?: AnyContent[];

  /**
   * Output directory for generated data access modules.
   *
   * @defaultValue `<cwd>/.content-collections/generated`
   */
  outputDir?: string;

  /**
   * Cache directory used by `@content-collections/core`.
   *
   * @defaultValue `<cwd>/.content-collections/cache`
   */
  cacheDir?: string;

  /**
   * Compiled config module name used by the configuration reader.
   *
   * @defaultValue `"content-collection-config.mjs"`
   */
  configName?: string;

  /**
   * Optional writer / lifecycle hooks forwarded to Content Collections.
   */
  hooks?: Hooks;

  /**
   * When false, skip generating `index.d.ts` for programmatic builds.
   *
   * @defaultValue `true` when `configPath` exists on disk, otherwise `false`
   */
  generateTypes?: boolean;
}

type InternalConfiguration = Parameters<typeof createInternalBuilder>[0];

type BuilderOptions = Parameters<typeof createInternalBuilder>[2] & {
  outputDir?: string;
};

type Emitter = Parameters<typeof createInternalBuilder>[3];

function resolvePath(path: string, cwd: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

function createLocalEmitter(): Emitter {
  const emitter = new EventEmitter();

  return {
    on(key: string, listener: (event: object) => void) {
      emitter.on(key, listener);
    },
    emit(key: string, event: object) {
      emitter.emit(key, event);

      if (
        isSetObject(event) &&
        "error" in event &&
        (event as { error?: unknown }).error instanceof Error
      ) {
        emitter.emit("_error", { ...event, _event: key });
      }

      emitter.emit("_all", { ...event, _event: key });
    }
  };
}

function toDocumentSchema(spec: ContentCollectionsSchema): StandardSchemaV1 {
  if (isStandardSchema(spec)) {
    return spec;
  }

  if (isSchema(spec) || isJsonSchema(spec)) {
    return toZodSchema(spec);
  }

  throw new TypeError(
    "Invalid Content Collections schema. Provide a Standard Schema, JSON Schema, or SchemaEnvelope."
  );
}

async function collectGeneratedFiles(
  root: string,
  base = root
): Promise<Array<{ path: string; content: string }>> {
  if (!existsSync(root)) {
    return [];
  }

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

function toDocuments(
  files: Array<{ path: string; content: string }>
): GeneratorFunctionResult<ContentCollectionsSchema, Options> {
  return files.reduce(
    (documents, file) => {
      const path = file.path || "index.js";
      documents[path] = {
        path,
        language: path.endsWith(".d.ts")
          ? "typescript"
          : path.endsWith(".js") ||
              path.endsWith(".cjs") ||
              path.endsWith(".mjs")
            ? "javascript"
            : undefined,
        chunks: [
          {
            content: file.content,
            meta: {
              name: "content-collections"
            }
          }
        ]
      };

      return documents;
    },
    {} as GeneratorFunctionResult<ContentCollectionsSchema, Options>
  );
}

function resolveOutputDirectory(cwd: string, outputDir?: string): string {
  return outputDir
    ? resolvePath(outputDir, cwd)
    : join(cwd, ".content-collections", "generated");
}

function resolveCacheDirectory(cwd: string, cacheDir?: string): string {
  return cacheDir
    ? resolvePath(cacheDir, cwd)
    : join(cwd, ".content-collections", "cache");
}

function assertCollectionOptions(options: Options): {
  name: string;
  directory: string;
  include: string | string[];
} {
  if (
    !isSetString(options.name) ||
    !isSetString(options.directory) ||
    options.include == null
  ) {
    throw new Error(
      "Content Collections generator requires `name`, `directory`, and `include` when `configPath` / `content` are not provided."
    );
  }

  return {
    name: options.name,
    directory: options.directory,
    include: options.include
  };
}

/**
 * The Content Collections generator.
 *
 * Passes the provided document schema to `@content-collections/core`
 * `defineCollection` / `createBuilder`, then returns generated data access
 * modules (`allPosts`, `index.js`, …) as in-memory documents.
 *
 * @see https://www.content-collections.dev
 * @see https://www.content-collections.dev/docs/configuration
 */
export default defineGenerator<ContentCollectionsSchema, Options, void>({
  meta: {
    name: "content-collections",
    title: "Content Collections",
    description:
      "A generator that uses @content-collections/core to validate content files and generate type-safe data access hooks.",
    version: "1.0",
    tags: ["content-collections", "markdown", "mdx"],
    links: [
      {
        href: "https://www.content-collections.dev",
        description: "Content Collections"
      },
      {
        href: "https://www.content-collections.dev/docs/configuration",
        description: "Content Collections Configuration"
      },
      {
        href: "https://github.com/sdorra/content-collections",
        description: "Content Collections GitHub Repository"
      }
    ]
  },
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<ContentCollectionsSchema, Options>> => {
    const { cwd } = useExecution();
    const outputDirectory = resolveOutputDirectory(cwd, options.outputDir);
    const cacheDirectory = resolveCacheDirectory(cwd, options.cacheDir);
    const configName = options.configName ?? "content-collection-config.mjs";
    const builderOptions: BuilderOptions = {
      configName,
      cacheDir: cacheDirectory,
      outputDir: outputDirectory
    };

    if (isSetString(options.configPath)) {
      const configurationPath = resolvePath(options.configPath, cwd);
      const builder = await createBuilder(configurationPath, builderOptions);
      await builder.build();
      return toDocuments(await collectGeneratedFiles(outputDirectory));
    }

    const collections: AnyContent[] = options.content ?? [
      defineCollection({
        ...assertCollectionOptions(options),
        exclude: options.exclude,
        parser: options.parser,
        typeName: options.typeName,
        schema: toDocumentSchema(spec)
      })
    ];

    if (collections.length === 0) {
      throw new Error(
        "Content Collections generator requires at least one collection via `content`, `configPath`, or schema + collection options."
      );
    }

    const configurationPath = join(
      await mkdtemp(join(tmpdir(), "power-plant-content-collections-")),
      "content-collections.ts"
    );

    const checksum = createHash("sha256")
      .update(
        JSON.stringify({
          names: collections.map(collection => collection.name),
          outputDirectory,
          cacheDirectory
        })
      )
      .digest("hex");

    const configuration = {
      collections,
      path: configurationPath,
      inputPaths: [],
      checksum,
      hooks: options.hooks ?? {},
      generateTypes: options.generateTypes ?? false
    } satisfies InternalConfiguration;

    const builder = await createInternalBuilder(
      configuration,
      cwd,
      builderOptions,
      createLocalEmitter()
    );

    await builder.build();
    return toDocuments(await collectGeneratedFiles(outputDirectory));
  }
});
