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

import type { Token, TokenGroup, Tokens } from "@power-plant/dtcg-schema";
import { isFileReference } from "@stryke/resolve/type-checks";
import type { LoadReference } from "@stryke/resolve/types";
import { isString } from "@stryke/type-checks/is-string";
import { isURL } from "@stryke/type-checks/is-url";
import type { TokenNormalized, TokenNormalizedSet } from "@terrazzo/parser";
import { isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Converts a Power Plant {@link LoadReference} into a `file:` / remote URL for
 * Terrazzo's `parse()` input sources.
 *
 * @param reference - The reference to convert.
 * @param cwd - Working directory used to resolve relative paths.
 * @returns A URL pointing at the tokens source.
 */
export function toTokenFilename(reference: LoadReference, cwd: string): URL {
  if (isFileReference(reference)) {
    const filePath = isAbsolute(reference.file)
      ? reference.file
      : join(cwd, reference.file);

    return pathToFileURL(filePath);
  }

  if (isURL(reference)) {
    return reference instanceof URL ? reference : new URL(String(reference));
  }

  if (isString(reference)) {
    if (
      reference.startsWith("file:") ||
      reference.startsWith("http:") ||
      reference.startsWith("https:")
    ) {
      return new URL(reference);
    }

    const filePath = isAbsolute(reference) ? reference : join(cwd, reference);

    return pathToFileURL(filePath);
  }

  return pathToFileURL(join(cwd, String(reference)));
}

/**
 * Normalizes loaded token source content into a {@link Tokens} object.
 *
 * @param src - Raw source content from a loader (`string` or object).
 * @returns The DTCG tokens document.
 */
export function toTokens(src: unknown): Tokens {
  if (isString(src)) {
    return JSON.parse(src) as Tokens;
  }

  if (src && typeof src === "object") {
    return src as Tokens;
  }

  throw new Error(
    `Expected DTCG tokens JSON object or string, received ${typeof src}`
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isTokenLike = (value: unknown): value is Token =>
  isRecord(value) && ("$value" in value || "$ref" in value);

/**
 * Builds a DTCG token node from a Terrazzo normalized token.
 *
 * Prefers `originalValue` so aliases stay curly-brace references.
 */
function toTokenNode(token: TokenNormalized): Token {
  if (isTokenLike(token.originalValue)) {
    return { ...token.originalValue };
  }

  const node: Token = {
    $type: token.$type as Token["$type"],
    $value: token.aliasOf
      ? `{${token.aliasOf}}`
      : (token.$value as Token["$value"])
  };

  if (token.$description !== undefined) {
    node.$description = token.$description;
  }
  if (token.$extensions !== undefined) {
    node.$extensions = token.$extensions;
  }
  if (token.$deprecated !== undefined) {
    node.$deprecated = token.$deprecated;
  }

  return node;
}

/**
 * Applies Terrazzo group metadata onto a DTCG group node.
 */
function applyGroupMetadata(
  group: Record<string, unknown>,
  meta: TokenNormalized["group"]
): void {
  if (meta.$type !== undefined) {
    group.$type = meta.$type;
  }
  if (meta.$description !== undefined) {
    group.$description = meta.$description;
  }
  if (meta.$extensions !== undefined) {
    group.$extensions = meta.$extensions;
  }
  if (meta.$deprecated !== undefined) {
    group.$deprecated = meta.$deprecated;
  }
}

/**
 * Converts a Terrazzo {@link TokenNormalizedSet} (flat `id` → token map) into a
 * nested {@link Tokens} document.
 *
 * @param tokens - Normalized tokens from `@terrazzo/parser` `parse()`.
 * @returns Nested DTCG tokens document.
 */
export function fromTokenNormalizedSet(tokens: TokenNormalizedSet): Tokens {
  const document: Record<string, unknown> = {};

  for (const token of Object.values(tokens)) {
    const segments = token.id.split(".");
    let cursor = document;

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i]!;
      const existing = cursor[segment];

      if (!isRecord(existing) || isTokenLike(existing)) {
        cursor[segment] = {} satisfies TokenGroup;
      }

      cursor = cursor[segment] as Record<string, unknown>;

      const groupPath = segments.slice(0, i + 1).join(".");
      if (token.group?.id === groupPath) {
        applyGroupMetadata(cursor, token.group);
      }
    }

    const leaf = segments.at(-1)!;
    cursor[leaf] = toTokenNode(token);
  }

  return document as Tokens;
}

/**
 * Formats a parse/load error into a string.
 *
 * @param error - The error to format.
 * @returns The formatted error.
 */
export function formatParseError(error: unknown): string {
  if (error instanceof Error) {
    return [error.message, error.stack].filter(Boolean).join("\n");
  }

  return String(error);
}
