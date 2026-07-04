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

import type { Children } from "@alloy-js/core";
import type { GeneratorFunctionResult } from "@power-plant/core";
import { defineGenerator, useExecutionContext } from "@power-plant/core";
import schema from "@power-plant/graphql-schema";
import packageJson from "../package.json" with { type: "json" };
import { render } from "./render";

/**
 * The options for the Alloy-js generator.
 */
export interface Options {
  template: Children;
}

/**
 * The Alloy-js generator.
 *
 * @see https://alloy-framework.github.io/alloy/guides/getting-started/
 *
 * @param spec - The specification to generate code for.
 * @param options - The options for the generator.
 * @returns A promise that resolves to the generated code.
 */
export default defineGenerator<any, Options, void>({
  meta: {
    name: "alloy-js",
    description:
      "A generator that uses Alloy-js to generate source code from a specification.",
    version: packageJson.version,
    tags: ["alloy-js"],
    links: [
      {
        description: "Alloy-js Repository",
        href: "https://github.com/alloy-framework/alloy"
      },
      {
        description: "Alloy-js Documentation",
        href: "https://alloy-framework.github.io/alloy/guides/getting-started/"
      }
    ]
  },
  schema,
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<any, Options>> => {
    const context = useExecutionContext();

    return render(context, spec, options.template);
  }
});
