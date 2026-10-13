# Phase 19 — Removal Log (D-02, evidence-led)

**Date:** 2026-10-08
**Scanner:** `src/engine/deprecation.js` (`Deprecation.scan` / `verifyRemoval`)
**Contracts:** `tests/deprecation.test.js` (6/6 pass)

## Method

1. Static scan for candidate definitions: unused exports, dead paths,
   superseded helpers, v1/v2 aliases (`grep -rni deprecat|legacy|compat|alias|v1`
   plus `Deprecation.scan` over `src/**/*.js`).
2. Reference check per candidate: `grep -rn <name> src/ index.html`.
3. Runtime probe seam available via `?probe&deprecation`
   (`Deprecation.probe(names)`); no 5-min play session was run in this
   pass, so runtime hits are treated as UNKNOWN — removal requires
   zero static refs AND zero runtime hits, therefore no removal below
   meets the bar.
4. Rule: remove only when `verifyRemoval` is true AND the full suite
   stays green after the removal. Otherwise document and keep.

## Outcome: zero removals — every candidate has live references

| File | Function / code | Replacement | Evidence (refs) | Contract | Status |
|---|---|---|---|---|---|
| `src/engine/game.js` | `G.cleanupEventListeners` | none | Referenced by `pagehide` handler in same file (`grep G.cleanupEventListeners` → def + call) | `tests/save_coherence.test.js` (suite) | KEPT — live |
| `src/systems/save.js` | `SaveSystem.stopAutoSave` / `autoSaveInterval` | none | Called from `src/scenes/ashram.js` + `src/engine/game.js` pagehide | `tests/save_coherence.test.js` | KEPT — live |
| `src/systems/save.js` | legacy-gear normalization (`migrate`) | none | Exercises on every `hydrate`; covered by `tests/deprecation.test.js` fixtures | `tests/deprecation.test.js` | KEPT — migration path |
| `src/engine/game.js` | enlightenment timer block (`enlightenmentTimer/Buff/xpBuff`) | none | Written by `src/scenes/combatScene.js`, read by `src/systems/progression.js` + `src/data/cultivation.js` | combat/progression suites | KEPT — live |
| `src/engine/game.js` | `?probe&selftest` diagnostics block | none | Opt-in diagnostic, zero runtime cost unless probed | harness-invoked | KEPT — diagnostics (Phase 20 owns) |

No leaf dependency, dead path, or superseded alias with zero verified
references was found. No source file was modified by this task; the only
new engine file is the scanner itself (`src/engine/deprecation.js`),
which is additive and script-order safe.
