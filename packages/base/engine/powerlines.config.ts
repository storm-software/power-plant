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

import napi from "@powerlines/plugin-napi-rs";
import tsdown from "@powerlines/plugin-tsdown";
import type { UserConfig } from "powerlines";
import { defineConfig } from "powerlines/config";

const config: UserConfig = defineConfig({
  input: ["src/index.ts", "src/helpers/*.ts", "src/lib/*.ts"],
  platform: "node",
  output: {
    format: ["cjs", "esm"]
  },
  resolve: {
    external: ["@power-plant/bindings-*", "power-plant-bindings.*"],
    skipNodeModulesBundle: true
  },
  plugins: [
    tsdown(),
    napi({
      binaryName: "power-plant-bindings",
      packageName: "@power-plant/bindings",
      targets: [
        "x86_64-apple-darwin",
        "x86_64-pc-windows-msvc",
        "x86_64-unknown-linux-gnu",
        "x86_64-unknown-linux-musl",
        "x86_64-unknown-freebsd",
        "armv7-unknown-linux-gnueabihf",
        "aarch64-unknown-linux-gnu",
        "aarch64-apple-darwin",
        "aarch64-unknown-linux-musl",
        "aarch64-unknown-linux-ohos",
        "aarch64-pc-windows-msvc",
        "aarch64-linux-android",
        "wasm32-wasip1-threads",
        "s390x-unknown-linux-gnu",
        "powerpc64le-unknown-linux-gnu"
      ],
      wasm: {
        initialMemory: 16384,
        browser: {
          fs: true,
          asyncInit: true
        }
      },
      jsBinding: "bindings.cjs",
      dts: "bindings.d.cts",
      dtsHeader:
        "export type MaybePromise<T> = T | Promise<T>\nexport type Nullable<T> = T | null | undefined\ntype VoidNullable<T = void> = T | null | undefined | void\nexport type BindingStringOrRegex = string | RegExp\ntype BindingResult<T> = { errors: BindingError[], isBindingErrors: boolean } | T\n\n",
      npmDir: "npm",
      outputDir: "src",
      manifestPath: "crates/bindings/Cargo.toml"
    })
  ]
});

export default config;
