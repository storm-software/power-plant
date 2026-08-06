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

import type { Options } from "@power-plant/alloy-js";
import { render } from "@power-plant/alloy-js/render";
import type { GeneratorFunctionResult, OutputConfig } from "@power-plant/core";
import { defineGenerator, execute } from "@power-plant/core";
import noop from "@power-plant/noop-output";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import schema from "@power-plant/openapi-schema";
import packageJson from "../package.json";

export type * from "./types";

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
    name: "openapi",
    title: "OpenAPI",
    description:
      "A generator that uses alloy-js to generate files from an OpenAPI schema.",
    version: packageJson.version,
    tags: ["openapi", "alloy-js"],
    links: [
      {
        href: "https://swagger.io/specification/",
        description: "OpenAPI Specification"
      },
      {
        href: "https://alloy-js.dev",
        description: "Alloy-JS"
      }
    ]
  },
  schema,
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<OpenAPISchema, Options>> => {
    const { template, ...rest } = options;

    return execute<OpenAPISchema, Options, any>(
      {
        output: noop as OutputConfig<OpenAPISchema, Options, any>,
        ...rest,
        generator: async (): Promise<
          GeneratorFunctionResult<OpenAPISchema, Options>
        > => {
          return render<OpenAPISchema, Options, any>(template);
        }
      },
      options
    );
  }
});
