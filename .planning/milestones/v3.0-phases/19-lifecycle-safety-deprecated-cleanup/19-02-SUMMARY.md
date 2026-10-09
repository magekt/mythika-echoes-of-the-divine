---
phase: 19-lifecycle-safety-deprecated-cleanup
plan: "02"
subsystem: engine deprecation
tags: [deprecation-scanner, save-migration, evidence-led-removal]

# Dependency graph
requires:
  - phase: 19-01
    provides: [lifecycle guards keeping migration paths stable]
provides:
  - "Deprecation scanner + probe + verifyRemoval + logRemoval + checkSaveMigration"
  - "19-REMOVALS.md evidence log (zero safe removals, all candidates live)"
  - "Save-migration contracts (fresh v3, v2, legacy, direct, cached)"
affects: [19-03, diagnostics-phase-20]

# Tech tracking
tech-stack:
  added: []
  patterns: [regex static analysis without bundler deps, injected-hydrate migration checks]

key-files:
  created: [src/engine/deprecation.js, tests/deprecation.test.js]
  modified: [index.html, sw.js]
---

# 19-02 Summary — Deprecation scanner + evidence-led removals

## What was built
- `src/engine/deprecation.js`: classic-global `Deprecation` with `scan(sources)`,
  `probe(names)` (`?probe&deprecation` seam), `recordCall`, `runtimeMap`,
  `verifyRemoval` (zero static refs + zero runtime hits + replacement contract),
  `checkSaveMigration`, `logRemoval`. No I/O, no eval, no gameplay mutations.
- `19-REMOVALS.md`: full evidence log. Outcome: **zero removals** — every
  candidate (`G.cleanupEventListeners`, `SaveSystem.stopAutoSave`, save
  `migrate`, enlightenment fields, `?probe&selftest` block) has live grep
  references; runtime probe treated as UNKNOWN with no play session, so the
  removal bar is not met anywhere. No source file was deleted.
- `tests/deprecation.test.js`: 6/6 pass, including a live `SaveSystem.hydrate`
  check against real `src/systems/save.js` across all five fixtures plus
  unrelated-progress preservation.

## Verification
- `node tests/deprecation.test.js` → 6/6 pass.
- Full suite after task 2: `node --test tests/*.test.js` → 175/175 pass;
  `tools/check_ui_invariants.sh` → all checks passed.

## Deviations
- Task 2 executed as "scan + verify + document" with zero deletions rather
  than code removal, per the plan's own stop rule (no candidate met the
  evidence bar). This is the correct evidence-led outcome.
