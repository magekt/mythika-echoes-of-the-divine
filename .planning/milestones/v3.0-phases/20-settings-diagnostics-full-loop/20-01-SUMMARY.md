# 20-01 Summary — Diagnostics System + Settings Toggle

**Plan:** 20-01-PLAN.md (wave 1) | **Requirements:** REQ-033, REQ-034 | **Date:** 2026-10-08

## What was built

- `src/engine/diagnostics.js` (new): global `Diagnostics` namespace — `toggle(enabled)`,
  `collectors.{frame,transition,input,persistence,invariants}`, tabbed `panel`
  (Ctrl+Shift+D / `?debug`, 5 tabs, `R.fonts.mono`, export JSON / clear / run
  invariants), `exportJSON()`, `clearBuffers()`, `runInvariants()`. Bounds:
  300/50/200/20 with push/shift. Transparent wrappers on `Navigation.go` /
  `Navigation.transition`, `Input._pushTap`, `SaveSystem.save` / `load`
  (installed once, behavior-preserving). Zero console output; `?probe` untouched.
  No raw hex colors; reduced-motion safe.
- `src/scenes/settings.js`: "Debug Diagnostics: ON/OFF" toggle in new Advanced
  section; persists `G.state.debugMode`, calls `Diagnostics.toggle()`.
- `index.html`: loads `diagnostics.js` after `navigation_routes.js` (hence after
  `navigation.js`), before scenes.
- `src/engine/game.js`: `debugMode: false` default state.
- `src/systems/save.js`: `migrate()` defaults `debugMode` to boolean (preserves
  existing); `save()`/`exportFile()` strip session-local `diagnostics` buffers.
- `sw.js`: caches `src/engine/diagnostics.js` (save_coherence gate).
- `tests/diagnostics.test.js` (new): 9 contract tests.

## Verify results

- `node tests/diagnostics.test.js` — 9/9 pass.
- `node --check` on diagnostics.js, settings.js — clean.
- Full suite `node --test tests/*.test.js` — 201/201 pass.
- `tools/check_ui_invariants.sh` — all checks passed. `git diff --check` — clean.

## Deviations

- Settings toggle uses `UI.Button` (38px, file convention) rather than a
  `MagneticBtn` (no such component exists); plan's 48px adapted to match every
  other Settings row. Panel uses `UI.PremiumShell`/`UI.Tabbar` when present
  with a canvas fallback so it never crashes headless/early-boot.
