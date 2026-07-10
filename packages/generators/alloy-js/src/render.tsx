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

import type { Children, OutputFile as AlloyOutputFile } from "@alloy-js/core";
import { renderAsync, traverseOutput } from "@alloy-js/core";
import type {
  ExecutionContext,
  GeneratorFunctionResult,
  MetaConfig
} from "@power-plant/core";
import { noop } from "@stryke/helpers/noop";
import { replacePath } from "@stryke/path/replace";
import { list } from "@stryke/string-format/list";
import defu from "defu";
import { Output } from "./core";

/**
 * A function to render children components within the [Alloy](https://alloy-framework.github.io) context, and register any generated documents on the execution context.
 *
 * @example
 * ```tsx
 * import { render } from "@power-plant/alloy-js/render";
 *
 * await render(context, spec, <> ... </>);
 * ```
 *
 * @param context - The Power Plant execution context.
 * @param children - The children components to render.
 * @returns A promise that resolves when rendering is complete.
 */
export async function render<TSpec, TOptions extends object, TReturns = void>(
  context: ExecutionContext<TSpec, TOptions, TReturns>,
  spec: TSpec,
  children: Children
): Promise<GeneratorFunctionResult<TSpec, TOptions>> {
  const meta = {} as Record<string, MetaConfig<TSpec, TOptions>>;
  const { cwd, logger } = context;
  const output = await renderAsync(
    <Output context={context} spec={spec} meta={meta}>
      {children}
    </Output>
  );

  const files = [] as AlloyOutputFile[];
  await traverseOutput(output, {
    visitDirectory: noop,
    visitFile: file => files.push(file)
  });

  if (!files.length) {
    logger.debug("No output files were rendered by the Alloy-js components.");
    return {};
  }

  logger.debug(
    `Rendering ${files.length} output files from Alloy-js components: ${list(
      files.map(file => replacePath(file.path, cwd))
    )}.`
  );

  const documents = {} as GeneratorFunctionResult<TSpec, TOptions>;
  await traverseOutput(output, {
    visitDirectory: noop,
    visitFile: file => {
      if ("contents" in file) {
        const metadata = meta[file.path] ?? {};

        documents[file.path] = {
          path: file.path,
          source: [
            {
              content: file.contents,
              meta: metadata
            }
          ]
        };
      } else if (file.sourcePath && documents[file.sourcePath]) {
        const metadata = meta[file.path] ?? {};

        documents[file.path] = {
          ...documents[file.sourcePath],
          path: file.path,
          source:
            documents[file.sourcePath]?.source?.map(source =>
              defu(source, {
                meta: metadata
              })
            ) ?? []
        };
      }
    }
  });

  return documents;
}
