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

import { $, argv, chalk, echo } from "zx";

try {
  let target = argv.target;
  if (!target) {
    target = process.env.NATIVE_TARGET;
  }
  let buildFlags = argv.buildFlags;
  if (!buildFlags) {
    buildFlags = process.env.NATIVE_BUILD_FLAGS;
  }

  echo`${chalk.whiteBright(
    ` 🏗️  Building the Power Plant native ${target} artifacts${
      buildFlags ? ` with build flags: "${buildFlags}"` : ""
    }...`
  )}`;

  $.cwd = "packages/base/bindings";

  const proc =
    $`pnpm exec napi build --release --cwd ./src --manifest-path ../../../../crates/bindings/Cargo.toml --package-json-path ../package.json --target ${target} ${buildFlags}`.timeout(
      `${15 * 60}s`
    );
  proc.stdout.on("data", data => {
    echo`${data}`;
  });
  const result = await proc;
  if (result.exitCode !== 0) {
    throw new Error(
      `An error occurred while building the Power Plant native ${target} artifacts: \n\n${
        result.message
      }\n`
    );
  }

  echo`${chalk.green(
    ` ✔ Successfully built the Power Plant native ${target} artifacts!`
  )}\n`;
} catch (error) {
  echo`${chalk.red(error?.message ? error.message : "A failure occurred while building the Power Plant native artifacts")}`;

  process.exit(1);
}
