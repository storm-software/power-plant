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
  TemplateRenderResult
} from "@asyncapi/generator";
import { Generator } from "@asyncapi/generator";
import type { AsyncAPIDocumentInterface } from "@asyncapi/parser";
import { isAsyncAPIDocument } from "@asyncapi/parser/esm/document";
import schema from "@power-plant/asyncapi-schema";
import type {
  GeneratorFunctionResult,
  SchemaConfigObject
} from "@power-plant/core";
import { defineGenerator, useContext } from "@power-plant/core";

function toGeneratedDocuments(
  filePath: string,
  rendered: string | TemplateRenderResult | TemplateRenderResult[] | undefined
): GeneratorFunctionResult<AsyncAPIDocumentInterface, Options> {
  if (rendered === undefined) {
    return {};
  }

  if (typeof rendered === "string") {
    return {
      [filePath]: {
        path: filePath,
        source: [{ content: rendered }]
      }
    };
  }

  const results = Array.isArray(rendered) ? rendered : [rendered];

  return results.reduce(
    (documents, result) => {
      const path = result.metadata?.fileName ?? filePath;

      documents[path] = {
        path,
        source: [{ content: result.content }]
      };

      return documents;
    },
    {} as GeneratorFunctionResult<AsyncAPIDocumentInterface, Options>
  );
}

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
    version: "1.0",
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
  generator: async (
    spec,
    options
  ): Promise<GeneratorFunctionResult<AsyncAPIDocumentInterface, Options>> => {
    const { templateName, outputPath, entrypoint, ...rest } = options;
    const { cwd } = useContext();

    if (!isAsyncAPIDocument(spec)) {
      throw new Error("Invalid AsyncAPI schema");
    }

    const generatorOptions: GeneratorOptions = {
      ...rest,
      entrypoint,
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
    await generator.configureTemplateWorkflow(rest);
    const rendered = await generator.handleEntrypoint();

    return toGeneratedDocuments(entrypoint ?? "output", rendered);
  }
});
