#!/usr/bin/env bash
# Pre-deploy gate for Mythika UI invariants.
# Run from ANYWHERE: paths resolve relative to this script.
# Fails loudly (never silently passes): a zero-file scan is an error.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$(cd "$SCRIPT_DIR/../src" && pwd)"

if [ ! -d "$SRC_DIR" ]; then
  echo "FAIL: src dir not found at $SRC_DIR"
  exit 1
fi

FAIL=0

# ── 1. Syntax check: every src/**/*.js must pass node --check ──────────
echo "=== Checking JavaScript syntax ==="
COUNT=0
while IFS= read -r f; do
  COUNT=$((COUNT + 1))
  if ! node --check "$f" > /dev/null 2>&1; then
    echo "FAIL: syntax error in $f"
    FAIL=1
  fi
done < <(find "$SRC_DIR" -name '*.js' -type f | sort)
if [ "$COUNT" -eq 0 ]; then
  echo "FAIL: no JS files found under $SRC_DIR (scan misconfigured)"
  FAIL=1
else
  echo "checked $COUNT files"
fi

# ── 2. Invariant: no raw unanchored spring back-translate ──────────────
echo "=== Checking for raw centered-scale back-translate patterns ==="
echo "(all spring scaling must go through R.withCenteredScale)"
# ONLY the buggy half-size forms are forbidden. The correct full-center
# form must live inside the helper — raw copies anywhere fail this gate.
PATTERNS=(
  "translate\(-bw/2"
  "translate\(-bh/2"
  "translate\(-this\.w/2"
  "translate\(-this\.h/2"
)

while IFS= read -r f; do
  for pat in "${PATTERNS[@]}"; do
    if grep -n -E "$pat" "$f" > /dev/null 2>&1; then
      echo "FAIL: forbidden pattern in $f: $pat"
      FAIL=1
    fi
  done
done < <(find "$SRC_DIR" -name '*.js' -type f | sort)

# ── Summary ────────────────────────────────────────────────────────────
if [ "$FAIL" -ne 0 ]; then
  echo "INVARIANTS VIOLATED – see errors above."
  exit 1
fi
echo "All checks passed."
exit 0
