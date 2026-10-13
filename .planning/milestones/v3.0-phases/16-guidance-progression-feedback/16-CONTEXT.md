# Phase 16: Guidance & Progression Feedback — Context

**Gathered:** 2026-10-08  
**Status:** Ready for execution planning  
**Requirement:** REQ-026, REQ-027

<domain>
## Phase Boundary

Create a cohesive guidance and progression feedback system that explains blockers, confirms rewards, and surfaces the next meaningful action — without becoming a fixed tutorial tour. The system must integrate with existing canonical systems (Combat, Progression, CultivationSystem, EquipmentSystem, Economy, SaveSystem) and present feedback at the point of decision. It owns presentation and dismissal; canonical systems continue to own all mutations, rewards, and state transitions.

The phase includes automated source/contract coverage and a browser/device verification recipe. It does not include new progression mechanics, deep companion systems, background/asset pipeline (Phase 17), navigation seam migration (Phase 18), or broad lifecycle cleanup (Phase 19).
</domain>

<decisions>
## Locked Decisions

### D-01 — Preserve canonical authority and save compatibility
- Read blocker reasons from authoritative state: zone locks from `MapHelpers`, equipment requirements from `EquipmentSystem`, cultivation gates from `CultivationSystem`, gold/prana from `Economy`.
- Do not duplicate mutable progression, reward, or blocker state in the UI. Do not change save schema or migration behavior for presentation-only feedback data.
- Feedback dismissal state (if persisted) must be opt-in and bounded; core blocker logic remains in systems.

### D-02 — Contextual, dismissible, non-interrupting
- Feedback appears near the relevant decision point (inline in panels, toast for transient, modal only for irreversible actions).
- Dismissible with persistent "don't show again" per feedback type, stored in `G.state.guidanceDismissed` (bounded array of keys).
- No fixed tutorial tour, no forced step-by-step onboarding. Player discovers guidance by interacting with locked/blocked actions.

### D-03 — Immediate confirmation + durable visibility
- Every canonical action (combat, cultivation, exploration, crafting, equip) produces immediate visual/audio confirmation via existing `Notify` + `Audio`.
- Progression changes (XP, level, realm, equipment, gold, prana) remain visible in the relevant screen after the action completes — no toast-only feedback for durable state changes.
- Reward summaries in combat result use Phase 14 result band; cultivation breakthrough shows in cultivation panel; equipment changes show in equipment/party.

### D-04 — Responsive Canvas grammar remains authoritative
- Preserve 400×720 logical canvas, Phase 13 layout profile, labeled navigation/back, Phase 14 combat bands, Phase 15 hero surface, semantic renderer tokens, 44–48px touch targets, `R.reducedMotion()`.
- Feedback components use `UI` factory patterns (toast, inline hint, contextual badge) and respect reduced motion.

### D-05 — No duplicate rewards or presentation-owned progression
- All reward grants route through `Combat`, `Progression`, `CultivationSystem`, `EquipmentSystem`, `Economy`, `ZoneRewardSystem`.
- Feedback components never call mutating APIs directly; they only read state and trigger `Notify`/`Audio`.
- Exactly-once behavior preserved by canonical systems (e.g., `WorldEvents.resolve`, `AchievementSystem.check`).

## OpenCode's Discretion

- Choose feedback component library structure (toast queue, inline hints, contextual badges, blocker tooltips) under `UI` namespace, loaded before consumers in `index.html`.
- Choose exact dismissal persistence strategy (session-only vs. bounded localStorage) provided it doesn't mutate gameplay state.
- Choose feedback trigger points: on action attempt (blocked), on action success (confirmation), on screen enter (contextual next-step hint).
- Choose integration with Phase 15 hero surface for "next action" affordances.

</decisions>

<canonical_refs>
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/research/ARCHITECTURE.md`, `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`, `.planning/research/STACK.md`
- `codemap.md`, `STYLE_GUIDE.md`, `src/engine/codemap.md`, `src/systems/codemap.md`, `src/scenes/codemap.md`, `src/ui/codemap.md`
- `src/systems/progression.js`, `src/systems/cultivation_sys.js`, `src/systems/economy.js`, `src/systems/equipment.js`, `src/systems/world_events.js`, `src/systems/save.js`
- `src/scenes/party.js`, `src/scenes/equipment.js`, `src/scenes/cultivationScene.js`, `src/scenes/combatScene.js`, `src/scenes/travelMap.js`, `src/scenes/zoneExploration.js`
- `.planning/phases/13-responsive-screen-grammar-navigation/13-CONTEXT.md`, `13-03-SUMMARY.md`, `13-VERIFICATION.md`
- `.planning/phases/14-combat-gameplay-readability/14-CONTEXT.md`, `14-01-SUMMARY.md`, `14-02-SUMMARY.md`, `14-VERIFICATION.md`
- `.planning/phases/15-character-party-surfaces/15-CONTEXT.md`, `15-01-SUMMARY.md`, `15-02-SUMMARY.md`, `15-03-SUMMARY.md`, `15-VERIFICATION.md`, `15-UI-REVIEW.md`
</canonical_refs>

<deferred>
- New progression rules, deep companion relationships, generic tutorial tours, background/asset pipeline (Phase 17), navigation/store architecture migration (Phase 18), diagnostics implementation (Phase 20), broad lifecycle/deprecated-code cleanup (Phase 19).
</deferred>