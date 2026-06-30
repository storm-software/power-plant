#!/usr/bin/env bash
set -eo pipefail

BOOK_ROOT="$(dirname "$(dirname "$0")")"
POWER_PLANT=${1:-"$(dirname "$BOOK_ROOT")/target/debug/power-plant"}

cmd=(
  "$(dirname "$0")/help.py"
  --root-dir "$BOOK_ROOT/"
  --root-indentation 2
  --root-summary
  --out-dir "$BOOK_ROOT/cli/"
  "$POWER_PLANT"
)
echo "Running: $" "${cmd[*]}"
"${cmd[@]}"
