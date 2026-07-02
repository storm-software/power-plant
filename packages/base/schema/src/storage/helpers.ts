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

import { Buffer } from "node:buffer";
import { Stats } from "node:fs";
import { MessageChannel, receiveMessageOnPort } from "node:worker_threads";
import type { StorageMeta } from "unstorage";

export type EntryType = "file" | "directory" | "symlink";

export interface EntryInfo {
  key: string;
  type: EntryType;
  meta?: StorageMeta | null;
}

export function toPathInput(path: string | Buffer | URL): string {
  if (path instanceof URL) {
    return decodeURIComponent(path.pathname);
  }
  if (Buffer.isBuffer(path)) {
    return path.toString();
  }
  return path;
}

export function normalizeKey(path: string | Buffer | URL): string {
  let value = toPathInput(path).replace(/\\/g, "/");
  while (value.startsWith("./")) {
    value = value.slice(2);
  }
  value = value.replace(/^\/+/, "");
  value = value.replace(/\/+/g, "/");
  if (value.length > 1 && value.endsWith("/")) {
    value = value.slice(0, -1);
  }
  return value;
}

export function resolveKey(...segments: Array<string | Buffer | URL>): string {
  const parts: string[] = [];
  for (const segment of segments) {
    for (const part of normalizeKey(segment).split("/")) {
      if (!part || part === ".") {
        continue;
      }
      if (part === "..") {
        parts.pop();
        continue;
      }
      parts.push(part);
    }
  }
  return parts.join("/");
}

export function dirname(key: string): string {
  const index = key.lastIndexOf("/");

  return index === -1 ? "" : key.slice(0, index);
}

export function basename(key: string): string {
  const index = key.lastIndexOf("/");

  return index === -1 ? key : key.slice(index + 1);
}

export function isMetaStorageKey(key: string): boolean {
  return key.endsWith("$");
}

export function parentPrefix(key: string): string {
  return key ? `${key}/` : "";
}

export function getImmediateChildren(base: string, keys: string[]): string[] {
  const prefix = parentPrefix(base);
  const children = new Set<string>();

  for (const key of keys) {
    if (isMetaStorageKey(key)) {
      continue;
    }

    const relative = prefix
      ? key.startsWith(prefix)
        ? key.slice(prefix.length)
        : ""
      : key;
    if (!relative || relative === key) {
      continue;
    }

    const slashIndex = relative.indexOf("/");
    children.add(slashIndex === -1 ? relative : relative.slice(0, slashIndex));
  }

  return [...children].sort();
}

export function createFsError(
  code: string,
  syscall: string,
  path?: string,
  message?: string
): NodeJS.ErrnoException {
  const suffix = path ? ` '${path}'` : "";
  const error = new Error(
    message ?? `${code}: ${syscall}${suffix}`
  ) as NodeJS.ErrnoException;
  error.code = code;
  error.syscall = syscall;
  if (path) {
    error.path = path;
  }
  return error;
}

export function runSync<T>(operation: () => Promise<T>): T {
  const { port1, port2 } = new MessageChannel();

  operation().then(
    value => {
      port1.postMessage({ ok: true as const, value });
    },
    error => {
      port1.postMessage({ ok: false as const, error });
    }
  );

  const response = receiveMessageOnPort(port2);
  port1.close();
  port2.close();

  if (!response) {
    throw new Error("Storage operation did not complete.");
  }

  if (!response.message.ok) {
    throw response.message.error;
  }

  return response.message.value;
}

export function toBuffer(
  value: string | Buffer | Uint8Array | null | undefined
): Buffer {
  if (value == null) {
    return Buffer.alloc(0);
  }
  if (Buffer.isBuffer(value)) {
    return value;
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }
  return Buffer.from(value);
}

export type StorageEncoding = BufferEncoding | "buffer" | null | undefined;

export function getEncoding(
  options?:
    | string
    | null
    | {
        encoding?: StorageEncoding;
      }
): StorageEncoding {
  if (typeof options === "string") {
    return options as StorageEncoding;
  }
  if (options == null) {
    return undefined;
  }
  return options.encoding ?? undefined;
}

export function shouldReadRaw(
  options?:
    | string
    | null
    | {
        encoding?: StorageEncoding;
      }
): boolean {
  const encoding = getEncoding(options);

  return encoding === undefined || encoding === null || encoding === "buffer";
}

export function decodeStoredValue(
  value: unknown,
  encoding?: StorageEncoding
): string | Buffer {
  const buffer = toBuffer(
    typeof value === "string" ||
      Buffer.isBuffer(value) ||
      value instanceof Uint8Array
      ? value
      : value == null
        ? ""
        : JSON.stringify(value)
  );

  if (encoding === undefined || encoding === null || encoding === "buffer") {
    return buffer;
  }

  return buffer.toString(encoding);
}

export function encodeWriteValue(
  data: string | NodeJS.ArrayBufferView
): string | Buffer {
  if (typeof data === "string") {
    return data;
  }
  return toBuffer(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
}

export function createStats(
  type: EntryType,
  meta?: StorageMeta | null,
  size = 0
): Stats {
  const now = Date.now();
  const atime = meta?.atime instanceof Date ? meta.atime : new Date(now);
  const mtime = meta?.mtime instanceof Date ? meta.mtime : new Date(now);
  const mode =
    type === "directory"
      ? 0o40_755
      : type === "symlink"
        ? 0o12_0777
        : 0o10_0644;

  const stat = Object.create(Stats.prototype) as Stats;
  Object.assign(stat, {
    dev: 0,
    ino: 0,
    mode,
    nlink: 1,
    uid: typeof meta?.uid === "number" ? meta.uid : 0,
    gid: typeof meta?.gid === "number" ? meta.gid : 0,
    rdev: 0,
    size,
    blksize: 4096,
    blocks: Math.ceil(size / 512),
    atimeMs: atime.getTime(),
    mtimeMs: mtime.getTime(),
    ctimeMs: mtime.getTime(),
    birthtimeMs: mtime.getTime(),
    atime,
    mtime,
    ctime: mtime,
    birthtime: mtime
  });

  return stat;
}

export function matchesGlobPattern(pattern: string, value: string): boolean {
  const regex = new RegExp(
    `^${pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, ".")}$`
  );

  return regex.test(value);
}

export function randomSuffix(length = 6): string {
  return Array.from({ length }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 36)
    )
  ).join("");
}
