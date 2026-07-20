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

import type { Tokens } from "@power-plant/dtcg-schema";
import { formats, transformGroups } from "style-dictionary/enums";
import { describe, expect, it, vi } from "vitest";
import styleDictionary from "../src/index";

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
      $value: "#3366cc"
    }
  }
} as Tokens;

describe("style-dictionary generator", () => {
  it("runs Style Dictionary formatAllPlatforms and returns output files", async () => {
    const documents = await styleDictionary.generator(tokens, {
      inputPath: "tokens.json",
      platforms: {
        css: {
          transformGroup: transformGroups.css,
          files: [
            {
              destination: "variables.css",
              format: formats.cssVariables
            }
          ]
        }
      }
    });

    expect(documents["variables.css"]).toEqual({
      path: "variables.css",
      chunks: [
        {
          content: expect.stringContaining("--color-blue: #3366cc"),
          meta: {
            name: "css"
          }
        }
      ]
    });
  });
});
