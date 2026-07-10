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

import type { SourceFileProps as SourceFilePropsExternal } from "@alloy-js/core";
import {
  getContext,
  Show,
  SourceDirectoryContext,
  SourceFileContext,
  splitProps,
  useContext,
  useFormatOptions
} from "@alloy-js/core";
import type { MetaConfig } from "@power-plant/core";
import { appendPath } from "@stryke/path/append";
import defu from "defu";
import { useMeta } from "../contexts/meta";
import type { ComponentProps } from "../types/components";

export type SourceFileProps = SourceFilePropsExternal &
  ComponentProps & {
    /**
     * The metadata associated with the source file.
     *
     * @remarks
     * The values stored in the metadata will be available in the rendering context.
     */
    meta?: MetaConfig<any, any>;
  };

/**
 * A base component representing a generated source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function SourceFile(props: SourceFileProps) {
  const [{ children, meta, path, header, filetype, reference }] = splitProps(
    props,
    ["children", "meta", "path", "header", "filetype", "reference"]
  );

  const metaContext = useMeta();
  const parentDirectory = useContext(SourceDirectoryContext)!;

  const sourceFile: SourceFileContext = {
    path: appendPath(path, parentDirectory.path),
    filetype,
    reference
  };
  parentDirectory?.addContent(sourceFile);

  const printOptions = useFormatOptions({
    printWidth: props.printWidth,
    tabWidth: props.tabWidth,
    useTabs: props.useTabs,
    insertFinalNewLine: props.insertFinalNewLine
  });

  const nodeContext = getContext()!;
  nodeContext.meta = defu(
    {
      sourceFile,
      printOptions
    },
    meta ?? {}
  );

  if (metaContext) {
    metaContext[sourceFile.path] = {
      ...(meta ?? {})
    };
  }

  return (
    <SourceFileContext.Provider value={sourceFile}>
      <Show when={header !== undefined}>
        {header}
        <hbr />
      </Show>
      {children}
    </SourceFileContext.Provider>
  );
}
