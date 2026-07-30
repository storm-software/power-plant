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
import {
  computed,
  For,
  Scope,
  Show,
  SourceDirectoryContext,
  splitProps,
  useContext,
  useScope
} from "@alloy-js/core";
import {
  getSourceDirectoryData,
  ImportStatements,
  PackageContext,
  SourceFileContext,
  TSModuleScope,
  useSourceFile
} from "@alloy-js/typescript";
import { getUniqueBy } from "@stryke/helpers/get-unique";
import { appendPath } from "@stryke/path/append";
import { isBoolean } from "@stryke/type-checks/is-boolean";
import { isString } from "@stryke/type-checks/is-string";
import { SingleLineComment } from "../../core/components/single-line-comment";
import type { SourceFileProps } from "../../core/components/source-file";
import { SourceFile } from "../../core/components/source-file";
import { code } from "../../core/helpers/code";
import {
  HEADER_TEXT_LINE_1,
  HEADER_TEXT_LINE_2
} from "../../core/helpers/header-constants";
import type {
  ComponentProps,
  SourceFileHeaderProps
} from "../../core/types/components";
import type {
  TypescriptFileImportItem,
  TypescriptFileImports
} from "../types/components";

export type TypescriptFileProps = Omit<SourceFileProps, "filetype"> &
  ComponentProps & {
    hashbang?: Children | true;
    header?: Children;
    imports?: TypescriptFileImports;
    builtinImports?: TypescriptFileImports;
    export?: boolean | string;
    tsx?: boolean;
    prefix?: string;
  };

/**
 * A base component representing a Powerlines generated Typescript source file.
 *
 * @param props - The properties for the source file.
 * @returns The rendered source file component.
 */
export function TypescriptFile(props: TypescriptFileProps) {
  const [
    { children, path, imports, builtinImports, tsx, header, hashbang, prefix },
    rest
  ] = splitProps(props, [
    "children",
    "path",
    "imports",
    "builtinImports",
    "tsx",
    "header",
    "hashbang",
    "prefix"
  ]);

  const directoryContext = useContext(SourceDirectoryContext)!;
  const sdData = getSourceDirectoryData(directoryContext);

  const modulePath = appendPath(path, directoryContext.path);
  const scope = new TSModuleScope(modulePath, useScope());
  sdData.modules.add(scope);

  const pkg = useContext(PackageContext);
  if (pkg) {
    pkg.scope.addModule(scope);
  }

  if (props.export) {
    if (pkg) {
      if (isBoolean(props.export)) {
        pkg.scope.addExport(modulePath, scope);
      } else {
        pkg.scope.addExport(props.export, scope);
      }
    }
  }

  return (
    <SourceFileContext.Provider
      value={{
        scope
      }}>
      <Scope value={scope}>
        <SourceFile
          {...rest}
          path={modulePath}
          header={
            header ?? (
              <TypescriptFileHeader hashbang={hashbang}>
                <TypescriptFileHeaderImports
                  imports={imports}
                  builtinImports={builtinImports}
                  scope={scope}
                  prefix={prefix}
                />
              </TypescriptFileHeader>
            )
          }
          filetype={tsx ? "tsx" : "typescript"}>
          {children}
        </SourceFile>
      </Scope>
    </SourceFileContext.Provider>
  );
}

export interface TypescriptFileHeaderProps extends SourceFileHeaderProps {
  header?: Children;
  hashbang?: Children | true;
  debug?: boolean;
}

/**
 * Renders the header for a Powerlines Typescript source file.
 *
 * @param props - The properties for the source file header.
 * @returns The rendered source file header.
 */
export function TypescriptFileHeader(props: TypescriptFileHeaderProps) {
  const {
    header,
    hashbang,
    disableEslint = true,
    disableBiome = true,
    disableOxlint = true,
    children,
    debug = false
  } = props;

  const debugOptions = computed(() =>
    debug ? " -S NODE_OPTIONS=--enable-source-maps" : ""
  );

  return (
    <>
      <Show when={Boolean(hashbang)}>
        {hashbang === true
          ? code`#!/usr/bin/env${debugOptions.value} node`
          : hashbang}
        <hbr />
      </Show>
      <Show when={Boolean(header)}>
        {header}
        <hbr />
      </Show>
      <hbr />
      <Show when={Boolean(disableEslint)}>
        <SingleLineComment variant="slash-star">
          {"eslint-disable"}
        </SingleLineComment>
        <hbr />
      </Show>
      <Show when={Boolean(disableOxlint)}>
        <SingleLineComment variant="slash-star">
          {"oxlint-disable"}
        </SingleLineComment>
        <hbr />
      </Show>
      <Show when={Boolean(disableBiome)}>
        <SingleLineComment>{"biome-ignore lint: disable"}</SingleLineComment>
        <hbr />
      </Show>
      <Show
        when={
          Boolean(disableEslint) ||
          Boolean(disableBiome) ||
          Boolean(disableOxlint)
        }>
        <hbr />
      </Show>
      <Show when={Boolean(children)}>
        {children}
        <hbr />
      </Show>
      <SingleLineComment>{HEADER_TEXT_LINE_1}</SingleLineComment>
      <hbr />
      <SingleLineComment>{HEADER_TEXT_LINE_2}</SingleLineComment>
      <hbr />
    </>
  );
}

export interface TypescriptFileHeaderImportsProps extends SourceFileHeaderProps {
  imports?: TypescriptFileImports;
  builtinImports?: TypescriptFileImports;
  scope?: TSModuleScope;
  prefix?: string;
}

/**
 * Renders the header for a Power Plant Typescript source file.
 *
 * @param props - The properties for the source file header.
 * @returns The rendered source file header.
 */
export function TypescriptFileHeaderImports(
  props: TypescriptFileHeaderImportsProps
) {
  const {
    imports: importProps,
    builtinImports: builtinImportsProps,
    prefix
  } = props;

  const scope = props.scope ?? useSourceFile().scope;

  const imports = computed(() => {
    return Object.fromEntries(
      Object.entries(importProps ?? {}).map(([module, importItem]) => [
        module,
        Array.isArray(importItem)
          ? getUniqueBy(importItem, i => (isString(i) ? i : i.alias || i.name))
          : importItem
      ])
    );
  });
  const builtinImports = computed(() => {
    return Object.fromEntries(
      Object.entries(builtinImportsProps ?? {}).map(([module, importItem]) => [
        module,
        Array.isArray(importItem)
          ? getUniqueBy(importItem, i => (isString(i) ? i : i.alias || i.name))
          : importItem
      ])
    );
  });

  return (
    <Show
      when={
        scope.importedModules.size > 0 ||
        (!!imports.value && Object.keys(imports.value).length > 0) ||
        (!!builtinImports.value && Object.keys(builtinImports.value).length > 0)
      }>
      <Show when={!!imports.value && Object.keys(imports.value).length > 0}>
        <For
          each={Object.entries(imports.value ?? {})}
          hardline
          ender={<hbr />}>
          {([module, importItem]) =>
            code`import ${
              importItem === null
                ? ""
                : isString(importItem)
                  ? importItem
                  : `${
                      (
                        importItem.filter(
                          i => !isString(i) && i.default
                        ) as TypescriptFileImportItem[]
                      )
                        .map(
                          i =>
                            `${i.type ? "type " : ""}${
                              i.alias ? i.alias : i.name
                            }`
                        )
                        .join(", ") +
                      (importItem.filter(i => !isString(i) && i.default)
                        .length > 0 &&
                      importItem.filter(i => isString(i) || !i.default).length >
                        0
                        ? ", "
                        : "") +
                      (importItem.filter(i => isString(i) || !i.default)
                        .length > 0
                        ? `{ ${importItem
                            .filter(i => isString(i) || !i.default)
                            .map(i =>
                              isString(i)
                                ? i
                                : `${i.type ? "type " : ""}${
                                    i.alias ? `${i.name} as ${i.alias}` : i.name
                                  }`
                            )
                            .join(", ")} }`
                        : "")
                    }`
            } from "${module}";`
          }
        </For>
      </Show>
      <Show
        when={
          builtinImports.value && Object.keys(builtinImports.value).length > 0
        }>
        <For
          each={Object.entries(
            (builtinImports.value ?? {}) as Record<
              string,
              null | Array<TypescriptFileImportItem | string>
            >
          )}
          hardline
          ender={<hbr />}>
          {([module, importItem]) =>
            code`import ${
              importItem === null
                ? ""
                : isString(importItem)
                  ? importItem
                  : `${
                      (
                        importItem.filter(
                          i => !isString(i) && i.default
                        ) as TypescriptFileImportItem[]
                      )
                        .map(
                          i =>
                            `${i.type ? "type " : ""}${
                              i.alias ? i.alias : i.name
                            }`
                        )
                        .join(", ") +
                      (importItem.filter(i => !isString(i) && i.default)
                        .length > 0 &&
                      importItem.filter(i => isString(i) || !i.default).length >
                        0
                        ? ", "
                        : "") +
                      (importItem.filter(i => isString(i) || !i.default)
                        .length > 0
                        ? `{ ${importItem
                            .filter(i => isString(i) || !i.default)
                            .map(i =>
                              isString(i)
                                ? i
                                : `${i.type ? "type " : ""}${
                                    i.alias ? `${i.name} as ${i.alias}` : i.name
                                  }`
                            )
                            .join(", ")} }`
                        : "")
                    }`
            } from "${
              module.includes(":")
                ? module
                : `${prefix || ""}${prefix ? ":" : ""}${module}`
            }";`
          }
        </For>
      </Show>
      <Show when={scope.importedModules.size > 0}>
        <ImportStatements records={scope.importedModules} />
      </Show>
      <hbr />
    </Show>
  );
}
