---
phase: 31-toast-lifecycle-scoping
plan: "01"
subsystem: engine
tags: [backgrounds, R-binding, ashram-crash, LAY-05, repro-gate]

# Dependency graph
requires:
  - phase: 30-layout-harness-extension verification
    provides: [R.Backgrounds split flagged as pending todo, verify_matrix boot/layout runners]
provides:
  - [lexical R.Backgrounds attach, binding regression test, repro-lay05 branch record]
affects: [31-02 toast lifecycle, phase-32 toast lane]

# Tech tracking
tech-stack:
  added: []
  patterns: [lexical-first classic-script bridge, VM script-order regression test, honest repro-or-rule-out record]

key-files:
  created: [tests/backgrounds_binding.test.js, tools/shots/repro-lay05.json]
  modified: [src/engine/backgrounds.js]

key-decisions:
  - "Fix at the attach site (backgrounds.js), not renderer.js — no reason to churn the 844-line file"
  - "Repro branch harden: headless env cannot drive real taps; leak mechanism proven by inspection, never faked"
  - "tools/shots/ is gitignored — repro/layout JSON are untracked run artifacts by design"

patterns-established:
  - "Classic-script bridges assign the lexical binding first, then sync window/globalThis to the SAME object"
  - "Binding regression: load scripts in index.html order into one VM context, assert strict identity"

requirements-completed: [LAY-05-repro-gate]

# Metrics
duration: 30min
completed: 2026-10-09
---

# Phase 31 Plan 01 Summary

**Live-boot Ashram crash fixed at the attach site plus an honest repro-or-rule-out gate selecting the harden branch for plan 31-02.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-10-09
- **Completed:** 2026-10-09
- **Tasks:** 3/3
- **Files modified:** 1 modified, 1 test created, 1 run artifact recorded

## Accomplishments

- `src/engine/backgrounds.js`: replaced the window-only attach (`window.R = window.R || {}` → disjoint object) with a lexical-first bridge (`R.Backgrounds = Backgrounds`, then `window.R = window.R || R` sync). Crash class eliminated for all 7 `R.Backgrounds` call sites (ashram, party, equipment, travelMap, zoneExploration, combatScene, cultivationScene). Existing `tools/layout_harness/driver.js` split-workaround becomes a same-object no-op.
- `tests/backgrounds_binding.test.js`: 3 tests green — lexical API presence (renderBackground/renderCharacterMoment/registerSlot/get), strict `window.R.Backgrounds === R.Backgrounds` identity, `registerSlot`/`get` slot-path resolution. Verified red-on-old-code (3/3 fail via stash check, including the exact `reading 'registerSlot'` crash class).
- `tools/shots/repro-lay05.json`: `reproduced: false`, branch `harden` — real taps undrivable headless; leak mechanism confirmed by inspection (no transition clear in either gScene path, 2–2.5s lifetimes exceed a fast tap path, `Toast.clear`/`Notify.clear` never invoked on transition).

## Verification

- `node --test tests/backgrounds_binding.test.js`: 3/3 pass (3/3 fail pre-fix)
- `node --test tests/*.test.js`: 421 pass, 0 fail
- `tools/check_ui_invariants.sh`: all checks passed (95 files, 21 system scripts)
- `python3 tools/verify_matrix.py --budget 6000`: all 3 profiles booted clean (no `[Mythika] loop error` — Ashram renders)
- `node --check` clean on all touched sources; `git diff --check` clean

## Surfaced-not-fixed

- None in this plan's scope. Layout-sweep defects deferred to plan 31-02's report.
