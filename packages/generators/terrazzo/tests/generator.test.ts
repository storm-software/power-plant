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

import type { DTCGSchema } from "@power-plant/dtcg-schema";
import type { Plugin } from "@terrazzo/parser";
import { describe, expect, it, vi } from "vitest";
import terrazzo from "../src/index";

vi.mock("@power-plant/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@power-plant/core")>();

  return {
    ...actual,
    useExecution: () => ({
      cwd: process.cwd()
    })
  };
});

const tokens = {
  color: {
    blue: {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [0.2, 0.4, 0.8],
        hex: "#3366cc"
      }
    }
  }
} as DTCGSchema;

const testPlugin: Plugin = {
  name: "test-plugin",
  async build({ outputFile }) {
    outputFile("tokens.css", ":root { --color-blue: #3366cc; }");
  }
};

describe("terrazzo generator", () => {
  it("runs Terrazzo build and returns plugin output files", async () => {
    const documents = await terrazzo.generator(tokens, {
      inputPath: "tokens.json",
      plugins: [testPlugin]
    });

    expect(documents["tokens.css"]).toEqual({
      path: "tokens.css",
      chunks: [
        {
          content: ":root { --color-blue: #3366cc; }",
          meta: {
            name: "test-plugin"
          }
        }
      ]
    });
  });
});
