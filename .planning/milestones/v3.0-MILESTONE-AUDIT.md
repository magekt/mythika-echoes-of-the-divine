---
milestone: v3.0
phases: 13-20
date: 2026-10-09
status: gaps_found
requirements: REQ-021..REQ-034
---

# v3.0 Milestone Audit — Screen & Gameplay Revamp (Phases 13–20)

**Verdict: gaps_found** — all 14 requirements have automated contract coverage and pass Node/static gates (202/202); one gap class remains: (1) live browser evidence deferred across every phase. Feedback integration gap closed 2026-10-09 (see addendum).

## Sources read

- `.planning/REQUIREMENTS.md` (REQ-021..REQ-034, traceability table)
- Phase verifications: `13-VERIFICATION.md`, `14-VERIFICATION.md`, `15-VERIFICATION.md`, `16-VERIFICATION.md`, `17-VERIFICATION.md`, `18-VERIFICATION.md`, `19-VERIFICATION.md`, `20-VERIFICATION.md`
- Phase summaries: `13-01-SUMMARY.md`, `14-01/14-02-SUMMARY.md`, `15-01-SUMMARY.md`, `16-01/16-02-SUMMARY.md`, `17-01-SUMMARY.md`, `18-01-SUMMARY.md`, `19-01-SUMMARY.md`, `20-01/20-02/20-03-SUMMARY.md`
- Source spot-checks: `grep` for `HeroSurface|UI.Feedback|R.Backgrounds|Navigation.go|Diagnostics.toggle|Lifecycle.wrap` under `src/`

## Per-requirement verdicts

| Req | Phase | Verdict | Evidence |
|-----|-------|---------|----------|
| REQ-021 navigation flow | 13 | pass (automated; browser deferred) | `navigation_flow.test.js` pass; routes canonical in `src/engine/navigation.js` + `navigation_routes.js`; `gScene` legacy wrapper preserves compat |
| REQ-022 screen grammar / states | 13 | pass (automated; browser deferred) | `screen_grammar.test.js` pass; responsive header/primary-action/recovery contracts |
| REQ-023 responsive viewports | 13 | pass (automated; browser deferred) | `responsive_screen_matrix.test.js` pass; 5-viewport matrix contract |
| REQ-024 combat readability | 14 | pass (automated; browser deferred) | `combat_readability.test.js`, `combat_browser_matrix.test.js` pass; non-overlapping bands; attack-to-reward flow |
| REQ-025 hero identity surface | 15 | pass (automated; browser deferred) | `hero_surface.test.js`, `character_party_integration.test.js`, `character_surface_browser_matrix.test.js` pass; `UI.HeroSurface.getModel` used in party/equipment/cultivation/combat + result; read-only, no mutations |
| REQ-026 feedback (rewards/XP/currency) | 16 | pass (automated; browser deferred) | Library `src/ui/feedback.js` (25/25) + `feedback_integration.test.js` pass; Toast confirmations wired in party, equipment, cultivation, combat, travelMap, zoneExploration; global toast drain in `game.js` update/render |
| REQ-027 locked/blocked guidance | 16 | pass (automated; browser deferred) | Blocker Toasts wired at every denial point (equip-incompatible, breakthrough-fail, boss-flee, locked-zone, missing-zone); lock reasons surfaced via `MapHelpers.getLockReason`; no generic tour (per constraint) |
| REQ-028 backgrounds / presentation slots | 17 | pass (automated; browser deferred) | `backgrounds.test.js` 9/9, `backgrounds_integration.test.js` 13/13, `backgrounds_browser_matrix.test.js` 11/11 pass; full suite 127/127 at the time; 7 scenes wired (`ashram`, `travelMap`, `zoneExploration`, `combat`, `party`, `equipment`, `cultivation`) with fallback layers; never blocks entry |
| REQ-029 readability/perf/reduced-motion | 17 | pass (automated; browser deferred) | LRU bounds (20 entries/5MB), 0ms crossfade in reduced motion, contrast overlay, no unbounded per-frame allocation — all asserted in contract/integration tests |
| REQ-030 modular navigation seams | 18 | pass (automated; browser deferred) | `navigation.test.js` 9/9, `navigation_integration.test.js` 5/5, `navigation_browser_matrix.test.js` pass; 8 canonical routes, context/command schemas, ≤500ms transition budget, failure → ashram + Notify; globals remain compatible |
| REQ-031 lifecycle ownership | 19 | pass (automated; browser deferred) | `lifecycle.test.js` 9/9, `lifecycle_browser_matrix.test.js` 7/7, full suite 175/175; `Scene.create` auto-wraps enter/leave via `Lifecycle` guards; `assertClean` covers buttons/draws/scroll/modal/effect/selections/timers/listeners/caches |
| REQ-032 deprecation cleanup | 19 | pass (automated; browser deferred) | `deprecation.test.js` 6/6; `19-REMOVALS.md` records call-site/runtime evidence; save fixtures (fresh-v3, v2, legacy, direct-boot, cached-boot) hydrate via live `SaveSystem.hydrate` preserving `gold`/`flags` |
| REQ-033 diagnostics toggle | 20 | pass (automated; browser deferred) | `diagnostics.test.js` 9/9, `diagnostics_integration.test.js` 9/9; disabled-by-default `debugMode`, bounded buffers 300/50/200/20, silent collectors, `?probe` independent, save strips session buffers |
| REQ-034 full player loop | 20 | **gap: browser gate open** | `final_acceptance_browser_matrix.test.js` 8/8 (contract only); full suite 201/201 + `check_ui_invariants.sh` pass; 10-combination journey matrix (fresh/existing-worker × 5 viewports) defined in 20-VERIFICATION with all rows `pending` |

## Cross-phase integration

- **Navigation routes:** `Navigation.go` canonical with 8 routes; `gScene` wrapped for legacy compat; transition state in `G.state.transition` feeds diagnostics/probe. No route-ID conflicts found.
- **Lifecycle guards:** `Scene.create` auto-wrap applies to all scenes including untouched ones; failure recovery routes to Ashram + Notify. Compatible with navigation transitions.
- **Diagnostics:** Wrappers on `Navigation.go`/`transition`, `Input._pushTap`, `SaveSystem.save`/`load` are behavior-preserving and idempotent; script order (`diagnostics.js` after `navigation_routes.js`, before scenes) asserted in integration test; `sw.js` precache includes new engine scripts.
- **Backgrounds:** 7 revamped scenes render via `R.Backgrounds` with `destination-over` + contrast overlay; character moments confined to safe zones; no overlap with Phase 14 action bands or Phase 16 toast/hint layers by contract.
- **Hero surfaces:** `HeroSurface.getModel` feeds navigation context schemas (`navigation.js` lines ~81/105/116) and all character screens; read-only authority preserved.
- **Feedback:** Toast confirmations/blockers wired in all 6 character/world scenes with a global drain in the game loop; badges/hints remain richest in party.js. Cross-screen consistency now actual for Toast layer.

## Gaps

1. **Live browser evidence: none collected (all phases).** Every phase verification explicitly defers human browser runs. The 10-combination final matrix in `20-VERIFICATION.md` (F1–F5, W1–W5) is entirely `pending`: console silence, `?probe` FPS ≥ 30 p95, dense states, reduced motion, and existing-worker cache activation are unproven in a real browser.
2. **Deferred worker/cache activation checks** (phases 15, 17, 19, 20) ride along with gap 1 — no fresh-worker/primed-cache comparison exists.

## Addendum 2026-10-09 — feedback gap closed
- Former gap 2 (REQ-026/REQ-027 partial) resolved: `UI.Feedback.Toast` wired at confirmation + denial points in equipment, cultivation, combat, travelMap, zoneExploration; global `updateToasts`/`renderToasts` drain added to `game.js`; `tests/feedback_integration.test.js` added and passing; full suite 202/202 + `check_ui_invariants.sh` green.

## Deferred browser-evidence notes

- Recipe (per 13/14/17/19/20 verifications): serve via `python3 -m http.server 3000`; walk title/load → Ashram → map → zone → combat → result → return plus party/equipment/cultivation/settings at 400×720, 540×900, 720×400, 1024×768, 1440×900; cover touch/mouse/keyboard, resize/orientation hit alignment, reduced motion, `?probe` + `&selftest`, console silence; record per-combination captures in the 20-VERIFICATION matrix tables.
- Stress cases still unrun: 20× core-screen cycles + 10× party/equipment/cultivation cycles for leak assertions (Phase 19), 105-combination background matrix (Phase 17), failure injection (invalid route, missing params, throwing enter/transition → Ashram fallback).
- Rollback signal: `git revert <phase-commit>` on regression; resume signal per Phase 19 is an "approved" reply with evidence paths.

## Recommendation

Keep milestone status at `gaps_found` (browser evidence only). To reach `passed`: execute the 10-combination browser matrix with console/probe captures and mark rows pass/fail. No requirement is orphaned or duplicated (14/14 mapped exactly once).
