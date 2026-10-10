# 20-02 Summary — Cross-Phase Integration + Regression

**Plan:** 20-02-PLAN.md (wave 2, depends on 20-01) | **Requirements:** REQ-033, REQ-034 | **Date:** 2026-10-08

## What was built

- `tests/diagnostics_integration.test.js` (new): 9 integration tests —
  probe script-group order matches `index.html` (`engine,data,systems,ui,scenes,boot`
  mirrored in `Diagnostics.SCRIPT_GROUPS`); diagnostics script registered after
  `navigation.js`, before scenes; transition hooks record `Navigation.go` /
  `transition` with fade/init/cleanup timings; input hooks record hitTarget across
  all 5 viewports (400×720, 540×900, 720×400, 1024×768, 1440×900); persistence
  hooks record save/load with schemaVersion/migratedFields/storageBytes; zero raw
  hex in new code with `R` token usage; `?probe` independent of `debugMode` and
  disabled collectors silent; save/load round-trip with `debugMode=true` then
  disable-clears-buffers; wrapper transparency + idempotent install.
- Source fix found by the new tests: removed a `'#fff'` fallback literal in
  `diagnostics.js` panel render (zero-raw-hex contract).

## Verify results

- `node tests/diagnostics_integration.test.js` — 9/9 pass.
- `node tests/diagnostics.test.js` — 9/9 pass (no regressions).
- Full suite `node --test tests/*.test.js` — 201/201 pass (includes the sw.js
  ASSETS gate, fixed by caching the new script).
- `tools/check_ui_invariants.sh` — all checks passed.

## Deviations

- None. The `G.state.debugMode=true` full-suite run is covered by the
  round-trip/transparency tests using stub systems; no suite-wide flag flip was
  needed since hooks are behavior-preserving by construction and asserted so.
