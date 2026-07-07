#!/usr/bin/env zx
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

import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { $, echo } from "zx";

const [, , repoUrl, name, subdir = ""] = process.argv;

if (!repoUrl || !name) {
  echo`Usage: vendor-grammar.mjs <repo_url> <name> [subdir]`;
  process.exit(1);
}

const grammarDir = path.join("crates/cbm/vendored/grammars", name);
const tmpDir = mkdtempSync(path.join(os.tmpdir(), "vendor-grammar-"));
const repoDir = path.join(tmpDir, "repo");

function copyFileIfExists(source, destination) {
  if (!existsSync(source)) {
    return false;
  }

  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination);
  return true;
}

function copyDirIfExists(source, destination) {
  if (!existsSync(source)) {
    return false;
  }

  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
  return true;
}

function copyFirstExisting(sources, destination) {
  for (const source of sources) {
    if (copyFileIfExists(source, destination)) {
      return true;
    }
  }

  return false;
}

async function main() {
  try {
    echo`Vendoring ${name} from ${repoUrl}...`;

    await $`git clone --depth 1 ${repoUrl} ${repoDir}`;

    const srcDir = subdir
      ? path.join(repoDir, subdir, "src")
      : path.join(repoDir, "src");
    const parserPath = path.join(srcDir, "parser.c");

    if (!existsSync(parserPath)) {
      throw new Error(`ERROR: ${parserPath} not found`);
    }

    mkdirSync(path.join(grammarDir, "tree_sitter"), { recursive: true });
    mkdirSync(grammarDir, { recursive: true });

    cpSync(parserPath, path.join(grammarDir, "parser.c"));

    const scannerCPath = path.join(srcDir, "scanner.c");
    const scannerCCPath = path.join(srcDir, "scanner.cc");

    if (existsSync(scannerCPath)) {
      cpSync(scannerCPath, path.join(grammarDir, "scanner.c"));
    }

    if (existsSync(scannerCCPath)) {
      echo`WARNING: ${name} has C++ scanner (scanner.cc) — needs special handling`;
    }

    const treeSitterDir = path.join(srcDir, "tree_sitter");
    if (existsSync(treeSitterDir)) {
      for (const entry of readdirSync(treeSitterDir)) {
        if (entry.endsWith(".h")) {
          cpSync(
            path.join(treeSitterDir, entry),
            path.join(grammarDir, "tree_sitter", entry)
          );
        }
      }
    }

    for (const entry of readdirSync(srcDir)) {
      if (entry.endsWith(".h") || entry.endsWith(".inc")) {
        cpSync(path.join(srcDir, entry), path.join(grammarDir, entry));
      }
    }

    if (existsSync(path.join(srcDir, "common"))) {
      copyDirIfExists(
        path.join(srcDir, "common"),
        path.join(grammarDir, "common")
      );
    }

    const repoRoot = repoDir;
    const licenseCandidates = subdir
      ? [
          path.join(repoRoot, subdir, "LICENSE"),
          path.join(repoRoot, "LICENSE"),
          path.join(repoRoot, "LICENSE.md"),
          path.join(repoRoot, "COPYING")
        ]
      : [
          path.join(repoRoot, "LICENSE"),
          path.join(repoRoot, "LICENSE.md"),
          path.join(repoRoot, "COPYING")
        ];

    if (
      !copyFirstExisting(licenseCandidates, path.join(grammarDir, "LICENSE"))
    ) {
      echo`WARNING: No LICENSE file found for ${name}`;
    }

    echo`Vendored ${name} to ${grammarDir}`;
    await $`ls -la ${grammarDir}`;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  echo`${error instanceof Error ? error.message : String(error)}`;
  process.exit(1);
});
