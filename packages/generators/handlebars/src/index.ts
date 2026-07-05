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
import { defineGenerator, useExecutionContext } from "@power-plant/core";
import packageJson from "../package.json" with { type: "json" };
import { appendPath } from "@stryke/path/append";
import Handlebars from "handlebars";

export interface Options extends RuntimeOptions {
  template: string;
  outputFile: string;
}

/**
 * The Handlebars generator.
 *
 * @see https://handlebarsjs.com/guide/
 *
 * @param spec - The specification to generate code for.
 * @param options - The options for the generator.
 * @returns A promise that resolves to the generated code.
 */
export default defineGenerator<any, Options, void>({
  meta: {
    name: "handlebars",
    description:
      "A generator that uses Handlebars to generate source code from a specification.",
    version: packageJson.version,
    tags: ["handlebars"],
    links: [
      {
        description: "Handlebars Repository",
        href: "https://github.com/handlebars-lang/handlebars.js"
      },
      {
        description: "Handlebars Documentation",
        href: "https://handlebarsjs.com/guide/"
      }
    ]
  },
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<any, Options>> => {
    const { template, outputFile, ...rest } = options;

    const { cwd } = useExecutionContext();

    const compiledTemplate = Handlebars.compile(template, rest);
    const content = compiledTemplate(spec);

    return {
      [outputFile]: {
        path: appendPath(outputFile, cwd),
        source: [
          {
            content,
            meta: {}
          }
        ]
      }
    };
  }
});
