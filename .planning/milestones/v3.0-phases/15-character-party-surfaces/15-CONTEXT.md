# Phase 15: Character & Party Surfaces — Context

**Gathered:** 2026-09-20  
**Status:** Ready for execution planning  
**Requirement:** REQ-025

<domain>
## Phase Boundary

Create one reusable, derived hero-identity presentation surface and integrate it into party, combat, cultivation, equipment, and combat-result views. The surface must expose identity, role, health/progression, equipment/status, and the next actionable upgrade without creating a second character model or changing gameplay rules. It owns presentation and view-model derivation; canonical systems continue to own XP, cultivation, equipment, rewards, save hydration, and combat state.

The phase includes automated source/contract coverage and a browser/device verification recipe. It does not include new heroes, equipment, progression mechanics, guidance framework work assigned to Phase 16, background/asset production assigned to Phase 17, navigation seam migration assigned to Phase 18, or broad lifecycle cleanup assigned to Phase 19.
</domain>

<decisions>
## Locked Decisions

### D-01 — Preserve canonical authority and save compatibility
- Read hero state from `G.state.party` / `G.state.player`, derived stats from `calcHeroStats`, XP thresholds from `Progression.xpForLevel`, realm data from `CultivationSystem`, and equipment from the existing hero equipment fields/`EquipmentSystem`.
- Do not duplicate mutable progression, equipment, reward, or status state in the UI, and do not change save schema or migration behavior for presentation-only data.

### D-02 — One reusable identity surface, context-specific density
- Define one global/script-order-compatible helper under `UI` or `Scene` (executor chooses the exact name) that renders the same semantic identity fields while supporting compact roster, standard detail, and result/readout variants.
- Party, combat, cultivation, equipment, and result screens must consume the helper rather than maintain incompatible hero-card semantics.

### D-03 — Actionable progression without bypassing systems
- Every relevant surface must make the next meaningful action legible: inspect/equip in party/equipment, meditate/break through in cultivation, act/target in combat, and continue/return after result.
- Buttons invoke existing scene/system APIs only; no presentation-owned XP, stat, equipment, or reward mutation.

### D-04 — Responsive and accessible Canvas grammar remains authoritative
- Preserve the 400×720 logical canvas, Phase 13 layout profile and labeled navigation/back behavior, Phase 14 combat state bands, semantic renderer tokens, 44–48px touch targets, measured wrapping, touch/mouse/keyboard parity, and `R.reducedMotion()` behavior.
- Compact/mobile layouts may progressively disclose secondary details, but role, health/progression, equipped state, and primary action remain visible or explicitly inspectable.

### D-05 — Defensive legacy/malformed state handling
- Missing or malformed optional hero/equipment/status fields render safe fallback labels and never block scene entry. Existing save hydration remains untouched except for any non-mutating selector normalization required to read old saves.
- The surface must not assume a complete hero object or a newly introduced field exists.

## OpenCode's Discretion

- Choose the helper file and API shape, provided it is loaded before all consumers in `index.html`, exposes deterministic derived view data, and has no gameplay side effects.
- Choose exact panel geometry and density variants using existing `Scene`, `UI`, `R`, and responsive helpers; do not introduce a framework, DOM screen rewrite, bundler, or parallel state store.
- Choose the result-view integration point inside the Phase 14 result band, provided it does not overlap actions/log/outcome text and preserves origin-aware continuation.

</decisions>

<canonical_refs>
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/research/ARCHITECTURE.md`, `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`, `.planning/research/STACK.md`
- `codemap.md`, `STYLE_GUIDE.md`, `src/engine/codemap.md`, `src/systems/codemap.md`, `src/scenes/codemap.md`, `src/ui/codemap.md`
- `src/data/heroes.js` (`createHeroState`, `calcHeroStats`), `src/data/items.js` (`EquipmentSystem`), `src/systems/progression.js`, `src/systems/cultivation_sys.js`
- `src/scenes/party.js`, `src/scenes/equipment.js`, `src/scenes/cultivationScene.js`, `src/scenes/combatScene.js`
- `.planning/phases/13-responsive-screen-grammar-navigation/13-CONTEXT.md`, `13-03-SUMMARY.md`, `13-VERIFICATION.md`
- `.planning/phases/14-combat-gameplay-readability/14-CONTEXT.md`, `14-01-SUMMARY.md`, `14-02-SUMMARY.md`, `14-VERIFICATION.md`
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-UI-REVIEW.md`, `12-PATTERNS.md`
- `.planning/debug/layout-spacing-game-view.md`, `.planning/debug/phase-6-legacy-save.md`
</canonical_refs>

<deferred>
- New hero/equipment/content, new progression rules, deep companion relationships, generic tutorial tours, background/asset pipeline, navigation/store architecture migration, diagnostics implementation, and broad lifecycle/deprecated-code cleanup.
</deferred>
