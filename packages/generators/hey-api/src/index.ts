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

import type { UserConfig } from "@hey-api/openapi-ts";
import { createClient } from "@hey-api/openapi-ts";
import type { GeneratorFunctionResult } from "@power-plant/core";
import { defineGenerator, useExecution } from "@power-plant/core";
import type { OpenAPISchema } from "@power-plant/openapi-schema";
import schema from "@power-plant/openapi-schema";
import { toArray } from "@stryke/convert/to-array";
import type { Arrayable } from "@stryke/types/array";

export default defineGenerator<OpenAPISchema, Arrayable<UserConfig>, void>({
  meta: {
    name: "hey-api",
    title: "Hey API",
    description:
      "A generator that uses the OpenAPI specification to generate source code using Hey API.",
    version: "1.0",
    tags: ["openapi"],
    links: [
      {
        href: "https://heyapi.dev",
        description: "Hey API Documentation"
      },
      {
        href: "https://github.com/heyapi/heyapi",
        description: "Hey API GitHub Repository"
      }
    ]
  },
  schema,
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<OpenAPISchema, Arrayable<UserConfig>>> => {
    const { cwd } = useExecution();

    const context = await createClient(
      toArray(options).map(option => ({
        ...option,
        output: option.output ?? {
          path: cwd
        },
        input: spec
      }))
    );

    return context.reduce(
      (ret, c) => {
        c.gen.render().forEach(r => {
          ret[r.path] = {
            path: r.path,
            chunks: [
              {
                content: r.content
              }
            ]
          };
        });

        return ret;
      },
      {} as GeneratorFunctionResult<OpenAPISchema, Arrayable<UserConfig>>
    );
  }
});
