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

import type { FileSystemInterface } from "@stryke/types/fs";
import type { Buffer } from "node:buffer";
import { EventEmitter } from "node:events";
import type { FSWatcher, PathLike } from "node:fs";
import * as nodeFs from "node:fs";
import { callbackify } from "node:util";
import type { Storage } from "unstorage";
import { normalizeKey, runSync } from "./helpers";
import { createStoragePromises } from "./promises";

function bindCallback<T extends (...args: never[]) => Promise<unknown>>(
  fn: T
): FileSystemInterface[keyof FileSystemInterface] {
  const callback = callbackify(
    fn
  ) as unknown as FileSystemInterface[keyof FileSystemInterface] & {
    __promisify__?: T;
  };
  callback.__promisify__ = fn;
  return callback;
}

function createNoopAsync(): () => Promise<void> {
  return async () => undefined;
}

function createNoopSync(): () => void {
  return () => undefined;
}

export function mapStorageToFileSystem(storage: Storage): FileSystemInterface {
  const core = createStoragePromises(storage);
  const { promises } = core;

  const globAsync = async (
    ...args: Parameters<typeof promises.glob>
  ): Promise<string[]> => {
    const iterator = promises.glob(...args) as AsyncIterableIterator<
      string | { absolute: string }
    >;
    const results: string[] = [];
    for await (const entry of iterator) {
      results.push(
        typeof entry === "string"
          ? entry
          : "absolute" in entry
            ? String(entry.absolute)
            : String(entry)
      );
    }
    return results;
  };

  const watchEmitter = (path: PathLike): FSWatcher => {
    const watcher = new EventEmitter() as FSWatcher;
    void storage
      .watch((event, key) => {
        const normalized = normalizeKey(path);
        if (key === normalized || key.startsWith(`${normalized}/`)) {
          watcher.emit("change", event, key);
        }
      })
      .then(unwatch => {
        watcher.on("close", () => {
          void unwatch();
        });
      });
    return watcher;
  };

  const fileSystem = {
    promises,

    access: bindCallback(promises.access),
    appendFile: bindCallback(promises.appendFile),
    chmod: bindCallback(promises.chmod),
    chown: bindCallback(promises.chown),
    close: bindCallback(core.closeFd),
    copyFile: bindCallback(promises.copyFile),
    cp: bindCallback(promises.cp),
    createReadStream: core.createReadStream,
    createWriteStream: core.createWriteStream,
    exists: ((path: PathLike, callback: (exists: boolean) => void) => {
      promises
        .access(path)
        .then(() => callback(true))
        .catch(() => callback(false));
    }) as FileSystemInterface["exists"],
    fchmod: bindCallback(createNoopAsync()),
    fchown: bindCallback(createNoopAsync()),
    fdatasync: bindCallback(createNoopAsync()),
    fstat: bindCallback(core.fstatFd),
    fsync: bindCallback(createNoopAsync()),
    ftruncate: bindCallback(core.ftruncateFd),
    futimes: bindCallback(core.futimesFd),
    glob: bindCallback(globAsync),
    lchmod: bindCallback(promises.lchmod),
    lchown: bindCallback(promises.lchown),
    lutimes: bindCallback(promises.lutimes),
    link: bindCallback(promises.link),
    lstat: bindCallback(promises.lstat),
    mkdir: bindCallback(promises.mkdir),
    mkdtemp: bindCallback(promises.mkdtemp),
    open: bindCallback(core.openFd),
    openAsBlob: bindCallback(async (path: PathLike) => {
      const content = await promises.readFile(path);

      return new Blob([content]);
    }),
    opendir: bindCallback(promises.opendir),
    read: bindCallback(core.readFd),
    readdir: bindCallback(promises.readdir),
    readFile: bindCallback(promises.readFile),
    readlink: bindCallback(promises.readlink),
    readv: bindCallback(core.readvFd),
    realpath: bindCallback(promises.realpath),
    rename: bindCallback(promises.rename),
    rmdir: bindCallback(promises.rmdir),
    rm: bindCallback(promises.rm),
    stat: bindCallback(promises.stat),
    statfs: bindCallback(promises.statfs),
    symlink: bindCallback(promises.symlink),
    truncate: bindCallback(promises.truncate),
    unlink: bindCallback(promises.unlink),
    unwatchFile: nodeFs.unwatchFile,
    utimes: bindCallback(promises.utimes),
    watch: ((path: PathLike, options?: unknown, listener?: unknown) => {
      const watcher = watchEmitter(path);
      const attachListener = (handler: (...args: unknown[]) => void) => {
        watcher.on("change", handler);
      };
      if (typeof options === "function") {
        attachListener(options as (...args: unknown[]) => void);
        return watcher;
      }
      if (typeof listener === "function") {
        attachListener(listener as (...args: unknown[]) => void);
      } else if (
        options &&
        typeof options === "object" &&
        "listener" in options &&
        typeof (options as { listener?: unknown }).listener === "function"
      ) {
        attachListener(
          (options as { listener: (...args: unknown[]) => void }).listener
        );
      }
      return watcher;
    }) as FileSystemInterface["watch"],
    watchFile: nodeFs.watchFile,
    write: bindCallback(core.writeFd),
    writeFile: bindCallback(promises.writeFile),
    writev: bindCallback(core.writevFd),

    accessSync: ((path, mode) =>
      runSync(async () =>
        promises.access(path, mode)
      )) as FileSystemInterface["accessSync"],
    appendFileSync: ((path, data, options) =>
      runSync(async () =>
        promises.appendFile(path as PathLike, data, options)
      )) as FileSystemInterface["appendFileSync"],
    chmodSync: ((path, mode) =>
      runSync(async () =>
        promises.chmod(path, mode)
      )) as FileSystemInterface["chmodSync"],
    chownSync: ((path, uid, gid) =>
      runSync(async () =>
        promises.chown(path, uid, gid)
      )) as FileSystemInterface["chownSync"],
    closeSync: (fd =>
      runSync(async () =>
        core.closeFd(fd)
      )) as FileSystemInterface["closeSync"],
    copyFileSync: ((src, dest, mode) =>
      runSync(async () =>
        promises.copyFile(src, dest, mode)
      )) as FileSystemInterface["copyFileSync"],
    cpSync: ((src, dest, options) =>
      runSync(async () =>
        promises.cp(src, dest, options)
      )) as FileSystemInterface["cpSync"],
    existsSync: (path => {
      try {
        runSync(async () => promises.access(path));
        return true;
      } catch {
        return false;
      }
    }) as FileSystemInterface["existsSync"],
    fchmodSync: createNoopSync() as FileSystemInterface["fchmodSync"],
    fchownSync: createNoopSync() as FileSystemInterface["fchownSync"],
    fdatasyncSync: createNoopSync() as FileSystemInterface["fdatasyncSync"],
    fstatSync: ((fd, options) =>
      runSync(async () =>
        core.fstatFd(fd, options as never)
      )) as FileSystemInterface["fstatSync"],
    fsyncSync: createNoopSync() as FileSystemInterface["fsyncSync"],
    ftruncateSync: ((fd, len) =>
      runSync(async () =>
        core.ftruncateFd(fd, len)
      )) as FileSystemInterface["ftruncateSync"],
    futimesSync: ((fd, atime, mtime) =>
      runSync(async () =>
        core.futimesFd(fd, atime, mtime)
      )) as FileSystemInterface["futimesSync"],
    globSync: ((pattern, options) =>
      runSync(async () =>
        globAsync(pattern, options as never)
      )) as FileSystemInterface["globSync"],
    lchmodSync: ((path, mode) =>
      runSync(async () =>
        promises.lchmod(path, mode)
      )) as FileSystemInterface["lchmodSync"],
    lchownSync: ((path, uid, gid) =>
      runSync(async () =>
        promises.lchown(path, uid, gid)
      )) as FileSystemInterface["lchownSync"],
    lutimesSync: ((path, atime, mtime) =>
      runSync(async () =>
        promises.lutimes(path, atime, mtime)
      )) as FileSystemInterface["lutimesSync"],
    linkSync: ((existingPath, newPath) =>
      runSync(async () =>
        promises.link(existingPath, newPath)
      )) as FileSystemInterface["linkSync"],
    lstatSync: ((path, options) =>
      runSync(async () =>
        promises.lstat(path, options as never)
      )) as FileSystemInterface["lstatSync"],
    mkdirSync: ((path, options) =>
      runSync(async () =>
        promises.mkdir(path, options)
      )) as FileSystemInterface["mkdirSync"],
    mkdtempSync: ((prefix, options) =>
      runSync(async () =>
        promises.mkdtemp(prefix, options as never)
      )) as FileSystemInterface["mkdtempSync"],
    openSync: ((path, flags, mode) =>
      runSync(async () =>
        core.openFd(path, flags, mode ?? undefined)
      )) as FileSystemInterface["openSync"],
    opendirSync: ((path, options) =>
      runSync(async () =>
        promises.opendir(path, options)
      )) as FileSystemInterface["opendirSync"],
    readdirSync: ((path, options) =>
      runSync(async () =>
        promises.readdir(path, options as never)
      )) as FileSystemInterface["readdirSync"],
    readFileSync: ((path, options) =>
      runSync(async () =>
        promises.readFile(path as never, options as never)
      )) as FileSystemInterface["readFileSync"],
    readlinkSync: ((path, options) =>
      runSync(async () =>
        promises.readlink(path, options as never)
      )) as FileSystemInterface["readlinkSync"],
    readSync: ((fd, buffer, offset, length, position) =>
      runSync(async () =>
        core.readFd(
          fd,
          buffer as Buffer,
          offset ?? 0,
          length ?? buffer.byteLength,
          position == null ? null : Number(position)
        )
      ).bytesRead) as FileSystemInterface["readSync"],
    readvSync: ((fd, buffers, position) =>
      runSync(async () => core.readvFd(fd, [...buffers], position))
        .bytesRead) as FileSystemInterface["readvSync"],
    realpathSync: ((path, options) =>
      runSync(async () =>
        promises.realpath(path, options as never)
      )) as FileSystemInterface["realpathSync"],
    renameSync: ((oldPath, newPath) =>
      runSync(async () =>
        promises.rename(oldPath, newPath)
      )) as FileSystemInterface["renameSync"],
    rmdirSync: (path =>
      runSync(async () =>
        promises.rm(path, { recursive: false })
      )) as FileSystemInterface["rmdirSync"],
    rmSync: ((path, options) =>
      runSync(async () =>
        promises.rm(path, options)
      )) as FileSystemInterface["rmSync"],
    statSync: ((path, options) =>
      runSync(async () =>
        promises.stat(path, options as never)
      )) as FileSystemInterface["statSync"],
    statfsSync: ((path, options) =>
      runSync(async () =>
        promises.statfs(path, options as never)
      )) as FileSystemInterface["statfsSync"],
    symlinkSync: ((target, path, type) =>
      runSync(async () =>
        promises.symlink(target, path, type)
      )) as FileSystemInterface["symlinkSync"],
    truncateSync: ((path, len) =>
      runSync(async () =>
        promises.truncate(path, len)
      )) as FileSystemInterface["truncateSync"],
    unlinkSync: (path =>
      runSync(async () =>
        promises.unlink(path)
      )) as FileSystemInterface["unlinkSync"],
    utimesSync: ((path, atime, mtime) =>
      runSync(async () =>
        promises.utimes(path, atime, mtime)
      )) as FileSystemInterface["utimesSync"],
    writeFileSync: ((file, data, options) =>
      runSync(async () =>
        promises.writeFile(file as PathLike, data, options)
      )) as FileSystemInterface["writeFileSync"],
    writeSync: ((fd, buffer, offset, length, position) =>
      runSync(async () =>
        core.writeFd(
          fd,
          buffer as Buffer,
          offset ?? 0,
          length ?? buffer.byteLength,
          position == null ? null : Number(position)
        )
      ).bytesWritten) as FileSystemInterface["writeSync"],
    writevSync: ((fd, buffers, position) =>
      runSync(async () => core.writevFd(fd, [...buffers], position))
        .bytesWritten) as FileSystemInterface["writevSync"]
  };

  return fileSystem as unknown as FileSystemInterface;
}

export { normalizeKey } from "./helpers";
export { createStoragePromises } from "./promises";
