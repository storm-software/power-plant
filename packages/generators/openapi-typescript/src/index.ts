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
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import schema from "@power-plant/openapi-schema";
import type { OpenAPI3, OpenAPITSOptions } from "openapi-typescript";
import openapiTS, { astToString } from "openapi-typescript";

export type Options = Omit<OpenAPITSOptions, "cwd"> & {
  /**
   * Path of the generated TypeScript file.
   *
   * @defaultValue `"api.ts"`
   */
  output?: string;
};

function convertToOpenAPI3(spec: OpenAPISchema): OpenAPI3 {
  const { servers, info, ...rest } = spec;

  return {
    ...rest,
    info: {
      ...info,
      license: info.license
        ? {
            name: info.license.name,
            url: info.license.url ?? "",
            identifier: info.license.identifier ?? ""
          }
        : undefined
    },
    servers: servers?.map(server => ({
      url: server.url,
      description: server.description ?? "",
      variables: server.variables ?? {}
    }))
  } as OpenAPI3;
}

/**
 * The OpenAPI TypeScript generator.
 *
 * Converts an OpenAPI schema into TypeScript types via `openapi-typescript`.
 *
 * @see https://openapi-ts.dev
 * @see https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-openapi/src/index.ts
 */
export default defineGenerator<OpenAPISchema, Options, void>({
  meta: {
    name: "openapi-typescript",
    title: "OpenAPI TypeScript",
    description:
      "A generator that uses openapi-typescript to generate TypeScript types from an OpenAPI schema.",
    version: "1.0",
    tags: ["openapi", "openapi-typescript"],
    links: [
      {
        href: "https://openapi-ts.dev",
        description: "OpenAPI TypeScript"
      },
      {
        href: "https://github.com/openapi-ts/openapi-typescript",
        description: "OpenAPI TypeScript GitHub Repository"
      },
      {
        href: "https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-openapi/src/index.ts",
        description: "Powerlines OpenAPI plugin"
      }
    ]
  },
  schema,
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<OpenAPISchema, Options>> => {
    const { cwd } = useExecution();
    const { output = "api.ts", ...openApiOptions } = options;

    const ast = await openapiTS(convertToOpenAPI3(spec), {
      ...openApiOptions,
      cwd
    });

    const content = astToString(ast, {
      fileName: output
    });

    return {
      [output]: {
        path: output,
        language: "typescript",
        chunks: [
          {
            content,
            meta: {
              name: "openapi-typescript"
            }
          }
        ]
      }
    };
  }
});
