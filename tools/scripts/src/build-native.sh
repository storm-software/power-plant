#!/usr/bin/env bash
# -------------------------------------------------------------------
#
#                   🗲 Storm Software - Power Plant
#
#  This code was released as part of the Power Plant project. Power Plant
#  is maintained by Storm Software under the Apache-2.0 license, and is
#  free for commercial and private use. For more information, please visit
#  our licensing page at https://stormsoftware.com/licenses/projects/power-plant.
#
#  Website:                  https://stormsoftware.com
#  Repository:               https://github.com/storm-software/power-plant
#  Documentation:            https://docs.stormsoftware.com/projects/power-plant
#  Contact:                  https://stormsoftware.com/contact
#
#  SPDX-License-Identifier:  Apache-2.0
#
# -------------------------------------------------------------------

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

target="${NATIVE_TARGET:-}"
build_flags="${NATIVE_BUILD_FLAGS:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      target="$2"
      shift 2
      ;;
    --target=*)
      target="${1#*=}"
      shift
      ;;
    --buildFlags)
      build_flags="$2"
      shift 2
      ;;
    --buildFlags=*)
      build_flags="${1#*=}"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

build_flags_arg=""
if [[ -n "$build_flags" ]]; then
  build_flags_arg=" $build_flags"
fi

command="pnpm exec napi build --release${build_flags_arg} --cwd=\"./src\" --manifest-path=\"../../../../crates/bindings/Cargo.toml\" --package-json-path=\"../package.json\" --target=\"${target}\""

printf '\033[1;37m 🏗️  Building the Power Plant native %s artifacts - running command: \n%s\n\033[0m\n' "$target" "$command"

cd "$REPO_ROOT/packages/base/bindings"

set +e
if command -v timeout > /dev/null 2>&1; then
  # shellcheck disable=SC2086
  timeout 15m pnpm exec napi build --release${build_flags_arg} \
    --cwd="./src" \
    --manifest-path="../../../../crates/bindings/Cargo.toml" \
    --package-json-path="../package.json" \
    --target="$target"
  exit_code=$?
else
  # shellcheck disable=SC2086
  pnpm exec napi build --release${build_flags_arg} \
    --cwd="./src" \
    --manifest-path="../../../../crates/bindings/Cargo.toml" \
    --package-json-path="../package.json" \
    --target="$target"
  exit_code=$?
fi
set -e

if [[ $exit_code -ne 0 ]]; then
  printf '\033[31mAn error occurred while building the Power Plant native %s artifacts\033[0m\n' "$target" >&2
  exit 1
fi

printf '\033[32m ✔ Successfully built the Power Plant native %s artifacts!\033[0m\n\n' "$target"
