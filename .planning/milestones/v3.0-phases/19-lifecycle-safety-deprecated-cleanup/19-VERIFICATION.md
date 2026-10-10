# Phase 19 — Verification Record (REQ-031, REQ-032)

**Date:** 2026-10-08
**Scope:** lifecycle safety + deprecated-code cleanup

## Automated evidence (this pass)

| Check | Command | Result |
|---|---|---|
| Lifecycle contracts | `node tests/lifecycle.test.js` | 9/9 pass |
| Deprecation + migration | `node tests/deprecation.test.js` | 6/6 pass |
| Browser-matrix contract | `node tests/lifecycle_browser_matrix.test.js` | 7/7 pass |
| Full Node suite | `node --test tests/*.test.js` | 175 pass / 0 fail |
| UI invariants | `bash tools/check_ui_invariants.sh` | all checks passed |
| Syntax | `node --check` on all new/changed JS | clean |
| `git diff --check` | whitespace | clean (run before commit) |

Note: the full suite initially showed 1 failure
(`sw.js ASSETS includes every local script`) caused by the two new engine
scripts; fixed by adding both to `sw.js` precache. Suite is green after.

## Save fixtures (automated, live `SaveSystem.hydrate`)
- fresh-v3, v2-save, legacy-save, direct-boot, cached-boot → all hydrate to
  canonical shape; unrelated progress (`gold`, `flags`) preserved.

## Human browser verification — DEFERRED (blocking gate NOT cleared)

Task 19-03-2 requires a human pass; it was not performed here. Steps:
1. Serve repo (`python3 -m http.server 3000`), open fresh `index.html` at 400×720.
2. Cycle core screens × 20 (ashram → map → zone → combat → result → ashram);
   `?probe` shows stable memory, no timer/listener/cache growth.
3. Cycle party/equipment/cultivation × 10 each; leak assertions pass.
4. Open all untouched scenes (settings, debug, auth, welcome, achievements,
   forge, alchemy, bazaar, farm, fishing, tournament, trials, spiritBeast,
   punarjanma, journey, questLog); all accessible.
5. Save migration: fresh v3 → load OK; v2 → hydrated; legacy → hydrated;
   direct boot OK; cached boot OK.
6. Failure injection via DevTools (throw in enter / transition) → Ashram
   fallback + Notify.
7. Reduced motion: transitions instant, no decorative motion.
8. Repeat at 540×900, 720×400, 1024×768, 1440×900 with touch/mouse/keyboard.
9. Console + `?probe`: no unexpected errors/leaks; FPS ≥ 30.

**Resume signal:** reply "approved" with evidence paths, or describe the
failing viewport/state/flow.
