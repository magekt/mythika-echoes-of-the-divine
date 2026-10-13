# Phase 36 Verification

**Phase:** 36-ship-readiness
**Requirements:** SHP-01, SHP-02, SHP-03, SHP-04
**Date:** 2026-10-10 (live-browser addendum 2026-10-11)
**Status:** All automated contracts green; live-browser check DONE 2026-10-11 (see Live Addendum)

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

- ~~Live-browser zero-warning check (SC4 item 4): requires Chrome; consistent with v2.0–v5.0 accepted residual.~~ CLOSED by Live Addendum below.
- `?debug` live reachability not exercised in Node tests (requires browser); gate code verified by source inspection.

## Live Addendum (2026-10-11, real Chrome headless, fresh profile, prod URL)

- `tools/verify_matrix.py --budget 6000`: all 3 profiles booted clean (boot beacon + no uncaught errors).
- FPS probe: measured 60 (need >= 20).
- Direct CDP session, fresh profile, no `?probe`/`?debug`: console shows zero warnings and
  zero errors — only info logs (`booted dpr=1`, `booted scene=title`, `Firebase initialized`,
  `Signed out`). Audit fix: the `debug`-entry `console.warn` in `src/main.js` fired on every
  prod boot; now skipped for the intentionally-ungated `debug` entry (gate behavior unchanged).
- Title screenshot visually confirmed (wordmark, dragon moment, New Game button).

## Production defects fixed by this phase
1. Noisy Firebase 404 warning on every GitHub Pages load (SHF-02)
2. Debug scene reachable from Ashram nav in prod (SHP-03)
