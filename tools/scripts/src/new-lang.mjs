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

import { constants as fsConstants } from "node:fs";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { $, argv, chalk, echo } from "zx";

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copyFileIfExists(source, destination) {
  if (!(await exists(source))) {
    return false;
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination);
  return true;
}

async function copyDirIfExists(source, destination) {
  if (!(await exists(source))) {
    return false;
  }

  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
  return true;
}

async function copyFirstExisting(sources, destination) {
  for (const source of sources) {
    if (await copyFileIfExists(source, destination)) {
      return true;
    }
  }

  return false;
}

function pascalCase(str) {
  return str.replace(/(^|_)([a-z])/g, (_, __, letter) => letter.toUpperCase());
}

function snakeCase(str) {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function titleCase(str) {
  return str
    .replace(/(^|_)([a-z])/g, (_, __, letter) => letter.toUpperCase())
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function constantCase(str) {
  return str.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

async function main(repository, name) {
  const tempPath = await mkdtemp(path.join(os.tmpdir(), "grammar-"));
  const clonePath = path.join(tempPath, "repo");

  try {
    await $`git clone --depth 1 ${repository} ${clonePath}`;

    const grammarPath = path.join(
      process.cwd(),
      "crates/tree-sitter/grammars",
      name
    );
    const srcDir = path.join(clonePath, "src");
    const parserPath = path.join(srcDir, "parser.c");

    await mkdir(path.join(grammarPath, "tree_sitter"), { recursive: true });
    await mkdir(grammarPath, { recursive: true });

    await cp(parserPath, path.join(grammarPath, "parser.c"));

    const scannerPath = path.join(srcDir, "scanner.c");
    if (await exists(scannerPath)) {
      await cp(scannerPath, path.join(grammarPath, "scanner.c"));
    }

    const treeSitterDir = path.join(srcDir, "tree_sitter");
    if (await exists(treeSitterDir)) {
      for (const entry of await readdir(treeSitterDir)) {
        if (entry.endsWith(".h")) {
          await cp(
            path.join(treeSitterDir, entry),
            path.join(grammarPath, "tree_sitter", entry)
          );
        }
      }
    }

    for (const entry of await readdir(srcDir)) {
      if (entry.endsWith(".h") || entry.endsWith(".inc")) {
        await cp(path.join(srcDir, entry), path.join(grammarPath, entry));
      }
    }

    if (await exists(path.join(srcDir, "common"))) {
      await copyDirIfExists(
        path.join(srcDir, "common"),
        path.join(grammarPath, "common")
      );
    }

    // Add logic to get node-types.json from the repository
    const nodeTypesPath = path.join(clonePath, "src/node-types.json");

    let hasNodeTypes = false;
    if (await exists(nodeTypesPath)) {
      hasNodeTypes = true;
      await cp(nodeTypesPath, path.join(grammarPath, "node-types.json"));
    } else {
      echo`${chalk.yellow(`WARNING: No node-types.json file found for ${name}`)}\n`;
    }

    const queriesPath = path.join(clonePath, "queries");

    let hasQueries = false;
    if (await exists(queriesPath)) {
      hasQueries = true;
      await cp(queriesPath, path.join(grammarPath, "queries"));
    } else {
      echo`${chalk.yellow(`WARNING: No queries directory found for ${name}`)}\n`;
    }

    const repoRoot = clonePath;
    const licenseCandidates = [
      path.join(repoRoot, "LICENSE"),
      path.join(repoRoot, "LICENSE.md"),
      path.join(repoRoot, "COPYING")
    ];

    if (
      !(await copyFirstExisting(
        licenseCandidates,
        path.join(grammarPath, "LICENSE")
      ))
    ) {
      echo`${chalk.yellow(`WARNING: No LICENSE file found for ${name}`)}\n`;
    }

    echo`Added the grammar for ${name} from ${repository} to the repository at ${grammarPath}\n`;
    await $`ls -la ${grammarPath}`;

    const language = {
      name,
      repository,
      grammarPath,
      enum_name: constantCase(name),
      display_name: titleCase(name),
      pascal_name: pascalCase(name),
      ts_function: `tree_sitter_${snakeCase(name)}`,
      sub_directory: "",
      extensions: [],
      filenames: [],
      has_scanner: false,
      module_root: "source_file"
    };
    if (hasNodeTypes) {
      language.node_types = "src/node-types.json";
    }
    if (hasQueries) {
      language.queries = "queries";
    }

    const languagesJsonPath = path.join(
      process.cwd(),
      "tools/tree-sitter/languages.json"
    );
    const languagesJson = JSON.parse(await readFile(languagesJsonPath, "utf8"));
    languagesJson.push(language);
    await writeFile(
      languagesJsonPath,
      JSON.stringify(languagesJson, null, 2),
      "utf8"
    );
  } finally {
    await rm(tempPath, { recursive: true, force: true });
  }
}

try {
  let repository =
    argv.repo || argv.repository || argv.repoUrl || argv.repositoryUrl;
  let name = argv.name || argv.grammarName || argv.grammar;

  if (!repository || !name) {
    repository = argv[0];
    name = argv[1];

    if (!repository || !name) {
      let message = "";
      if (!repository) {
        message += "- No repository URL provided\n";
      } else if (/^.*\/tree-sitter-[a-zA-Z0-9]+$/.test(repository)) {
        name = repository.match(/^.*\/tree-sitter-(.*)$/)[1];
      }

      if (!repository || !name) {
        if (!name) {
          message += "- No name provided\n";
        }

        message = `Invalid Arguments provided:\n${message}\n`;
        message += `Usage: pnpm new-lang <repository_url> <name> or pnpm new-lang <repository_url> or pnpm new-lang --repo <repository_url> --name <name> or pnpm new-lang --repo <repository_url>`;
        throw new Error(message);
      }
    }
  }

  echo`${chalk.whiteBright(
    ` 📝  Adding the Tree-Sitter grammar for ${name} from ${repository} to the repository...\n`
  )}`;

  await main(repository, name);

  echo`${chalk.green(
    ` ✔ Successfully added the grammar for ${name} from ${repository} to the repository!\n`
  )}`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while adding the grammar to the repository")}`;

  process.exit(1);
}
