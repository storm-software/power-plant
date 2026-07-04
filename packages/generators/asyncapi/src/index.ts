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

import type {
  GeneratorOptions,
  GeneratorParseOptions
} from "@asyncapi/generator";
import { Generator } from "@asyncapi/generator";
import type { AsyncAPIDocumentInterface } from "@asyncapi/parser";
import { isAsyncAPIDocument } from "@asyncapi/parser/esm/document";
import schema from "@power-plant/asyncapi-schema";
import type { SchemaConfigObject } from "@power-plant/core";
import { defineGenerator, useContext } from "@power-plant/core";
import packageJson from "../package.json" with { type: "json" };

export interface Options extends GeneratorOptions {
  templateName: string;
  outputPath: string;
}

export default defineGenerator<AsyncAPIDocumentInterface, Options, void>({
  meta: {
    name: "asyncapi",
    title: "AsyncAPI",
    description:
      "A generator that uses the AsyncAPI specification to generate event-driven client SDKs and servers using @asyncapi/generator.",
    version: packageJson.version,
    tags: ["asyncapi"],
    links: [
      {
        href: "https://www.asyncapi.com",
        description: "AsyncAPI Documentation"
      },
      {
        href: "https://github.com/asyncapi/generator",
        description: "AsyncAPI GitHub Repository"
      }
    ]
  },
  schema: schema as SchemaConfigObject<AsyncAPIDocumentInterface>,
  generator: async (spec, options) => {
    const { templateName, outputPath, ...rest } = options;
    const { cwd } = useContext();

    if (!isAsyncAPIDocument(spec)) {
      throw new Error("Invalid AsyncAPI schema");
    }

    const generatorOptions: GeneratorParseOptions = {
      ...rest,
      output: "string"
    };
    const generator = new Generator(
      templateName,
      outputPath || cwd,
      generatorOptions
    );

    generator.validateAsyncAPIDocument(spec);
    await generator.setupOutput();
    generator.setLogLevel();

    await generator.installAndSetupTemplate();
    await generator.configureTemplateWorkflow(generatorOptions);
    await generator.handleEntrypoint();
    await generator.executeAfterHook();

    return {};
  }
});
