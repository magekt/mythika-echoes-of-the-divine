# Phase 32: Combat Layout - Context

**Gathered:** 2026-10-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Combat reads in clean horizontal bands and actions never collide with toasts: hero name/HP-MP bars, enemy name/HP, and the target button occupy separate non-overlapping bands (target button inside the enemy panel) at 1, 3, and 5 heroes; action buttons share one width/height/gap grid; the engine defines one toast-lane constant in `scene-helpers.js`, `Notify` draws only inside it, and no scene places buttons or text in the lane. Proof via the Phase 30 harness: re-derived target pairs, shared text-bounds for combat 1v1 and 5v3 at both viewports, full 20-scene sweep at phase end, and backgrounds-paint evidence (LAY-07). Nothing player-facing outside combat layout; no new capabilities.

</domain>

<decisions>
## Implementation Decisions

### Discussion posture (applies to every category below)
- **D-00:** The user deferred nearly all implementation choices to downstream discretion ("You decide" on 19 of 20 questions). The researcher owns HOW questions (measurements, code patterns, approach recommendations); the planner owns sizing/layout choices. The single locked decision is D-01. Everything else is genuinely open — do not re-ask the user; decide from harness data and codebase evidence.

### Combat band layout
- **D-01 (LOCKED):** Victory/defeat result screens fall under the same band discipline — result title, rewards line, and buttons get fixed non-overlapping bands like the live-combat bands. Do not leave the result layout as-is.
- **D-02:** Band order (header → heroes → enemy panel → actions), 5-hero scaling (compact rows vs scroll), target-button sizing (min tap size vs band-driven), name-vs-bars separation (fixed vs measured heights), and landscape adaptation are all at researcher/planner discretion. Decide from harness pair data and both-viewport measurements.

### Action-button grid
- **D-03:** Long skill names (e.g. "Gandiva Twin Strike"), overflow behavior (scroll vs category tabs), category separators, Flee placement, and disabled-state styling are at downstream discretion. Note the existing precedent: disabled buttons already use reduced-contrast + affordance styling per WCAG AA fixes — stay consistent with it unless measurements argue otherwise.

### Toast-lane constant
- **D-04:** Lane geometry (viewport-relative vs per-orientation constants), 3-toast stack containment, victory/loot exemption question, modal overlap, and the encounter-story-log-line coexistence are at downstream discretion. Mandatory input facts (code-verified 2026-10-10): `Notify.render` (`src/engine/game.js:67`) and `UI.Feedback` (`src/ui/feedback.js:91`) both hardcode `ty=470`, which is **off-screen in landscape (H=390)** — the lane constant MUST be viewport-aware. Achievement banners remain the only exemption (locked Phase 31).

### Proof & fixtures
- **D-05:** Who judges the first-correct background render, whether the user reviews re-derived pairs before lock, sweep-fallout policy (fix vs defer), and fixture-retirement strictness are at downstream discretion. Defaults if no strong signal: log-and-defer sweep fallout to owning phases (33/34) as `surfaced-not-fixed` (Phase 31 precedent); enforce same-commit fixture retirement strictly (SC7).

### Non-combat states
- **D-06:** Whether enemy-turn pill, enlightenment mode, and zero-usable-skills states share the band/grid discipline is at downstream discretion. No user constraint.

### OpenCode's Discretion
- Everything marked "You decide" above: band order/sizes, scaling strategy, tap sizing, fixed vs measured bands, landscape approach, name fitting, overflow, separators, Flee slot, disabled styling, lane geometry, stack containment, victory exemption, modal policy, log-line coexistence, evidence judging, pair review, sweep policy, retirement strictness, non-combat states.

### Folded Todos
- `2026-10-09-fix-combat-header-overlap.md` — combat header name/bar collisions; direct input to band-layout plans (LAY-01).
- `2026-10-09-fix-combat-action-buttons.md` — action-button sizing/spacing collisions; direct input to grid plans (LAY-02).
- `2026-10-09-fix-stale-toast-persistence.md` — stale toasts persisting over combat UI; direct input to lane-constant plans (LAY-02). Note Phase 31 closed the cross-scene half; remaining work is lane geometry/containment.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & prior context
- `.planning/REQUIREMENTS.md` — LAY-01, LAY-02, LAY-07 acceptance text; shared LAY pass criterion.
- `.planning/ROADMAP.md` — Phase 32 goal + 7 success criteria (pairs re-derived, bands at 1/3/5 heroes, grid + lane constant, tutorial-toast clearance, text-bounds 1v1/5v3 both viewports, 20-scene sweep, backgrounds evidence + fixture retirement).
- `.planning/phases/30-layout-harness-extension/30-CONTEXT.md` — locked harness decisions (fillText wrap, settled frames, exclusion flags, seeded gScene entry, JSON evidence, fail-first fixture).
- `.planning/phases/31-toast-lifecycle-scoping/31-02-SUMMARY.md` — scene-tag clearing, 3/system cap, y=470 lane ownership transfer to LAY-02.
- `.planning/phases/31-toast-lifecycle-scoping/31-UAT.md` — test-5 root-cause analysis (chrome vs toast distinction; read before touching party-adjacent code).

### Code under change
- `src/scenes/combatScene.js` — 1303-line combat render; action grid (~1195-1303), band layout (~1039-1195), Toast/Notify call sites (:146, :710, :728, :824, :855, :865, :896, :936, :989-990).
- `src/engine/scene-helpers.js` — home of the new toast-lane constant (435 lines; read before adding).
- `src/engine/game.js` — `Notify.render` lane (`:67`, `ty=470`) + `gScene` choke point; achievements exempt by design.
- `src/ui/feedback.js` — second toast system (`ty=470` at :91, cap 3); scene-tag clearing locked, do not regress.
- `tools/verify_matrix.py` — harness to extend (layout mode, pair fixtures, background sampling).

### Pending-todo inputs (folded)
- `.planning/todos/pending/2026-10-09-fix-combat-header-overlap.md`
- `.planning/todos/pending/2026-10-09-fix-combat-action-buttons.md`
- `.planning/todos/pending/2026-10-09-fix-stale-toast-persistence.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/verify_matrix.py` — layout mode + pair fixtures + background sampling build on this; extend, don't fork.
- `UI.HeroSurface` — canonical hero rendering; consider for combat hero rows vs bespoke rows (researcher decides per D-02).
- `Scene.cullButtons` / `Scene.drawStatic` / `Scene.drawScrollbar` + clip pattern — established scroll-panel recipe (party.js recruit branch is the freshest example).
- `R.text` / `R.textCenter`, `R.colors`, `R.fonts` tokens — only measurement/draw vocabulary allowed.

### Established Patterns
- Classic scripts in `index.html` order with lexical globals; Node contract tests via vm-concat; `?probe` diagnostics.
- Fixed-band layout with `getContentTop()` / `getContentHeight()` insets (party.js precedent).
- `surfaced-not-fixed` logging for out-of-scope defects found during verification runs.

### Integration Points
- `src/engine/game.js` `Notify` + `src/ui/feedback.js` `Toast` — both consume the new lane constant; achievement path must keep surviving transitions.
- `tools/verify_matrix.py` fixtures — pairs re-derived on current tree; fixed pairs retire to must-stay-clean same-commit.
- Combat simulator (`vm` context, seeded RNG) — reuse for 1v1/5v3 layout entry per 30-CONTEXT scene-entry decision.

</code>

<specifics>
## Specific Ideas

- No `Tutorial.*` system exists in `src/` (grep-verified 2026-10-10) — "tutorial toasts" in SC3 means guidance `Notify` text; researcher must enumerate which call sites count before asserting clearance.
- Combat's action panel already renders its own encounter-story line inside the panel while `Notify` fires below it — two coexisting streams (see D-04; default keep-both unless evidence argues otherwise).
- Web best-practices research was skipped: both search providers errored in this environment (Exa rate-limit, SearXNG config). Decisions rest on codebase evidence instead.

</specifics>

<deferred>
## Deferred Ideas

- Quiet the Firebase 404/init-failure console noise on the Pages build — separate phase (deploy/hygiene).
- Add a repo LICENSE — separate phase (hygiene).
- Procedural-audio upgrade (title track deserves more than synth chirps) — separate phase.
- Painted zone backdrops / enemy portraits (visual-sparsity review note) — separate art phase.
- Remove the debug scene from the shipped build — separate hygiene item; flag to researcher only if the 20-scene sweep trips over it.

</deferred>

---

*Phase: 32-Combat Layout*
*Context gathered: 2026-10-10*
