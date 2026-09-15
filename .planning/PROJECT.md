# Mythika: Echoes of the Divine

## What This Is

Mythika is a mobile-first cultivation RPG inspired by Indian mythology and lore. It combines idle progression with active tactical combat, party and build choices, exploration, farming, alchemy, and journeys through ascending realms.

This milestone evolves the existing game from a collection of idle-RPG systems and screens into a coherent mythic adventure where travel, narrative encounters, tactical choices, rewards, and return-to-Ashram progression feel connected and trustworthy on desktop and mobile.

## Core Value

Every play session should feel like a meaningful cultivation journey: the player understands their next path, makes consequential choices, and trusts that their progress and rewards persist correctly.

## Requirements

### Validated

- ✓ Active turn-based combat with reactions, intent telegraphs, party actions, rewards, and results — existing
- ✓ Cultivation, realm breakthroughs, farming, alchemy, party, equipment, journeys, zones, bosses, and rebirth systems — existing
- ✓ Canvas-based mobile-first screen architecture with semantic visual tokens and reduced-motion support — existing
- ✓ Save-backed local progression and PWA/service-worker delivery — existing

### Active

- [ ] Enforce progression and access rules at authoritative mutation and entry points rather than relying on presentation-only UI gates.
- [ ] Make save hydration and equipment handling consistent, safe, and resistant to stale-session state leakage.
- [ ] Add mythology-driven narrative encounters whose choices trade immediate rewards and lasting future consequences.
- [ ] Improve Combat, Travel, and connected screen UX so key information, next actions, and outcomes remain legible on mobile and desktop.
- [ ] Refactor touched gameplay and UI boundaries into clear reusable systems without changing intended game balance.
- [ ] Reuse existing heroes, beasts, journeys, Siddhis, equipment, farming, alchemy, and zone systems in a more connected player loop.

### Out of Scope

- Living-map landmarks and world-state visualization beyond the existing Travel Map — deferred to a later roadmap phase after narrative encounters are established.
- Deep character-relationship or companion-bond systems — deferred until encounter consequences have a stable persistence model.
- Broad new zones, hero rosters, or live-service backend features — this milestone prioritizes coherence and reliability of existing systems.
- Replacing the Canvas architecture with a framework UI — preserve the existing vanilla JavaScript Canvas implementation.

## Context

- Existing codebase: vanilla ES6, HTML5 Canvas 2D, Web Audio API, localStorage, PWA; `index.html` loads scripts in dependency order.
- Existing documentation: root `codemap.md`, folder codemaps, and `.slim/deepwork/access-gates-combat-ui.md`.
- Completed recent work includes active combat reactions, cultivation level locks, automatic farming, zone-clear rewards, and several screen UI passes.
- Current uncommitted hardening work covers full-state save hydration, canonical equipment handling, authoritative zone access, and Travel Map locked-state UX; it requires UAT before commit.
- The user wants a cultivation game grounded in Indian mythology that is not merely idle: tactical battles, meaningful journeys, build crafting, and world mastery all matter.

## Constraints

- **Architecture**: Preserve vanilla JS and immediate-mode Canvas — existing scenes/systems use global game state and script-order dependencies.
- **Gameplay**: Preserve intended current balance and successful existing mechanics unless an approved requirement changes them.
- **Cross-device UX**: Maintain readable mobile touch targets and coherent desktop-scaled Canvas presentation.
- **Reliability**: Access, reward, equipment, and save rules must be authoritative in systems/entry points, not only visually implied by UI.
- **Cultural direction**: Use Indian mythology and lore respectfully as the world and narrative foundation.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| First new world-immersion focus is narrative encounters | It is the smallest connected way to make travel and choices feel meaningful now | — Pending |
| Encounter choices affect immediate rewards and future consequences | Combines short-term agency with lasting story/world impact | — Pending |
| Technical reliability is a milestone must-have | Players must trust gate, equipment, save, and reward outcomes before new content expands them | — Pending |
| Preserve Canvas and modularize touched boundaries | Reduces regression risk while enabling future feature reuse | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

After each phase transition: revisit validated, active, and out-of-scope requirements; record new decisions; and ensure this description remains accurate. After the milestone: reassess core value, deferred world features, and the game’s integrated player loop.

---
*Last updated: 2026-09-14 after project initialization*
