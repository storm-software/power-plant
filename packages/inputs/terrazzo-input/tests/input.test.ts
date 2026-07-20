/* -------------------------------------------------------------------

                  🗲 Storm Software - Power Plant

 This code was released as part of the Power Plant project. Power Plant
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/power-plant.

    10| Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/power-plant
 Documentation:            https://docs.stormsoftware.com/projects/power-plant
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { defineConfig, parse } from "@terrazzo/parser";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { input } from "../src/input";
import { fromTokenNormalizedSet, toTokenFilename } from "../src/utilities";

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
  new URL("./fixtures/tokens.json", import.meta.url)
);

describe("toTokenFilename", () => {
  it("resolves relative string paths against cwd", () => {
    expect(toTokenFilename("./tokens.json", "/tmp").href).toBe(
      "file:///tmp/tokens.json"
    );
  });

  it("extracts the file path from file references", () => {
    expect(
      toTokenFilename(
        {
          file: "/absolute/tokens.json",
          exportName: "tokens"
        },
        "/tmp"
      ).href
    ).toBe("file:///absolute/tokens.json");
  });
});

describe("fromTokenNormalizedSet", () => {
  it("rebuilds a nested DTCG document from flat normalized tokens", async () => {
    const src = readFileSync(fixturePath, "utf8");
    const config = defineConfig(
      {},
      {
        cwd: pathToFileURL(process.cwd())
      }
    );
    const { tokens } = await parse(
      [
        {
          filename: pathToFileURL(fixturePath),
          src
        }
      ],
      { config }
    );

    expect(fromTokenNormalizedSet(tokens)).toMatchObject({
      color: {
        blue: {
          $type: "color",
          $value: {
            colorSpace: "srgb",
            components: [0.2, 0.4, 0.8],
            hex: "#3366cc"
          }
        }
      },
      space: {
        sm: {
          $type: "dimension",
          $value: {
            value: 8,
            unit: "px"
          }
        }
      }
    });
  });

  it("preserves curly-brace aliases and group metadata", async () => {
    const src = {
      color: {
        $type: "color",
        $description: "Color group",
        blue: {
          $value: {
            colorSpace: "srgb",
            components: [0.2, 0.4, 0.8],
            hex: "#3366cc"
          }
        },
        accent: {
          $value: "{color.blue}"
        }
      }
    };
    const config = defineConfig(
      {},
      {
        cwd: pathToFileURL(process.cwd())
      }
    );
    const { tokens } = await parse(
      [
        {
          filename: new URL("file:///tokens.json"),
          src
        }
      ],
      { config }
    );

    expect(fromTokenNormalizedSet(tokens)).toEqual({
      color: {
        $type: "color",
        $description: "Color group",
        blue: {
          $value: {
            colorSpace: "srgb",
            components: [0.2, 0.4, 0.8],
            hex: "#3366cc"
          }
        },
        accent: {
          $value: "{color.blue}"
        }
      }
    });
  });
});

describe("input", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and parses DTCG tokens from a JSON file", async () => {
    const tokens = await input({
      inputPath: fixturePath
    });

    expect(tokens).toMatchObject({
      color: {
        blue: {
          $type: "color",
          $value: {
            colorSpace: "srgb",
            components: [0.2, 0.4, 0.8],
            hex: "#3366cc"
          }
        }
      },
      space: {
        sm: {
          $type: "dimension",
          $value: {
            value: 8,
            unit: "px"
          }
        }
      }
    });
  });

  it("wraps parse failures with a descriptive error", async () => {
    await expect(
      input({
        inputPath: fileURLToPath(
          new URL("./fixtures/missing.json", import.meta.url)
        )
      })
    ).rejects.toThrow(/Failed to parse DTCG tokens from/);
  });
});
