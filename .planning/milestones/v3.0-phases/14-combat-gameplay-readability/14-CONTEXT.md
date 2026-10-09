# Phase 14: Combat & Gameplay Readability — Context

**Gathered:** 2026-09-20  
**Status:** Ready for planning  
**Requirement:** REQ-024

<domain>
## Phase Boundary

Improve the existing `combatScene` presentation and interaction routing so normal turns, enemy intent/reaction windows, combat log feedback, and victory/defeat rewards occupy distinct readable regions on the Phase 13 responsive canvas. Preserve combat math, turn order, enemy AI, reward ownership, save behavior, and the Phase 13 route/back grammar.

</domain>

<decisions>
## Locked Decisions

### D-01 — Preserve authoritative combat rules
- Do not change `src/systems/combat.js` formulas, turn ordering, reaction resolution, AI, or battle-ending rules. `combatScene.js` remains a presentation/orchestration adapter over `Combat`, `Progression`, `Economy`, `QuestSystem`, `ZoneRewardSystem`, and `SaveSystem`.

### D-02 — Use explicit mutually exclusive combat layout modes
- Normal player/enemy turns, `reactionWindow`, and `result`/reward states must each have named, non-overlapping layout bands. Do not solve overlap by merely shrinking all text or stacking multiple state panels in one band.

### D-03 — Preserve Phase 13 responsive grammar and input parity
- Keep the 400×720 logical coordinate system, shared responsive profile/layout helpers, labeled navigation/back behavior, and Canvas logical hit testing. Combat must remain usable at 400×720 portrait, 540×900 portrait, 720×400 landscape, 1024×768 narrow desktop, and 1440×900 wide desktop, with touch/mouse/keyboard parity.

### D-04 — Keep feedback readable and bounded
- Surface current turn/intent, selected target, reaction timing/action choices, recent combat log, and reward/result outcome without overlap, unbounded allocations, or always-on debug logging. Respect `R.reducedMotion()` while retaining state distinctions.

## OpenCode's Discretion

- Choose helper names and exact band constants, provided layout geometry is centralized in `combatScene.js` or an existing shared helper and is covered by tests.
- Reuse existing `UI.Button`, `UI.PremiumShell`, `UI.ProgressBar`, `UI.HUD`, `Scene` helpers, and Phase 13 navigation helpers rather than creating a parallel UI system.
- Choose whether to add a small combat-specific test fixture/helper; do not add a framework, bundler, DOM screen rewrite, or gameplay state store.

</decisions>

<deferred>
## Deferred Ideas

- Reusable hero identity surface across party/cultivation/equipment (Phase 15).
- Generalized route/selector/command seams (Phase 18).
- Broad lifecycle/deprecated-code cleanup (Phase 19).
- Settings diagnostics and full-loop acceptance harness (Phase 20).
- New combat mechanics, enemies, skills, content, online systems, or renderer/framework migration.

</deferred>

<canonical_refs>
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/STACK.md`
- `codemap.md`, `src/engine/codemap.md`, `src/scenes/codemap.md`, `src/systems/codemap.md`, `src/ui/codemap.md`
- `src/scenes/combatScene.js`, `src/systems/combat.js`
- `.planning/debug/layout-spacing-game-view.md`
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-UI-REVIEW.md`
- `.planning/phases/13-responsive-screen-grammar-navigation/13-01-SUMMARY.md`, `13-02-SUMMARY.md`, `13-03-SUMMARY.md`, `13-VERIFICATION.md`
</canonical_refs>
