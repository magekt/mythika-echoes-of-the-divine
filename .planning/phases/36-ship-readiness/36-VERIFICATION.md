# Phase 36 Verification

**Phase:** 36-ship-readiness
**Requirements:** SHP-01, SHP-02, SHP-03, SHP-04
**Date:** 2026-10-10
**Status:** All automated contracts green; SC4 live-browser check deferred (same precedent as v2.0–v5.0)

## Automated

- `node --test tests/*.test.js` — 449/449 passed
- `tools/check_ui_invariants.sh` — all passed
- `node --check src/main.js` — clean
- `node --check src/scenes/ashram.js` — clean

## SHP-01 — LICENSE + SPDX ✓
- `LICENSE` exists at repo root (MIT, 2026, kt.rule@gmail.com)
- `index.html` line 1: `<!-- SPDX-License-Identifier: MIT -->`
- `src/main.js` line 1: `// SPDX-License-Identifier: MIT`

## SHP-02 — Firebase silent in prod ✓
- `index.html:92-97`: catch block warns only when `?probe` in URL; `window.firebaseReady=false` set silently

## SHP-03 — Debug gate ✓
- `src/main.js:61`: debug scene only registered when `/debug/` in URL
- `src/scenes/ashram.js`: Debug nav button only appears when `?debug` in URL

## SHP-04 — Console clean ✓
- Firebase warning: gated behind ?probe
- Debug entry: not in prod nav
- No other unconditional console.error/warn in boot path (verified in index.html + main.js)

## Deferred

- Live-browser zero-warning check (SC4 item 4): requires Chrome; consistent with v2.0–v5.0 accepted residual.
- `?debug` live reachability not exercised in Node tests (requires browser); gate code verified by source inspection.

## Production defects fixed by this phase
1. Noisy Firebase 404 warning on every GitHub Pages load (SHF-02)
2. Debug scene reachable from Ashram nav in prod (SHP-03)
