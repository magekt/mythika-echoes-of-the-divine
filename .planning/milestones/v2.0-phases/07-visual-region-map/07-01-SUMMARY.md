---
phase: 07-visual-region-map
plan: 01
subsystem: travel-map
tags: [map, layout, zone-access, spatial-topology, helpers]
dependency_graph:
  requires: [REQ-013]
  provides: [map-layout-entries, zone-state-constants, map-helpers-status]
  affects: [src/data/map_layout.js, src/scenes/map_helpers.js, index.html]
tech_stack:
  added: []
  patterns: [spatial-grid-0-1, status-calculation-wrapper, defensive-globals-guard]
key_files:
  created:
    - src/data/map_layout.js
    - src/scenes/map_helpers.js
  modified:
    - src/data/zones.js
    - src/systems/world_state.js
    - index.html
decisions:
  - "Positioned all 6 canonical zones in a 0–1 relative spatial grid with staggered top-to-bottom layout for 400x720 viewports."
  - "Delegated zone status calculation directly to ZoneAccess and WorldState with defensive fallback guards for missing globals."
metrics:
  duration: 4m
  completed_date: "2026-09-16"
---

# Phase 07 Plan 01: Visual Region Map Data & Helpers Summary

## Overview

Plan 07-01 establishes the visual state definitions, spatial region layout, and status calculation helpers required for the Visual Region Map. It introduces `src/data/map_layout.js` (canonical 0–1 coordinate layout, zone visual colors, topology connections) and `src/scenes/map_helpers.js` (helpers calculating zone state, lock reasons, completion percentages, status colors, and WorldState regional influence).

## Deliverables

1. **`src/data/map_layout.js`**
   - `ZONE_STATE`: Frozen object (`LOCKED`, `AVAILABLE`, `ACTIVE`, `COMPLETED`).
   - `MapLayout.ENTRIES`: Array of 6 zone region objects (`aryavarta`, `dandaka`, `meru`, `patala`, `svarga`, `tapobhumi`) with relative 0–1 positions (`x, y, w, h`), realm colors, and progression connections.
   - `MapLayout.getEntry(zoneId)` & `MapLayout.getEntries()`: Lookup accessors.

2. **`src/scenes/map_helpers.js`**
   - `MapHelpers.getStatus(zoneId)`: Computes `LOCKED`, `AVAILABLE`, `ACTIVE`, or `COMPLETED`.
   - `MapHelpers.getLockReason(zoneId)`: Returns human-readable prerequisite/level requirement strings or `null`.
   - `MapHelpers.getCompletion(zoneId)`: Returns integer completion percentage (0–100).
   - `MapHelpers.getStatusColor(status)`: Returns color tokens matching zone status.
   - `MapHelpers.hasInfluence(zoneId)` & `MapHelpers.getControlState(zoneId)`: Integrates with `WorldState` region control metadata.

3. **`index.html` Integration**
   - Registered `src/data/map_layout.js` after `zones.js` and `src/scenes/map_helpers.js` before `travelMap.js`.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create `src/data/map_layout.js` with zone entries and topology | `cbff601` | `src/data/map_layout.js`, `src/data/zones.js`, `src/systems/world_state.js` |
| 2 | Create `src/scenes/map_helpers.js` with status and lock helpers | `15361f7` | `src/scenes/map_helpers.js`, `index.html` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Node CJS exports added to `zones.js` and `world_state.js`**
- **Found during:** Task 1 automated test setup.
- **Issue:** `zones.js` and `world_state.js` declared browser globals without exporting via `module.exports` when required in Node.js test scripts.
- **Fix:** Added safe UMD/Node export blocks (`if (typeof module !== 'undefined' && module.exports)`) at the bottom of both files.
- **Files modified:** `src/data/zones.js`, `src/systems/world_state.js`
- **Commit:** `cbff601`

## Self-Check: PASSED

- [x] `src/data/map_layout.js` exists on disk and is loaded in `index.html`
- [x] `src/scenes/map_helpers.js` exists on disk and is loaded in `index.html`
- [x] Commit `cbff601` exists in git history
- [x] Commit `15361f7` exists in git history
- [x] All 6 zones from `zones.js` are mapped in `MapLayout.ENTRIES`
- [x] Node verification scripts run without errors
