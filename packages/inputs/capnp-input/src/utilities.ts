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

import type { CapnpSchema, CapnpType } from "@power-plant/capnp-schema";
import type {
  CapnpcResult,
  CodeGeneratorFileContext
} from "@stryke/capnp/types";
import { toArray } from "@stryke/convert/to-array";
import type { LoadReference } from "@stryke/resolve/types";
import { isString } from "@stryke/type-checks/is-string";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type CapnpNode = CodeGeneratorFileContext["nodes"][number];
type CapnpField = CapnpNode extends { struct: infer S }
  ? S extends { fields: infer F }
    ? F extends { at: (i: number) => infer R }
      ? R
      : never
    : never
  : never;
type CapnpTypeNode = CapnpField extends { slot: { type: infer T } } ? T : never;

/** Cap'n Proto `Type.Which` values 0–13 (void…data). `anyPointer` is 18. */
const BUILTIN_TYPE_KINDS = [
  "void",
  "bool",
  "int8",
  "int16",
  "int32",
  "int64",
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "float32",
  "float64",
  "text",
  "data"
] as const;

type BuiltinTypeWhich =
  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

function isBuiltinTypeWhich(which: number): which is BuiltinTypeWhich {
  return which >= 0 && which < BUILTIN_TYPE_KINDS.length;
}

/**
 * Formats an unknown load/compile error into a readable message.
 */
export function formatLoadError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Resolves a load reference to an absolute filesystem path.
 */
export function toAbsolutePath(reference: LoadReference, cwd: string): string {
  if (!isString(reference)) {
    throw new TypeError(
      `Unsupported Cap'n Proto schema reference: ${String(reference)}. Expected a filesystem path string.`
    );
  }

  if (reference.startsWith("file:")) {
    return new URL(reference).pathname;
  }

  return isAbsolute(reference) ? reference : resolve(cwd, reference);
}

/**
 * Builds a `file:` URL for logging / debugging schema sources.
 */
export function toFileUrl(path: string): string {
  return pathToFileURL(path).href;
}

/**
 * Flattens one or more load references into a string array.
 */
export function normalizeInputPaths(
  inputPath: LoadReference | LoadReference[]
): string[] {
  return toArray(inputPath).map(reference => {
    if (!isString(reference)) {
      throw new TypeError(
        `Unsupported Cap'n Proto schema reference: ${String(reference)}. Expected a filesystem path string.`
      );
    }

    return reference;
  });
}

/**
 * Converts a Cap'n Proto 64-bit id to a hex string (`0x…`).
 */
export function toTypeId(id: bigint): string {
  return `0x${id.toString(16)}`;
}

function shortName(displayName: string, prefixLength: number): string {
  return displayName.slice(prefixLength);
}

function listToArray<T>(
  list: ArrayLike<T> | { length: number; at: (index: number) => T }
): T[] {
  if (Array.isArray(list)) {
    return list;
  }

  if (
    typeof (list as { at?: unknown }).at === "function" &&
    typeof (list as { length?: unknown }).length === "number"
  ) {
    const items: T[] = [];
    const typed = list as { length: number; at: (index: number) => T };
    for (let index = 0; index < typed.length; index++) {
      items.push(typed.at(index));
    }
    return items;
  }

  return Array.from(list as ArrayLike<T>);
}

function convertType(type: CapnpTypeNode): CapnpType {
  const which = type.which();

  if (isBuiltinTypeWhich(which)) {
    return { kind: BUILTIN_TYPE_KINDS[which] };
  }

  if (which === 14) {
    return {
      kind: "list",
      elementType: convertType(type.list.elementType)
    };
  }

  if (which === 15) {
    return {
      kind: "enum",
      typeId: toTypeId(type.enum.typeId)
    };
  }

  if (which === 16) {
    return {
      kind: "struct",
      typeId: toTypeId(type.struct.typeId)
    };
  }

  if (which === 17) {
    return {
      kind: "interface",
      typeId: toTypeId(type.interface.typeId)
    };
  }

  return { kind: "anyPointer" };
}

function convertStruct(
  node: CapnpNode
): CapnpSchema["files"][number]["structs"][number] {
  const fields = listToArray(node.struct.fields).map((field, index) => {
    const ordinal = field.ordinal._isExplicit ? field.ordinal.explicit : index;
    const discriminantValue =
      field.discriminantValue === 0xffff ? undefined : field.discriminantValue;

    if (field._isGroup) {
      return {
        name: field.name,
        ordinal,
        codeOrder: field.codeOrder,
        kind: "group" as const,
        discriminantValue,
        groupId: toTypeId(field.group.typeId)
      };
    }

    return {
      name: field.name,
      ordinal,
      codeOrder: field.codeOrder,
      kind: "slot" as const,
      discriminantValue,
      type: convertType(field.slot.type),
      hadExplicitDefault: field.slot.hadExplicitDefault
    };
  });

  return {
    kind: "struct",
    name: shortName(node.displayName, node.displayNamePrefixLength),
    id: toTypeId(node.id),
    displayName: node.displayName,
    isGroup: node.struct.isGroup,
    parameters: listToArray(node.parameters).map(parameter => parameter.name),
    fields,
    nestedNodes: listToArray(node.nestedNodes).map(nested => ({
      name: nested.name,
      id: toTypeId(nested.id)
    })),
    discriminantCount: node.struct.discriminantCount || undefined,
    dataWordCount: node.struct.dataWordCount,
    pointerCount: node.struct.pointerCount
  };
}

function convertEnum(
  node: CapnpNode
): CapnpSchema["files"][number]["enums"][number] {
  return {
    kind: "enum",
    name: shortName(node.displayName, node.displayNamePrefixLength),
    id: toTypeId(node.id),
    displayName: node.displayName,
    enumerants: listToArray(node.enum.enumerants).map((enumerant, index) => ({
      name: enumerant.name,
      ordinal: index,
      codeOrder: enumerant.codeOrder
    }))
  };
}

function convertInterface(
  node: CapnpNode
): CapnpSchema["files"][number]["interfaces"][number] {
  return {
    kind: "interface",
    name: shortName(node.displayName, node.displayNamePrefixLength),
    id: toTypeId(node.id),
    displayName: node.displayName,
    parameters: listToArray(node.parameters).map(parameter => parameter.name),
    superclasses: listToArray(node.interface.superclasses).map(superclass =>
      toTypeId(superclass.id)
    ),
    methods: listToArray(node.interface.methods).map((method, index) => ({
      name: method.name,
      ordinal: index,
      codeOrder: method.codeOrder,
      paramStructTypeId: toTypeId(method.paramStructType),
      resultStructTypeId: toTypeId(method.resultStructType),
      implicitParameters: listToArray(method.implicitParameters).map(
        parameter => parameter.name
      )
    })),
    nestedNodes: listToArray(node.nestedNodes).map(nested => ({
      name: nested.name,
      id: toTypeId(nested.id)
    }))
  };
}

function convertConst(
  node: CapnpNode
): CapnpSchema["files"][number]["constants"][number] {
  return {
    kind: "const",
    name: shortName(node.displayName, node.displayNamePrefixLength),
    id: toTypeId(node.id),
    displayName: node.displayName,
    type: convertType(node.const.type)
  };
}

function convertAnnotation(
  node: CapnpNode
): CapnpSchema["files"][number]["annotations"][number] {
  const annotation = node.annotation;

  return {
    kind: "annotation",
    name: shortName(node.displayName, node.displayNamePrefixLength),
    id: toTypeId(node.id),
    displayName: node.displayName,
    type: convertType(annotation.type),
    targets: {
      file: annotation.targetsFile,
      const: annotation.targetsConst,
      enum: annotation.targetsEnum,
      enumerant: annotation.targetsEnumerant,
      struct: annotation.targetsStruct,
      field: annotation.targetsField,
      union: annotation.targetsUnion,
      group: annotation.targetsGroup,
      interface: annotation.targetsInterface,
      method: annotation.targetsMethod,
      param: annotation.targetsParam,
      annotation: annotation.targetsAnnotation
    }
  };
}

/**
 * Converts a `capnpc` compilation result into a Cap'n Proto schema document.
 *
 * @see https://capnproto.org/language.html
 * @see https://github.com/storm-software/powerlines/blob/main/packages/plugins/plugin-capnp/src/index.ts
 */
export function toCapnpSchema(result: CapnpcResult): CapnpSchema {
  const files: CapnpSchema["files"] = [];

  for (const fileContext of result.ctx.files) {
    const fileNode = fileContext.nodes.find(node => node._isFile);
    if (!fileNode) {
      continue;
    }

    const nestedNodes = listToArray(fileNode.nestedNodes).map(nested => ({
      name: nested.name,
      id: toTypeId(nested.id)
    }));

    const structs: CapnpSchema["files"][number]["structs"] = [];
    const enums: CapnpSchema["files"][number]["enums"] = [];
    const interfaces: CapnpSchema["files"][number]["interfaces"] = [];
    const constants: CapnpSchema["files"][number]["constants"] = [];
    const annotations: CapnpSchema["files"][number]["annotations"] = [];

    for (const node of fileContext.nodes) {
      if (node._isStruct) {
        structs.push(convertStruct(node));
      } else if (node._isEnum) {
        enums.push(convertEnum(node));
      } else if (node._isInterface) {
        interfaces.push(convertInterface(node));
      } else if (node._isConst) {
        constants.push(convertConst(node));
      } else if (node._isAnnotation) {
        annotations.push(convertAnnotation(node));
      }
    }

    const requestedFile = (
      fileContext as CodeGeneratorFileContext & {
        file?: { filename?: string };
      }
    ).file;

    files.push({
      kind: "file",
      path:
        fileNode.displayName ||
        requestedFile?.filename ||
        fileContext.tsPath.replace(/\.ts$/, ".capnp"),
      id: toTypeId(fileNode.id),
      displayName: fileNode.displayName || requestedFile?.filename,
      imports: listToArray(fileContext.imports).map(entry => ({
        id: toTypeId(entry?.id ?? BigInt(0)),
        name: entry?.name ?? ""
      })),
      nestedNodes,
      structs,
      enums,
      interfaces,
      constants,
      annotations
    });
  }

  return { files };
}

/**
 * Normalizes `capnpc` result files to `[path, content]` pairs.
 */
export function toGeneratedFileEntries(
  files: CapnpcResult["files"]
): Array<[string, string]> {
  if (files instanceof Map) {
    return [...files.entries()];
  }

  return Object.entries(files);
}
