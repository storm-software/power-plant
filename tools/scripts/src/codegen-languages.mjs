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
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { argv, echo } from "zx";
import "zx/globals";

const UPSTREAM_BRANCHES = ["main", "master"];

/**
 * Generate boilerplate code for new tree-sitter language support.
 *
 * Reads tools/config/languages.json and generates:
 * 1. Grammar wrapper .c files (written directly)
 * 2. Enum entries for cbm.h
 * 3. Lang spec entries for lang_specs.c (designated initializer + factory)
 * 4. Extension/filename/name entries for language.c
 */

const mode = argv.mode || "all";

async function main() {
  const langs = JSON.parse(
    await readFile("tools/config/languages.json", "utf8")
  );
  const { langs: languagesWithNodeTypes, updated } = await addNodeTypes(langs);

  if (updated) {
    await writeFile(
      "tools/config/languages.json",
      `${JSON.stringify(languagesWithNodeTypes, null, 2)}\n`,
      "utf8"
    );
  }

  if (mode === "all" || mode === "wrappers") {
    await generateWrappers(languagesWithNodeTypes);
  }

  if (mode === "all" || mode === "enum") {
    generateEnum(languagesWithNodeTypes);
  }

  if (mode === "all" || mode === "specs") {
    generateSpecs(languagesWithNodeTypes);
  }

  if (mode === "all" || mode === "language") {
    generateLanguageC(languagesWithNodeTypes);
  }
}

async function addNodeTypes(langs) {
  let updated = false;
  const languagesWithNodeTypes = await Promise.all(
    langs.map(async lang => {
      const nodeTypesSourcePath = path.join(
        "crates/cbm/vendored/grammars",
        lang.name,
        "node-types.json"
      );

      if (!(await exists(nodeTypesSourcePath))) {
        return lang;
      }

      const nodeTypesPath = await resolveUpstreamNodeTypesPath(lang);

      if (!nodeTypesPath) {
        return lang;
      }

      if (lang.node_types === nodeTypesPath) {
        return lang;
      }

      updated = true;
      return {
        ...lang,
        node_types: nodeTypesPath
      };
    })
  );

  return { langs: languagesWithNodeTypes, updated };
}

async function resolveUpstreamNodeTypesPath(lang) {
  const repoSlug = getGithubRepoSlug(lang.repo);

  if (!repoSlug) {
    return null;
  }

  const candidates = getNodeTypesCandidates(lang.subdir);

  for (const branch of UPSTREAM_BRANCHES) {
    for (const candidate of candidates) {
      const rawUrl = `https://raw.githubusercontent.com/${repoSlug}/${branch}/${candidate}`;
      try {
        const response = await fetch(rawUrl, { method: "HEAD" });
        if (response.ok) {
          return candidate;
        }
      } catch {
        // Ignore transient network failures and try the next candidate.
      }
    }
  }

  return null;
}

function getGithubRepoSlug(repoUrl) {
  if (!repoUrl) {
    return null;
  }

  const match = repoUrl.match(
    /^https:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?\/?$/u
  );

  return match?.[1] ?? null;
}

function getNodeTypesCandidates(subdir) {
  const candidates = [];

  if (subdir) {
    candidates.push(`${subdir}/src/node-types.json`);
    candidates.push(`${subdir}/node-types.json`);
  }

  candidates.push("src/node-types.json");
  candidates.push("node-types.json");

  return [...new Set(candidates)];
}

async function generateWrappers(langs) {
  echo`--- Grammar Wrapper Files ---`;
  let created = 0;

  for (const lang of langs) {
    const outputPath = path.join(
      "crates/cbm/vendored",
      `grammar_${lang.name}.c`
    );

    if (await exists(outputPath)) {
      continue;
    }

    const lines = [
      `// Vendored tree-sitter grammar: ${lang.name}`,
      "// Each grammar compiled as separate unit (conflicting static symbols).",
      `#include "grammars/${lang.name}/parser.c"`
    ];

    if (lang.has_scanner) {
      lines.push(`#include "grammars/${lang.name}/scanner.c"`);
    }

    await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");
    created += 1;
  }

  echo`  Created ${created} wrapper files`;
}

function generateEnum(langs) {
  echo`--- Enum Entries (paste into cbm.h before CBM_LANG_KUSTOMIZE) ---`;

  for (const lang of langs) {
    echo`    CBM_LANG_${lang.enum},`;
  }
}

function generateSpecs(langs) {
  echo`\n--- Extern Declarations (paste at top of lang_specs.c) ---`;

  for (const lang of langs) {
    echo`extern const TSLanguage *${lang.ts_func}(void);`;
  }

  echo`\n--- Module Type Arrays (paste before spec table) ---`;

  for (const lang of langs) {
    const arr = `${lang.name}_module_types`;
    echo`static const char *${arr}[] = {"${lang.module_root}", NULL};`;
  }

  echo`\n--- Spec Table Entries (paste into lang_specs[]) ---`;

  for (const lang of langs) {
    const mod = `${lang.name}_module_types`;
    echo`    // CBM_LANG_${lang.enum}`;
    echo(
      `    [CBM_LANG_${lang.enum}] = {CBM_LANG_${lang.enum}, ` +
        `empty_types, empty_types, empty_types, ${mod}, ` +
        `empty_types, empty_types, empty_types, empty_types, ` +
        `empty_types, empty_types, empty_types, NULL, empty_types, ` +
        `NULL, NULL, ${lang.ts_func}},`
    );
    echo``;
  }
}

function generateLanguageC(langs) {
  echo`\n--- EXT_TABLE Entries (paste into language.c, sorted by ext) ---`;

  const extEntries = [];

  for (const lang of langs) {
    for (const ext of lang.extensions) {
      extEntries.push([ext, lang.enum, lang.display]);
    }
  }

  extEntries.sort((a, b) =>
    a[0].toLowerCase().localeCompare(b[0].toLowerCase())
  );

  for (const [ext, enumName, display] of extEntries) {
    echo`    /* ${display} */`;
    echo`    {"${ext}", CBM_LANG_${enumName}},`;
    echo``;
  }

  echo`\n--- FILENAME_TABLE Entries ---`;

  for (const lang of langs) {
    for (const filename of lang.filenames) {
      echo`    {"${filename}", CBM_LANG_${lang.enum}},`;
    }
  }

  echo`\n--- LANG_NAMES Entries ---`;

  for (const lang of langs) {
    echo`    [CBM_LANG_${lang.enum}] = "${lang.display}",`;
  }
}

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

await main();
