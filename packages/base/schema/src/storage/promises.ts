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

// @ts-nocheck

import type { PromisesFileSystemInterface } from "@stryke/types/fs";
import { Buffer } from "node:buffer";
import type {
  CopyOptions,
  Dir,
  Dirent,
  GlobOptions,
  GlobOptionsWithFileTypes,
  MakeDirectoryOptions,
  Mode,
  ObjectEncodingOptions,
  OpenDirOptions,
  OpenMode,
  PathLike,
  ReadStream,
  ReadStreamOptions,
  ReadVResult,
  RmDirOptions,
  RmOptions,
  StatOptions,
  TimeLike,
  WatchEventType,
  WatchOptions,
  WriteStream,
  WriteStreamOptions,
  WriteVResult
} from "node:fs";
import { constants as fsConstants, Stats } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import { Readable, Writable } from "node:stream";
import type { Storage, StorageMeta } from "unstorage";
import type { EntryInfo } from "./helpers";
import {
  basename,
  createFsError,
  createStats,
  decodeStoredValue,
  dirname,
  encodeWriteValue,
  getEncoding,
  getImmediateChildren,
  isMetaStorageKey,
  matchesGlobPattern,
  normalizeKey,
  parentPrefix,
  randomSuffix,
  resolveKey,
  runSync,
  shouldReadRaw,
  toBuffer
} from "./helpers";

type ReadFileOptions =
  | string
  | null
  | {
      encoding?: import("./helpers").StorageEncoding;
      flag?: string;
    };

type WriteFileOptions = ReadFileOptions;
type BufferEncodingOption = ReadFileOptions;

interface OpenDescriptor {
  key: string;
  position: number;
}

const SYMLINK_META_KEY = "symlinkTarget";

export interface StorageFileSystemCore {
  promises: PromisesFileSystemInterface;
  createReadStream: (path: PathLike, options?: ReadStreamOptions) => ReadStream;
  createWriteStream: (
    path: PathLike,
    options?: WriteStreamOptions
  ) => WriteStream;
  openFd: (path: PathLike, flags?: OpenMode, mode?: Mode) => Promise<number>;
  closeFd: (fd: number) => Promise<void>;
  fstatFd: (
    fd: number,
    options?: StatOptions & { bigint?: false | undefined }
  ) => ReturnType<PromisesFileSystemInterface["stat"]>;
  readFd: (
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number | null
  ) => Promise<{ bytesRead: number; buffer: Buffer }>;
  writeFd: (
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number | null
  ) => Promise<{ bytesWritten: number; buffer: Buffer }>;
  ftruncateFd: (fd: number, len?: number) => Promise<void>;
  futimesFd: (fd: number, atime: TimeLike, mtime: TimeLike) => Promise<void>;
  readvFd: (
    fd: number,
    buffers: NodeJS.ArrayBufferView[],
    position?: number
  ) => Promise<ReadVResult>;
  writevFd: (
    fd: number,
    buffers: NodeJS.ArrayBufferView[],
    position?: number
  ) => Promise<WriteVResult>;
}

export type StoragePromises = StorageFileSystemCore["promises"];

export function createStoragePromises(storage: Storage): StorageFileSystemCore {
  const openDescriptors = new Map<number, OpenDescriptor>();
  let nextDescriptor = 3;

  async function getMetaSafe(key: string): Promise<StorageMeta | null> {
    try {
      return (await storage.getMeta(key)) ?? null;
    } catch {
      return null;
    }
  }

  async function getEntry(
    path: PathLike,
    followSymlinks = true
  ): Promise<EntryInfo | null> {
    const key = normalizeKey(path);
    if (!key && path !== "." && path !== "/") {
      return null;
    }

    const meta = await getMetaSafe(key);
    if (
      meta?.[SYMLINK_META_KEY] &&
      typeof meta[SYMLINK_META_KEY] === "string"
    ) {
      if (!followSymlinks) {
        return { key, type: "symlink", meta };
      }
      return getEntry(meta[SYMLINK_META_KEY], true);
    }

    if (await storage.hasItem(key)) {
      return { key, type: "file", meta };
    }

    const keys = await storage.getKeys(key);
    const children = getImmediateChildren(
      key,
      keys.filter(
        storageKey => storageKey !== key && !isMetaStorageKey(storageKey)
      )
    );

    if (children.length > 0) {
      return { key, type: "directory", meta };
    }

    return null;
  }

  async function requireEntry(
    path: PathLike,
    followSymlinks = true
  ): Promise<EntryInfo> {
    const entry = await getEntry(path, followSymlinks);
    if (!entry) {
      throw createFsError("ENOENT", "stat", normalizeKey(path));
    }
    return entry;
  }

  async function getFileSize(key: string): Promise<number> {
    const meta = await getMetaSafe(key);
    if (typeof meta?.size === "number") {
      return meta.size;
    }

    if (shouldReadRaw()) {
      const raw = await storage.getItemRaw(key);

      return raw == null ? 0 : toBuffer(raw as string | Buffer).byteLength;
    }

    const value = await storage.getItem(key);

    return value == null ? 0 : toBuffer(String(value)).byteLength;
  }

  async function readStoredFile(
    path: PathLike | FileHandle,
    options?: ReadFileOptions | BufferEncodingOption | null
  ): Promise<string | Buffer> {
    const key = normalizeKey(path as PathLike);
    const entry = await requireEntry(key, true);

    if (entry.type !== "file") {
      throw createFsError(
        "EISDIR",
        "read",
        key,
        "EISDIR: illegal operation on a directory, read"
      );
    }

    const encoding = getEncoding(options);
    const raw = shouldReadRaw(options);

    const value = raw
      ? await storage.getItemRaw(key)
      : await storage.getItem(key);

    if (value == null) {
      throw createFsError("ENOENT", "open", key);
    }

    return decodeStoredValue(value, encoding);
  }

  async function writeStoredFile(
    path: PathLike | FileHandle,
    data: string | NodeJS.ArrayBufferView,
    options?: WriteFileOptions | BufferEncodingOption | null
  ): Promise<void> {
    const key = normalizeKey(path as PathLike);
    const encoding = getEncoding(options);
    const payload =
      typeof data === "string"
        ? data
        : encoding && encoding !== "buffer"
          ? toBuffer(encodeWriteValue(data)).toString(encoding)
          : encodeWriteValue(data);

    await storage.setItem(key, payload);
    await storage.setMeta(key, {
      mtime: new Date(),
      atime: new Date(),
      size: toBuffer(payload).byteLength
    });
  }

  async function removePath(
    path: PathLike,
    options?: RmOptions | RmDirOptions | boolean
  ): Promise<void> {
    const key = normalizeKey(path);
    const entry = await getEntry(key, false);

    if (!entry) {
      if (
        typeof options === "object" &&
        options &&
        "recursive" in options &&
        options.recursive
      ) {
        return;
      }
      throw createFsError("ENOENT", "unlink", key);
    }

    if (entry.type === "directory") {
      const recursive =
        options === true ||
        (typeof options === "object" && options && "recursive" in options
          ? Boolean(options.recursive)
          : false);

      const keys = await storage.getKeys(key);
      const descendants = keys.filter(
        storageKey =>
          storageKey !== key &&
          !isMetaStorageKey(storageKey) &&
          storageKey.startsWith(parentPrefix(key))
      );

      if (!recursive && descendants.length > 0) {
        throw createFsError("ENOTEMPTY", "rmdir", key);
      }

      await Promise.all(
        descendants.map(async descendant => storage.removeItem(descendant))
      );
      if (await storage.hasItem(key)) {
        await storage.removeItem(key);
      }
      return;
    }

    await storage.removeItem(key);
  }

  async function copyEntry(
    source: string,
    destination: string,
    recursive = false
  ): Promise<void> {
    const entry = await requireEntry(source, true);

    if (entry.type === "directory") {
      if (!recursive) {
        throw createFsError(
          "EISDIR",
          "copy",
          source,
          "EISDIR: illegal operation on a directory, copy"
        );
      }

      const keys = await storage.getKeys(source);
      for (const key of keys) {
        if (isMetaStorageKey(key) || key === source) {
          continue;
        }
        const relative = key.slice(source.length).replace(/^\//, "");
        await copyEntry(key, resolveKey(destination, relative), true);
      }
      return;
    }

    const content = await readStoredFile(source);
    await writeStoredFile(
      destination,
      typeof content === "string" ? content : toBuffer(content)
    );
    const meta = await getMetaSafe(source);
    if (meta) {
      await storage.setMeta(normalizeKey(destination), meta);
    }
  }

  async function statPath(
    path: PathLike,
    followSymlinks = true
  ): Promise<Stats> {
    const entry = await requireEntry(path, followSymlinks);
    const size = entry.type === "file" ? await getFileSize(entry.key) : 4096;

    return createStats(entry.type, entry.meta, size);
  }

  async function chmodPath(path: PathLike, mode: Mode): Promise<void> {
    const key = normalizeKey(path);
    await requireEntry(key, true);
    await storage.setMeta(key, { mode });
  }

  async function chownPath(
    path: PathLike,
    uid: number,
    gid: number
  ): Promise<void> {
    const key = normalizeKey(path);
    await requireEntry(key, true);
    await storage.setMeta(key, { uid, gid });
  }

  async function mkdirPath(
    path: PathLike,
    options?: Mode | MakeDirectoryOptions | null
  ): Promise<string | undefined> {
    const key = normalizeKey(path);
    const recursive =
      typeof options === "object" && options
        ? Boolean(options.recursive)
        : false;

    if (!key) {
      return undefined;
    }

    const parent = dirname(key);
    if (parent) {
      const parentEntry = await getEntry(parent, true);
      if (!parentEntry && !recursive) {
        throw createFsError("ENOENT", "mkdir", key);
      }
      if (!parentEntry && recursive) {
        await mkdirPath(parent, { recursive: true });
      }
    }

    const entry = await getEntry(key, true);
    if (entry?.type === "file") {
      throw createFsError("EEXIST", "mkdir", key);
    }

    return undefined;
  }

  async function mkdtempPath(
    prefix: string,
    options?: ObjectEncodingOptions
  ): Promise<string | (PathLike & Buffer)> {
    const directory = `${normalizeKey(prefix)}${randomSuffix()}`;
    await mkdirPath(directory, { recursive: true });
    if ((options?.encoding as string | undefined) === "buffer") {
      return Buffer.from(directory);
    }
    return directory;
  }

  function createDir(path: PathLike, options?: OpenDirOptions): Dir {
    const key = normalizeKey(path);
    let entries: string[] = [];
    let loaded = false;
    let index = 0;
    let closed = false;

    const loadEntries = async () => {
      if (loaded) {
        return;
      }
      await requireEntry(key, true);
      const keys = await storage.getKeys(key);
      entries = getImmediateChildren(
        key,
        keys.filter(storageKey => !isMetaStorageKey(storageKey))
      );
      loaded = true;
    };

    const toDirent = (name: string): Dirent<string> =>
      ({
        name,
        isFile: () => true,
        isDirectory: () => false,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isSymbolicLink: () => false,
        isFIFO: () => false,
        isSocket: () => false
      }) as Dirent<string>;

    return {
      path: key,
      async read() {
        if (closed) {
          throw createFsError("EBADF", "readdir", key);
        }
        await loadEntries();
        if (index >= entries.length) {
          return null;
        }
        const name = entries[index++]!;
        if ((options?.encoding as string | undefined) === "buffer") {
          return Buffer.from(name) as unknown as Dirent<Buffer>;
        }
        return toDirent(name);
      },
      async close() {
        closed = true;
      },
      async *[Symbol.asyncIterator]() {
        while (true) {
          const entry = await this.read();
          if (!entry) {
            break;
          }
          yield entry;
        }
      }
    } as Dir;
  }

  function createReadStream(
    path: PathLike,
    options?: ReadStreamOptions
  ): ReadStream {
    const key = normalizeKey(path);
    const start = options?.start ?? 0;
    const end = options?.end;

    return Readable.from(
      (async function* () {
        let content = toBuffer(await readStoredFile(key));
        if (start > 0) {
          content = content.subarray(start);
        }
        if (end != null) {
          yield content.subarray(0, Math.max(0, end - start + 1));
          return;
        }
        yield content;
      })()
    ) as ReadStream;
  }

  function createWriteStream(
    path: PathLike,
    options?: WriteStreamOptions
  ): WriteStream {
    const key = normalizeKey(path);
    const chunks: Buffer[] = [];

    const stream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(toBuffer(chunk));
        callback();
      },
      final: callback => {
        const content = Buffer.concat(chunks);
        const payload =
          (options?.encoding as string | undefined) &&
          (options.encoding as string) !== "buffer"
            ? content.toString(options.encoding)
            : content;
        void writeStoredFile(key, payload, options)
          .then(() => callback())
          .catch(error => callback(error as Error));
      }
    }) as WriteStream;

    return stream;
  }

  function createFileHandle(descriptor: number, key: string): FileHandle {
    const getDescriptor = () => {
      const current = openDescriptors.get(descriptor);
      if (!current) {
        throw createFsError("EBADF", "read", key);
      }
      return current;
    };

    return {
      fd: descriptor,
      async appendFile(
        data: string | Uint8Array,
        options?: WriteFileOptions | BufferEncodingOption | null
      ) {
        const current = await readStoredFile(key).catch(() => Buffer.alloc(0));
        const merged = Buffer.concat([
          toBuffer(current),
          toBuffer(typeof data === "string" ? data : encodeWriteValue(data))
        ]);
        await writeStoredFile(key, merged, options);
      },
      async chmod(_mode: Mode) {},
      async chown(_uid: number, _gid: number) {},
      async close() {
        openDescriptors.delete(descriptor);
      },
      createReadStream(options?: ReadStreamOptions) {
        return createReadStream(key, options);
      },
      createWriteStream(options?: WriteStreamOptions) {
        return createWriteStream(key, options);
      },
      async datasync() {},
      async read(
        buffer: Buffer,
        offset?: number,
        length?: number,
        position?: number | null
      ) {
        const current = getDescriptor();
        const encoding = undefined;
        const content = toBuffer(await readStoredFile(key, { encoding }));
        const readPosition = position ?? current.position;
        const readOffset = offset ?? 0;
        const readLength = length ?? buffer.length - readOffset;
        const bytesRead = content.copy(
          buffer,
          readOffset,
          readPosition,
          readPosition + readLength
        );
        if (position === null || position === undefined) {
          current.position += bytesRead;
        }
        return {
          bytesRead,
          buffer
        };
      },
      async readFile(options?: ReadFileOptions | BufferEncodingOption | null) {
        return readStoredFile(key, options);
      },
      async stat(
        _options?: StatOptions & {
          bigint?: false | undefined;
        }
      ) {
        return statPath(key);
      },
      async sync() {},
      async truncate(len = 0) {
        const content = toBuffer(await readStoredFile(key));
        await writeStoredFile(key, content.subarray(0, len));
      },
      async utimes(_atime: TimeLike, _mtime: TimeLike) {
        await storage.setMeta(key, {
          atime: new Date(_atime),
          mtime: new Date(_mtime)
        });
      },
      async write(
        buffer: Buffer,
        offset?: number,
        length?: number,
        position?: number | null
      ) {
        const current = getDescriptor();
        const content = toBuffer(await readStoredFile(key).catch(() => ""));
        const writeOffset = offset ?? 0;
        const writeLength = length ?? buffer.length - writeOffset;
        const writePosition = position ?? current.position;
        buffer.copy(
          content,
          writePosition,
          writeOffset,
          writeOffset + writeLength
        );
        await writeStoredFile(key, content);
        if (position === null || position === undefined) {
          current.position += writeLength;
        }
        return {
          bytesWritten: writeLength,
          buffer
        };
      },
      async writeFile(
        data: string | Uint8Array,
        options?: WriteFileOptions | BufferEncodingOption | null
      ) {
        await writeStoredFile(
          key,
          typeof data === "string" ? data : encodeWriteValue(data),
          options
        );
      }
    } as FileHandle;
  }

  const promises = {
    async access(path, mode = fsConstants.F_OK) {
      const entry = await getEntry(path, true);
      if (!entry) {
        throw createFsError("ENOENT", "access", normalizeKey(path));
      }

      if (mode & fsConstants.W_OK && entry.type === "directory") {
        throw createFsError("EISDIR", "access", normalizeKey(path));
      }
    },

    async appendFile(
      path,
      data,
      options?: WriteFileOptions | BufferEncodingOption | null
    ) {
      const key = normalizeKey(path);
      const current = await readStoredFile(key).catch(() => "");
      const merged = Buffer.concat([
        toBuffer(current),
        toBuffer(
          typeof data === "string"
            ? data
            : encodeWriteValue(data as NodeJS.ArrayBufferView)
        )
      ]);
      await writeStoredFile(key, merged, options);
    },

    async chmod(path, mode) {
      const key = normalizeKey(path);
      await requireEntry(key, true);
      await storage.setMeta(key, { mode });
    },

    async chown(path, uid, gid) {
      const key = normalizeKey(path);
      await requireEntry(key, true);
      await storage.setMeta(key, { uid, gid });
    },

    async copyFile(src, dest, _mode?: number) {
      await copyEntry(normalizeKey(src), normalizeKey(dest), false);
    },

    async cp(src, dest, options?: CopyOptions) {
      await copyEntry(
        normalizeKey(src),
        normalizeKey(dest),
        Boolean(options?.recursive)
      );
    },

    async glob(pattern, options?: GlobOptions | GlobOptionsWithFileTypes) {
      const cwd = normalizeKey(options?.cwd ?? ".");
      const keys = await storage.getKeys(cwd);
      const matches = keys
        .filter(key => !isMetaStorageKey(key))
        .filter(key => matchesGlobPattern(String(pattern), key));

      async function* iterator() {
        for (const match of matches) {
          if (options && "withFileTypes" in options && options.withFileTypes) {
            const entry = await getEntry(match, true);
            yield {
              name: basename(match),
              relative: match.slice(cwd.length).replace(/^\//, ""),
              absolute: match,
              isFile: () => entry?.type === "file",
              isDirectory: () => entry?.type === "directory",
              isSymbolicLink: () => entry?.type === "symlink"
            };
          } else {
            yield match;
          }
        }
      }

      return iterator();
    },

    async lchmod(path, mode) {
      await chmodPath(path, mode);
    },

    async lchown(path, uid, gid) {
      await chownPath(path, uid, gid);
    },

    async lutimes(path, atime, mtime) {
      const key = normalizeKey(path);
      await requireEntry(key, false);
      await storage.setMeta(key, {
        atime: new Date(atime),
        mtime: new Date(mtime)
      });
    },

    async link(existingPath, newPath) {
      const source = normalizeKey(existingPath);
      const destination = normalizeKey(newPath);
      const content = await readStoredFile(source);
      await writeStoredFile(
        destination,
        typeof content === "string" ? content : toBuffer(content)
      );
    },

    async lstat(
      path,
      _options?: StatOptions & {
        bigint?: false | undefined;
      }
    ) {
      return statPath(path, false);
    },

    async mkdir(path, options?: Mode | MakeDirectoryOptions | null) {
      return mkdirPath(path, options);
    },

    async mkdtemp(prefix, options?: ObjectEncodingOptions) {
      return mkdtempPath(prefix, options);
    },

    async mkdtempDisposable(prefix, options?: ObjectEncodingOptions) {
      const directory = await mkdtempPath(prefix, options);

      return {
        path: directory,
        async [Symbol.asyncDispose]() {
          await removePath(directory, { recursive: true, force: true });
        },
        [Symbol.dispose]() {
          runSync(async () =>
            removePath(directory, { recursive: true, force: true })
          );
        }
      };
    },

    async open(path, _flags?: OpenMode, _mode?: Mode) {
      const key = normalizeKey(path);
      await requireEntry(key, true).catch(async error => {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          await writeStoredFile(key, "");
          return;
        }
        throw error;
      });
      const descriptor = nextDescriptor++;
      openDescriptors.set(descriptor, { key, position: 0 });
      return createFileHandle(descriptor, key);
    },

    async opendir(path, options?: OpenDirOptions) {
      return createDir(path, options);
    },

    async readdir(
      path,
      options?:
        | BufferEncodingOption
        | (ObjectEncodingOptions & {
            withFileTypes?: false | undefined;
            recursive?: boolean | undefined;
          })
        | null
    ) {
      const key = normalizeKey(path);
      await requireEntry(key, true);
      const keys = await storage.getKeys(key);
      let children = getImmediateChildren(
        key,
        keys.filter(storageKey => !isMetaStorageKey(storageKey))
      );

      if (
        options &&
        typeof options === "object" &&
        "recursive" in options &&
        options.recursive
      ) {
        children = keys
          .filter(storageKey => !isMetaStorageKey(storageKey))
          .map(storageKey => storageKey.slice(key.length).replace(/^\//, ""))
          .filter(Boolean);
      }

      if (
        options &&
        typeof options === "object" &&
        "withFileTypes" in options &&
        options.withFileTypes
      ) {
        const entries = await Promise.all(
          children.map(async name => {
            const childPath = resolveKey(key, name);
            const entry = await getEntry(childPath, true);

            return {
              name,
              isFile: () => entry?.type === "file",
              isDirectory: () => entry?.type === "directory",
              isBlockDevice: () => false,
              isCharacterDevice: () => false,
              isSymbolicLink: () => entry?.type === "symlink",
              isFIFO: () => false,
              isSocket: () => false
            } as Dirent;
          })
        );

        return entries as unknown as Awaited<
          ReturnType<typeof promises.readdir>
        >;
      }

      if (
        options &&
        typeof options === "object" &&
        "encoding" in options &&
        (options.encoding as string | undefined) === "buffer"
      ) {
        return children.map(name => Buffer.from(name)) as unknown as Awaited<
          ReturnType<typeof promises.readdir>
        >;
      }

      return children as unknown as Awaited<
        ReturnType<typeof promises.readdir>
      >;
    },

    async readFile(
      path,
      options?: ReadFileOptions | BufferEncodingOption | null
    ) {
      return readStoredFile(path, options);
    },

    async readlink(
      path,
      options?: ObjectEncodingOptions | BufferEncodingOption | null
    ) {
      const key = normalizeKey(path);
      const entry = await requireEntry(key, false);
      if (entry.type !== "symlink") {
        throw createFsError("EINVAL", "readlink", key);
      }
      const target = entry.meta?.[SYMLINK_META_KEY];
      if (typeof target !== "string") {
        throw createFsError("EINVAL", "readlink", key);
      }
      if (
        options &&
        typeof options === "object" &&
        (options.encoding as string | undefined) === "buffer"
      ) {
        return Buffer.from(target) as Awaited<
          ReturnType<typeof promises.readlink>
        >;
      }
      return target as Awaited<ReturnType<typeof promises.readlink>>;
    },

    async realpath(
      path,
      options?: ObjectEncodingOptions | BufferEncodingOption | null
    ) {
      const resolved = resolveKey(path);
      const entry = await getEntry(resolved, true);
      if (!entry) {
        throw createFsError("ENOENT", "realpath", resolved);
      }
      if (
        options &&
        typeof options === "object" &&
        (options.encoding as string | undefined) === "buffer"
      ) {
        return Buffer.from(resolved) as Awaited<
          ReturnType<typeof promises.realpath>
        >;
      }
      return resolved as Awaited<ReturnType<typeof promises.realpath>>;
    },

    async rename(oldPath, newPath) {
      const source = normalizeKey(oldPath);
      const destination = normalizeKey(newPath);
      const entry = await requireEntry(source, true);

      if (entry.type === "directory") {
        const keys = await storage.getKeys(source);
        for (const key of keys) {
          if (isMetaStorageKey(key)) {
            continue;
          }
          const relative =
            key === source ? "" : key.slice(source.length).replace(/^\//, "");
          const target = relative
            ? resolveKey(destination, relative)
            : destination;
          if (key === source && (await storage.hasItem(key))) {
            const value = await storage.getItem(key);
            if (value != null) {
              await storage.setItem(target, value);
            }
          } else if (key !== source) {
            const value = await storage.getItem(key);
            if (value != null) {
              await storage.setItem(target, value);
            }
            const meta = await getMetaSafe(key);
            if (meta) {
              await storage.setMeta(target, meta);
            }
            await storage.removeItem(key);
          }
        }
        if (await storage.hasItem(source)) {
          await storage.removeItem(source);
        }
        return;
      }

      const content = await storage.getItem(source);
      if (content != null) {
        await storage.setItem(destination, content);
      }
      const meta = await getMetaSafe(source);
      if (meta) {
        await storage.setMeta(destination, meta);
      }
      await storage.removeItem(source);
    },

    async rm(path, options?: RmOptions) {
      await removePath(path, options);
    },

    async rmdir(path, options?: RmDirOptions) {
      await removePath(path, options);
    },

    async stat(
      path,
      _options?: StatOptions & {
        bigint?: false | undefined;
      }
    ) {
      return statPath(path);
    },

    async statfs(
      path,
      _options?: StatOptions & {
        bigint?: false | undefined;
      }
    ) {
      const keys = await storage.getKeys(normalizeKey(path));
      const stats = Object.create(Stats.prototype) as Stats;
      Object.assign(stats, {
        type: 0,
        bsize: 4096,
        blocks: keys.length,
        bfree: 0,
        bavail: 0,
        files: keys.length,
        ffree: 0
      });
      return stats as unknown as Awaited<ReturnType<typeof promises.statfs>>;
    },

    async symlink(target, path, _type?: string | null) {
      const key = normalizeKey(path);
      await storage.setMeta(key, {
        [SYMLINK_META_KEY]: normalizeKey(target),
        mtime: new Date(),
        atime: new Date()
      });
    },

    async truncate(path, len = 0) {
      const key = normalizeKey(path);
      const content = toBuffer(await readStoredFile(key));
      await writeStoredFile(key, content.subarray(0, len));
    },

    async unlink(path) {
      const key = normalizeKey(path);
      const entry = await getEntry(key, false);
      if (!entry) {
        throw createFsError("ENOENT", "unlink", key);
      }
      if (entry.type === "directory") {
        throw createFsError("EISDIR", "unlink", key);
      }
      await storage.removeItem(key);
    },

    async utimes(path, atime, mtime) {
      const key = normalizeKey(path);
      await requireEntry(key, true);
      await storage.setMeta(key, {
        atime: new Date(atime),
        mtime: new Date(mtime)
      });
    },

    async watch(path, options?: WatchOptions) {
      const key = normalizeKey(path);
      const unwatch = await storage.watch((event, watchedKey) => {
        if (watchedKey === key || watchedKey.startsWith(parentPrefix(key))) {
          const listener =
            typeof options === "function"
              ? options
              : (
                  options as {
                    listener?: (
                      event: WatchEventType,
                      filename: string
                    ) => void;
                  }
                ).listener;
          listener?.(event as WatchEventType, watchedKey);
        }
      });

      return {
        async close() {
          await unwatch();
        },
        [Symbol.asyncDispose]: async () => {
          await unwatch();
        }
      } as AsyncDisposable & { close: () => Promise<void> };
    },

    async writeFile(
      path,
      data,
      options?: WriteFileOptions | BufferEncodingOption | null
    ) {
      await writeStoredFile(
        path as PathLike,
        data as string | NodeJS.ArrayBufferView,
        options
      );
    }
  } as unknown as PromisesFileSystemInterface;

  async function openFd(
    path: PathLike,
    flags?: OpenMode,
    mode?: Mode
  ): Promise<number> {
    const handle = await promises.open(path, flags, mode);

    return handle.fd;
  }

  async function closeFd(fd: number): Promise<void> {
    if (!openDescriptors.has(fd)) {
      throw createFsError("EBADF", "close");
    }
    openDescriptors.delete(fd);
  }

  async function fstatFd(
    fd: number,
    _options?: StatOptions & { bigint?: false | undefined }
  ) {
    const descriptor = openDescriptors.get(fd);
    if (!descriptor) {
      throw createFsError("EBADF", "fstat");
    }
    return statPath(descriptor.key);
  }

  async function readFd(
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number | null
  ) {
    const descriptor = openDescriptors.get(fd);
    if (!descriptor) {
      throw createFsError("EBADF", "read");
    }
    const handle = createFileHandle(fd, descriptor.key);

    return handle.read(buffer, offset, length, position);
  }

  async function writeFd(
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number | null
  ) {
    const descriptor = openDescriptors.get(fd);
    if (!descriptor) {
      throw createFsError("EBADF", "write");
    }
    const handle = createFileHandle(fd, descriptor.key);

    return handle.write(buffer, offset, length, position);
  }

  async function ftruncateFd(fd: number, len = 0) {
    const descriptor = openDescriptors.get(fd);
    if (!descriptor) {
      throw createFsError("EBADF", "ftruncate");
    }
    await promises.truncate(descriptor.key, len);
  }

  async function futimesFd(fd: number, atime: TimeLike, mtime: TimeLike) {
    const descriptor = openDescriptors.get(fd);
    if (!descriptor) {
      throw createFsError("EBADF", "futimes");
    }
    await promises.utimes(descriptor.key, atime, mtime);
  }

  async function readvFd(
    fd: number,
    buffers: NodeJS.ArrayBufferView[],
    position?: number
  ): Promise<ReadVResult> {
    let offset = 0;
    let readPosition = position ?? openDescriptors.get(fd)?.position ?? 0;
    for (const view of buffers) {
      const buffer = Buffer.from(view.buffer, view.byteOffset, view.byteLength);
      const result = await readFd(fd, buffer, 0, buffer.length, readPosition);
      offset += result.bytesRead;
      readPosition += result.bytesRead;
    }
    return { bytesRead: offset, buffers };
  }

  async function writevFd(
    fd: number,
    buffers: NodeJS.ArrayBufferView[],
    position?: number
  ): Promise<WriteVResult> {
    const content = Buffer.concat(
      buffers.map(view =>
        Buffer.from(view.buffer, view.byteOffset, view.byteLength)
      )
    );
    const descriptor = openDescriptors.get(fd);
    if (!descriptor) {
      throw createFsError("EBADF", "writev");
    }
    const writePosition = position ?? descriptor.position;
    const existing = toBuffer(
      await readStoredFile(descriptor.key).catch(() => "")
    );
    content.copy(existing, writePosition);
    await writeStoredFile(descriptor.key, existing);
    if (position == null) {
      descriptor.position += content.byteLength;
    }
    return { bytesWritten: content.byteLength, buffers };
  }

  return {
    promises,
    createReadStream,
    createWriteStream,
    openFd,
    closeFd,
    fstatFd,
    readFd,
    writeFd,
    ftruncateFd,
    futimesFd,
    readvFd,
    writevFd
  };
}
