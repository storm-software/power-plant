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

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import contentCollections from "../src/index";

const tempDirs: string[] = [];

vi.mock("@power-plant/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@power-plant/core")>();

  return {
    ...actual,
    useExecution: () => ({
      cwd: (globalThis as { __contentCollectionsCwd?: string })
        .__contentCollectionsCwd
    })
  };
});

afterEach(async () => {
  delete (globalThis as { __contentCollectionsCwd?: string })
    .__contentCollectionsCwd;

  await Promise.all(
    tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))
  );
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "power-plant-cc-test-"));
  tempDirs.push(root);

  const postsDir = join(root, "content", "posts");
  await mkdir(postsDir, { recursive: true });
  await writeFile(
    join(postsDir, "hello.md"),
    `---
title: Hello World
summary: First post
---

# Hello World

Body copy.
`,
    "utf8"
  );

  (globalThis as { __contentCollectionsCwd?: string }).__contentCollectionsCwd =
    root;

  return root;
}

describe("content-collections generator", () => {
  it("passes a Zod schema to defineCollection and returns allPosts hooks", async () => {
    const root = await createFixture();
    const outputDir = join(root, "generated");

    const documents = await contentCollections.generator(
      z.object({
        title: z.string(),
        summary: z.string(),
        content: z.string()
      }),
      {
        name: "posts",
        directory: "content/posts",
        include: "**/*.md",
        outputDir,
        cacheDir: join(root, "cache")
      }
    );

    expect(documents["index.js"]?.chunks?.[0]?.content).toContain("allPosts");
    expect(documents["allPosts.js"]?.chunks?.[0]?.content).toContain(
      "Hello World"
    );
  });

  it("accepts a JSON Schema document schema", async () => {
    const root = await createFixture();
    const outputDir = join(root, "generated-json");

    const documents = await contentCollections.generator(
      {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          content: { type: "string" }
        },
        required: ["title", "summary", "content"]
      },
      {
        name: "posts",
        directory: "content/posts",
        include: "**/*.md",
        outputDir,
        cacheDir: join(root, "cache-json")
      }
    );

    expect(Object.keys(documents)).toEqual(
      expect.arrayContaining(["index.js", "allPosts.js"])
    );
  });
});
