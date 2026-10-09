# Phase 21 Verification

**Phase:** 21-browser-evidence-catch-up
**Requirement:** EVD-01
**Date:** 2026-10-09
**Chrome:** /Applications/Google Chrome.app/Contents/MacOS/Google Chrome (default detection; same binary as MYTHIKA_CHROME pin)
**Status:** Harness green; journey matrix pending (Plan 02)

## Headless Harness Evidence (measured 2026-10-09)

`python3 tools/verify_matrix.py --budget 6000` → `RESULT: all 3 profiles booted clean`

| Profile | Viewport | Boot beacon | Uncaught errors | Screenshot |
|---------|----------|-------------|-----------------|------------|
| desktop | 1280x1400@1x | found (`[Mythika] booted dpr=1`, scene=title) | none | tools/shots/desktop.png |
| phone | 390x844@3x | found | none | tools/shots/phone.png |
| phone-land | 844x390@3x | found | none | tools/shots/phone-land.png |

Supporting gates (same run): full Node suite 202/202 pass; `tools/check_ui_invariants.sh` all passed; `git diff --check` clean.

### Defects found by the harness (fixed during Plan 01 triage)
Initial run: all 3 profiles FAILED with uncaught errors. Console capture identified:
1. `index.html:33` — inline probe script regex missing its closing slash (`/\/src\/.test`); every `__mythikaProbeGroup()` call threw in turn. Fixed: `/\/src\//.test`.
2. `src/ui/feedback.js:1` — `const UI` redeclared `src/ui/button.js:3`'s `const UI` (classic scripts share scope). Fixed: attach via `globalThis.UI`, no local declaration.
3. `src/ui/feedback.js:238` — `globalThis.R || {}` snapshot empty because engine `const` globals never attach to `globalThis`; `R.colors` undefined at IIFE time. Fixed: use lexical engine globals at call time like every other file; updated `tests/feedback.test.js` harness (which had masked the bug by bridging globals the browser never sets).

Re-run after fixes: all 3 profiles booted clean. `node --test tests/*.test.js` 202/202; invariants green.

## Journey Matrix (DEFERRED 2026-10-09 — Plan 02)

Manual 10-combination journey presented to user; no evidence returned on re-invoked autonomous run. Rows remain pending below; Phase 21 closes on harness evidence per fix-or-defer triage discretion. Re-running the journey later only needs this table.

### fresh client

| Row | Profile | Viewport | Boot | Journey | Console | Probe | Reduced motion |
|-----|---------|----------|------|---------|---------|-------|----------------|
| F1 | phone-portrait | 400x720 | pending | pending | pending | pending | pending |
| F2 | phone-tall | 540x900 | pending | pending | pending | pending | pending |
| F3 | landscape | 720x400 | pending | pending | pending | pending | pending |
| F4 | desktop-small | 1024x768 | pending | pending | pending | pending | pending |
| F5 | desktop-wide | 1440x900 | pending | pending | pending | pending | pending |

### existing-worker client (active SW, primed cache)

| Row | Profile | Viewport | Boot | Journey | Console | Probe | Reduced motion | Cache |
|-----|---------|----------|------|---------|---------|-------|----------------|-------|
| W1 | phone-portrait | 400x720 | pending | pending | pending | pending | pending | pending |
| W2 | phone-tall | 540x900 | pending | pending | pending | pending | pending | pending |
| W3 | landscape | 720x400 | pending | pending | pending | pending | pending | pending |
| W4 | desktop-small | 1024x768 | pending | pending | pending | pending | pending | pending |
| W5 | desktop-wide | 1440x900 | pending | pending | pending | pending | pending | pending |

## Special Coverage (pending — Plan 02)

- Reduced motion (OS setting + `G.state.reduceMotion = true`).
- Legacy-save boot and fresh-save boot.
- Worker/cache activation (fresh vs primed comparison).
- Dense states (5 heroes, full equipment, max events/landmarks).
- `?probe` FPS p95 ≥ 30 and `&selftest` input-chain result.
