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

import { defineInput, useExecutionContext } from "@power-plant/core";
import { toZodSchema } from "@power-plant/schema/zod";
import { generateText, Output } from "ai";
import packageJson from "../package.json";

export type Options = Omit<Parameters<typeof generateText>[0], "output">;

export default defineInput<any, Options>({
  meta: {
    name: "ai-input",
    description:
      "An input extension that uses AI models to generate the input specification.",
    readFrom:
      "The response from AI model providers, such as OpenAI, Anthropic, and others.",
    version: packageJson.version,
    tags: ["ai"],
    links: [
      {
        href: "https://ai-sdk.dev",
        description: "AI SDK"
      },
      {
        href: "https://github.com/vercel/ai",
        description: "AI SDK - repository"
      }
    ]
  },
  input: async (options: Options): Promise<any> => {
    const { model, prompt, ...rest } = options;
    const { schema } = useExecutionContext();

    // Generate the specification using AI models
    const output = await generateText({
      ...rest,
      model,
      output: Output.object({
        name: schema.meta.name,
        description: schema.meta.description,
        schema: toZodSchema(schema.schema)
      }),
      prompt
    } as Parameters<typeof generateText>[0]);

    // Return the generated specification
    return output.text;
  }
});
