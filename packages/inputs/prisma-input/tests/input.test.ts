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

import { prismaSchema } from "@power-plant/prisma-schema";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { input } from "../src/input";
import { toAbsolutePath, toSchemaFiles } from "../src/utilities";

vi.mock("@power-plant/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@power-plant/core")>();

  return {
    ...actual,
    useExecution: () => ({
      cwd: process.cwd()
    })
  };
});

const fixturePath = fileURLToPath(
  new URL("./fixtures/schema.prisma", import.meta.url)
);

describe("toAbsolutePath", () => {
  it("resolves relative paths against cwd", () => {
    expect(toAbsolutePath("./schema.prisma", "/tmp")).toBe(
      "/tmp/schema.prisma"
    );
  });

  it("keeps absolute paths unchanged", () => {
    expect(toAbsolutePath("/abs/schema.prisma", "/tmp")).toBe(
      "/abs/schema.prisma"
    );
  });
});

describe("toSchemaFiles", () => {
  it("pairs paths with file contents", () => {
    const contents = new Map([["/a.prisma", "model A {}"]]);

    expect(toSchemaFiles(["/a.prisma"], contents)).toEqual([
      ["/a.prisma", "model A {}"]
    ]);
  });
});

describe("input", () => {
  it("loads a Prisma schema file into a DMMF document", async () => {
    const dmmf = await input({
      inputPath: fixturePath
    });

    expect(prismaSchema.safeParse(dmmf).success).toBe(true);
    expect(dmmf.datamodel.models.map(model => model.name)).toEqual(["User"]);
  });

  it("wraps load failures with a descriptive error", async () => {
    await expect(
      input({
        inputPath: fileURLToPath(
          new URL("./fixtures/missing.prisma", import.meta.url)
        )
      })
    ).rejects.toThrow(/Failed to load Prisma schema from/);
  });
});
