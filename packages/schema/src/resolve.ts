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

import { extractFileReference } from "@stryke/convert/extract-file-reference";
import { findFileDotExtension, findFileExtensionSafe } from "@stryke/path/find";
import { isSetString } from "@stryke/type-checks/is-set-string";
import type { FileReferenceInput } from "@stryke/types/configuration";
import { createJiti } from "jiti";
import { readFile } from "node:fs/promises";
import { parse as parseToml } from "smol-toml";
import { createGenerator } from "ts-json-schema-generator/dist/factory/generator.js";
import type { Config as TsJsonSchemaGeneratorConfig } from "ts-json-schema-generator/dist/src/Config.js";
import { parse as parseYaml } from "yaml";
import type { BundleOptions } from "./bundle";
import { bundle } from "./bundle";
import type { JsonSchema } from "./types";

export interface ResolveOptions
  extends BundleOptions, Partial<TsJsonSchemaGeneratorConfig> {
  tsconfig?: string;
}

/**
 * Compiles a type definition to a module and returns the module.
 *
 * @param input - The type definition to compile. This can be either a string or a {@link FileReference} object.
 * @param options - Optional overrides for the ESBuild configuration.
 * @returns A promise that resolves to the compiled module.
 */
export async function resolveModule<TResult>(
  input: FileReferenceInput,
  options: BundleOptions = {}
): Promise<TResult> {
  const fileReference = extractFileReference(input);
  if (!fileReference) {
    throw new Error(
      `Failed to extract a file reference from the provided input ${JSON.stringify(
        input
      )}. The input must be a string or an object with a "file" property that specifies the file path and optional export name.`
    );
  }

  const result = await bundle(fileReference.file, options);

  let resolved: any;
  try {
    const jiti = createJiti(process.cwd());
    resolved = await jiti.evalModule(result.text, {
      filename: result.path,
      ext: findFileDotExtension(result.path)
    });
  } catch (error) {
    throw new Error(
      `Failed to evaluate the bundled module for "${
        fileReference.file
      }". Error: ${(error as Error).message}${
        options.debug
          ? `\n\nBundle output for module: \n${
              result.text && result.text.length > 50_000
                ? `${result.text.slice(0, 50_000)}\n... [truncated]`
                : result.text
            }`
          : ""
      }`
    );
  }

  return resolved;
}

/**
 * Resolves a type definition to a JSON Schema. This function passes the provided file reference to ts-json-schema-generator, using the referenced export name as the target type when one is provided.
 *
 * @param input - The type definition to compile. This can be either a string or a {@link FileReference} object.
 * @param options - Optional overrides reserved for API compatibility.
 * @returns A promise that resolves to the generated JSON Schema.
 */
export async function resolveTSType(
  input: FileReferenceInput,
  options: ResolveOptions = {}
): Promise<JsonSchema> {
  const fileReference = extractFileReference(input);
  if (!fileReference) {
    throw new Error(
      `Failed to extract a file reference from the provided input. The input must be a string or an object with a "file" property that specifies the file path and optional export name.`
    );
  }

  const exportName = fileReference.export ?? "*";

  try {
    const generatorConfig: TsJsonSchemaGeneratorConfig = {
      path: fileReference.file,
      type: exportName,
      expose: "export",
      jsDoc: "extended",
      ...options
    };

    const generator = createGenerator(generatorConfig);

    return generator.createSchema(exportName) as JsonSchema;
  } catch (error) {
    throw new Error(
      `Failed to generate a JSON schema for "${fileReference.file}" using the type "${exportName}". Error: ${(error as Error).message}`
    );
  }
}

/**
 * Compiles a type definition to a module and returns the specified export from the module.
 *
 * @param input - The type definition to compile. This can be either a string or a {@link FileReference} object.
 * @param options - Optional overrides for the ESBuild configuration.
 * @returns A promise that resolves to the compiled module.
 */
export async function resolve<TResult>(
  input: FileReferenceInput,
  options?: ResolveOptions
): Promise<TResult | undefined> {
  const fileReference = extractFileReference(input);
  if (!fileReference) {
    throw new Error(
      `Failed to extract a file reference from the provided input. The input must be a string or an object with a "file" property that specifies the file path and optional export name.`
    );
  }

  const extension = findFileExtensionSafe(fileReference.file);
  if (extension.startsWith("json")) {
    // Parse JSON files directly without bundling, as they are already in a compatible format.
    try {
      const json = await readFile(fileReference.file, "utf8");
      if (!isSetString(json)) {
        throw new Error(
          `The file at "${fileReference.file}" could not be read as a string. Please ensure the file exists and contains valid JSON.`
        );
      }

      return JSON.parse(json);
    } catch (error) {
      throw new Error(
        `Failed to read or parse the JSON file at "${fileReference.file}". Please ensure the file exists and contains valid JSON. Error: ${(error as Error).message}`
      );
    }
  } else if (extension === "yaml" || extension === "yml") {
    // Parse YAML files directly without bundling, as they are already in a compatible format.
    try {
      const yaml = await readFile(fileReference.file, "utf8");
      if (!isSetString(yaml)) {
        throw new Error(
          `The file at "${fileReference.file}" could not be read as a string. Please ensure the file exists and contains valid YAML.`
        );
      }

      return parseYaml(yaml) as TResult;
    } catch (error) {
      throw new Error(
        `Failed to read or parse the YAML file at "${fileReference.file}". Please ensure the file exists and contains valid YAML. Error: ${(error as Error).message}`
      );
    }
  } else if (extension === "toml") {
    // Parse TOML files directly without bundling, as they are already in a compatible format.
    try {
      const toml = await readFile(fileReference.file, "utf8");
      if (!isSetString(toml)) {
        throw new Error(
          `The file at "${fileReference.file}" could not be read as a string. Please ensure the file exists and contains valid TOML.`
        );
      }

      return parseToml(toml) as TResult;
    } catch (error) {
      throw new Error(
        `Failed to read or parse the TOML file at "${fileReference.file}". Please ensure the file exists and contains valid TOML. Error: ${(error as Error).message}`
      );
    }
  }

  const resolved = await resolveModule<Record<string, any>>(
    fileReference,
    options
  );

  let exportName = fileReference.export;
  if (!exportName) {
    exportName = "default";
  }

  const resolvedExport = resolved[exportName] ?? resolved[`__Ω${exportName}`];
  if (resolvedExport === undefined) {
    throw new Error(
      `The export "${exportName}" could not be resolved in the "${
        fileReference.file
      }" module. ${
        Object.keys(resolved).length === 0
          ? `After bundling, no exports were found in the module. Please ensure that the "${
              fileReference.file
            }" module has a "${exportName}" export with the desired value.`
          : `After bundling, the available exports were: ${Object.keys(
              resolved
            ).join(
              ", "
            )}. Please ensure that the export exists and is correctly named.`
      }`
    );
  }

  return resolvedExport;
}

/**
 * Safely compiles a type definition to a module and returns the specified export from the module.
 *
 * @param input - The type definition to compile. This can be either a string or a {@link FileReference} object.
 * @param options - Optional overrides for the ESBuild configuration.
 * @returns A promise that resolves to the compiled module.
 */
export async function resolveSafe<TResult>(
  input: FileReferenceInput,
  options?: ResolveOptions
): Promise<TResult | undefined> {
  try {
    return await resolve<TResult>(input, options);
  } catch {
    return undefined;
  }
}
