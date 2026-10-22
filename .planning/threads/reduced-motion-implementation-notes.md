---
slug: reduced-motion-implementation-notes
title: Reduced-motion implementation notes
status: resolved
created: 2026-10-15
updated: 2026-10-15
---

# Thread: Reduced-motion implementation notes

## Goal

Reduced-motion implementation notes

## Context

*Created 2026-10-15.*

### Scan results (2026-10-15)
- **74 occurrences** of `reduceMotion` / `reducedMotion` across **23 source files**
- Two distinct gate patterns in use:
  1. `G.state.reduceMotion` — direct state access (e.g., `src/engine/renderer.js:490`, `:501`)
  2. `R.reducedMotion()` — helper returning boolean (e.g., `renderer.js:99-112`, `ui/feedback.js:16`)
  3. `window.matchMedia('(prefers-reduced-motion: reduce)')` — media query fallback

### Files currently checking reduced motion
```
src/engine/renderer.js         (lines 99,115,490,501,738,870)
src/ui/feedback.js             (line 16)
src/ui/list.js                 (line 70)
src/ui/modal.js                (line 79)
src/ui/button.js
src/ui/component.js
src/ui/panel.js
src/scenes/combatScene.js
src/scenes/cultivationScene.js
src/scenes/travelMap.js
src/scenes/fishing.js
src/scenes/equipment.js
src/scenes/title.js
src/scenes/settings.js
src/scenes/systems/combatFx.js
src/engine/game.js
src/engine/scene-helpers.js
src/engine/backgrounds.js
src/engine/navigation.js
src/engine/audio.js
src/engine/diagnostics.js
```

### Known inconsistencies to audit
- **Phase 50 review flagged**: "mixed implementation of R.reducedMotion()" — some components snap instantly, others may ignore it
- Some callers use `G.state.reduceMotion` directly while others use `R.reducedMotion()` — mixing two APIs risks inconsistency
- No centralized audit exists; DMG-05 (Phase 54) and DMG-07 (Phase 55) must gate floaters + particle bursts through a single path

### Conventions to enforce in v11.0
- All new FX must call `R.reducedMotion()` (never `G.state.reduceMotion` directly)
- `R.reducedMotion()` already checks both `G.state.reduceMotion` AND `matchMedia` — single source of truth
- Particle burst on hit (Phase 55) must check `R.reducedMotion()` at spawn time, not render time
- Document any existing call sites that still use the old pattern for separate fix tracking

