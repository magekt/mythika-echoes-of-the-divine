---
phase: 18-modular-navigation-screen-seams
plan: 01
subsystem: engine
tags: [navigation, routing, architecture, compatibility]

requires:
  - phase: 13-responsive-screen-grammar-navigation
    provides: responsive screen grammar and layout contracts
  - phase: 14-combat-gameplay-readability
    provides: combat state bands and regression contracts
  - phase: 15-character-party-surfaces
    provides: hero surface context for character screens
  - phase: 17-canvas-backgrounds-asset-ready
    provides: background system for scene integration
provides:
  - Global Navigation namespace with canonical route IDs, context/command schemas, transitions, and legacy compatibility
  - Contract tests covering route resolution, transition flow, failure recovery, legacy compatibility, authority boundaries
affects: [18-modular-navigation-screen-seams, 19-lifecycle-safety-deprecated-cleanup, 20-settings-diagnostics-full-loop]

tech-stack:
  added: []
  patterns: [canonical route IDs, context/command schemas, fade transitions, legacy gScene wrapper, read-only context, system-delegated commands]

key-files:
  created:
    - src/engine/navigation.js
    - tests/navigation.test.js
  modified:
    - index.html

key-decisions:
  - "Canonical route IDs: ashram, travelMap, zoneExploration, combat, party, equipment, cultivation, settings"
  - "Legacy scene names mapped via legacySceneMap for backward compatibility"
  - "Context schemas declare derived presentation data only (partySummary, zoneStatus, heroSurfaceModel, etc.)"
  - "Command schemas wrap canonical system calls (EquipmentSystem.equip, Combat.start, CultivationSystem.addCultivationBase)"
  - "Transitions use Fade with 150ms fade (0ms reduced motion), total budget ≤500ms"
  - "Failure modes: invalid route → ashram + Notify; missing params → derive from G.state; system unavailable → disabled actions"
  - "Transition state tracked in G.state.transition for debugging/probe"
  - "Navigation.go is canonical API; gScene wrapped for legacy compatibility"

patterns-established:
  - "Navigation.go(routeId, params) for all new navigation"
  - "Routes register contextSchema/commandSchema in enter()"
  - "Context builders read G.state and return frozen/cloned derived data"
  - "Commands delegate to canonical systems; never mutate G.state directly"
  - "Transition state tracked for debugging/probe integration"

requirements-completed:
  - REQ-030

duration: 35min
completed: 2026-10-08
---

# Phase 18 Plan 1: Navigation System Foundation

**Global Navigation system with canonical route IDs, context/command schemas, transitions, and legacy compatibility**

## Performance

- **Duration:** 35 min
- **Started:** 2026-10-08T22:00:00Z
- **Completed:** 2026-10-08T22:35:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `src/engine/navigation.js` with global `Navigation` namespace providing `go()`, `register()`, `getContext()`, `getCommands()`, `transition()`, route registry, legacy compatibility wrapper
- Implemented 8 canonical route IDs: ashram, travelMap, zoneExploration, combat, party, equipment, cultivation, settings with full context/command schemas
- Built transition system using Fade (150ms fade, 0ms reduced motion, ≤500ms total budget) with failure recovery to ashram + Notify
- Created legacy compatibility wrapper for `gScene()` mapping old scene names to route IDs
- Registered navigation.js in index.html after scene.js in script dependency order
- Created comprehensive contract tests (9 tests passing) covering route resolution, transitions, failure recovery, legacy compatibility, authority boundaries
- All 147 tests pass including new navigation tests

## Task Commits

1. **task 1: establish the navigation system contract** - `src/engine/navigation.js`, `tests/navigation.test.js` (feat)
2. **task 2: register the navigation system in dependency order** - `index.html` (feat)

## Files Created/Modified
- `src/engine/navigation.js` - Global Navigation: go(), route registry, transition manager, compatibility layer
- `tests/navigation.test.js` - Contract tests for route resolution, transition flow, failure recovery, legacy compatibility, authority boundaries
- `index.html` - Added script tag for navigation.js after scene.js

## Decisions Made
- Canonical route IDs use camelCase without "Scene" suffix (ashram, travelMap, zoneExploration, combat, party, equipment, cultivation, settings)
- Legacy scene names (ashramScene, travelMapScene, etc.) mapped via legacySceneMap for backward compatibility
- Context schemas declare derived presentation data only (partySummary, zoneStatus, heroSurfaceModel, regionMap, worldEvents, landmarks, influence, zoneDetail, journeys, encounters, encounterSetup, partySurface, enemySurface, partyDetail, heroSurface, inventory, equipped, realmProgress)
- Command schemas wrap canonical system calls (EquipmentSystem.equip, Combat.start, CultivationSystem.addCultivationBase, etc.)
- Transitions use Fade with 150ms fade in/out (0ms reduced motion), total budget ≤500ms
- Failure modes: invalid route → ashram + Notify; missing params → derive from G.state + Notify; system unavailable → disabled actions + blocker tooltip
- Transition state tracked in G.state.transition for debugging/probe integration
- Navigation.go is canonical API; gScene wrapped for legacy compatibility

## Patterns Established
- Navigation.go(routeId, params) for all new navigation
- Routes register contextSchema/commandSchema in enter()
- Context builders read G.state and return frozen/cloned derived data
- Commands delegate to canonical systems; never mutate G.state directly
- Transition state tracked for debugging/probe integration

## Deviations from Plan
None - plan executed as written.

## Issues Encountered
None.

## Next Phase Readiness
- Navigation system ready for screen integration (Plan 18-02)
- All contract tests passing
- Script order verified in index.html

---
*Phase: 18-modular-navigation-screen-seams*
*Completed: 2026-10-08*