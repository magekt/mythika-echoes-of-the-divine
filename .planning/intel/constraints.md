# Synthesized Constraints

## Stable global API contracts
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/API.md`
- type: api-contract
- content: Global namespaces include G, R, Scene, Fade, Input, Audio, Notify, Combat, Progression, CultivationSystem, SaveSystem, JourneySystem, QuestSystem, Economy, Duel, and UI. Systems operate on G.state; UI factories expose render/update/contains/onClick-style behavior; data is loaded from src/data/*.js.

## Persistence and defensive behavior
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/API.md`
- type: nfr
- content: Save operations must support migration, invalid-state sanitization, auto-save, reduced motion, deferred audio unlock, guarded optional effects, and bounded input queues.

## Layered runtime architecture
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/ARCHITECTURE.md`
- type: protocol
- content: index.html script order is the dependency graph; engine, systems, data, scenes, and UI communicate through globals and scene lifecycle methods. Rendering is immediate-mode Canvas 2D and persistence is handled by SaveSystem.

## Coding and UI conventions
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/STYLE_GUIDE.md`
- type: nfr
- content: Use two-space JavaScript, semantic R.colors/R.fonts/R.radius tokens, shared UI factories, 400x720 logical coordinates, scene-owned cleanup, defensive guards, touch/mouse parity, and R.reducedMotion().

## Party detail interaction
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/PARTY_DETAIL_ACTIONS_DESIGN.md`
- type: protocol
- content: Preserve existing scene header and clipped content region; controls use a 48px height, 10px rhythm, 20px side inset, full-width hitboxes, and translated scroll coordinates.

## Cultivation interaction and accessibility
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/CULTIVATION_SCENE_DESIGN.md`
- type: nfr
- content: Use semantic tokens, WCAG AA contrast, accessible progress semantics, visible focus, restrained magnetic interactions, and reduced-motion fallbacks.

## Rebirth and travel-map interaction
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/PUNARJANMA_SCENE_DESIGN.md`
- type: protocol
- content: Keep rebirth calculations and callbacks unchanged; show explicit eligibility and irreversible consequences. Travel-map state cards and actions must preserve access calculations and callbacks.
