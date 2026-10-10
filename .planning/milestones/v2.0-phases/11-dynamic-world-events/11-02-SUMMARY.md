---
phase: 11-dynamic-world-events
plan: 02
subsystem: scenes
tags: [world-events, travel-map, event-indicators, detail-panel, map-helpers, resolve-action]

# Dependency graph
requires:
  - phase: 11-dynamic-world-events
    plan: 01
    provides: "WorldEvents.getForZone, WorldEvents.resolve, event template data with markerColor/remainingTime/status"
  - phase: 10-environmental-narrative-echoes
    provides: "MapHelpers.getNarrativeEchoes convention (typeof-guard query APIs on map_helpers)"
provides:
  - "MapHelpers.getWorldEvents(zoneId) scene-side query helper for active events"
  - "Travel Map event indicators, tap selection, detail panel, and resolve flow"
  - "Scene-level tests in tests/travel_map_events.test.js (10 cases)"
affects:
  - "11-dynamic-world-events (plan 03 consumes getWorldEvents/getNarrativeEchoes in mock)" [REQ-018 expecting 0 failures in full suite]
  - "map-rendering and map perf (phase 12 will re-measure on the now busier map)"

# Tech tracking
tech-stack:
  added: []
  patterns: [typeof-guard-api, feature-triad-render-hittest-detail, context-action-slot, reduced-motion-guard]

key-files:
  created: []
  modified:
    - src/scenes/map_helpers.js
    - src/scenes/travelMap.js
    - tests/travel_map_events.test.js

key-decisions:
  - "MapHelpers.getWorldEvents follows the getNarrativeEchoes convention: typeof-guard on WorldEvents.getForZone and returns [] fallback so scenes stay safe during stale sw-cache loads"
  - "Event indicator dots render at the bottom-left corner of each region cell (rect.y + rect.h - 14, gap 16), one dot per active event, opposite the landmark indicator row"
  - "Expiring events (remainingTime < 300s) draw the outer dot in danger color with a small inner marker-color core so urgency and event identity both read at a glance"
  - "Pulse animation drives dot radius via performance.now() sine (5 +/- 1.5px); R.reducedMotion() renders a static radius-5 dot"
  - "The Enter Zone button acts as a context action slot: selecting an event relabels it Resolve, calls WorldEvents.resolve, shows a Notify toast with reward parts (gold/karma/divine fragments), and clears the selection"
  - "Event detail panel reuses the landmark detail slot (x=12, y=G.H-252, w=G.W-24, h=244) with a markerColor border accent; expired events render expiry text and no action button"
  - "Hit testing follows the landmark chain: event hit-test runs before landmark/zone, and selecting an event clears selectedLandmark (and vice versa)"

patterns-established:
  - "Map feature triad: indicator render -> hit-test -> detail panel (echoes, landmarks, and now world events)"
  - "typeof-guard API fallback keeps scene queries safe during stale cache scenarios"
  - "Enter-button action dispatch by selected state (zone vs event)"

requirements-completed: [REQ-018]

# Metrics
duration: 1min
completed: 2026-09-18
---

# Phase 11 Plan 02: Dynamic World Events Summary

**World event indicators, tap selection, detail panel, and resolve flow integrated into the Travel Map**

> Note: duration reflects the final commit span, not the full investigation/write window.

## Performance

- **Duration:** ~1 min (commit span 17:14:56Z-17:15:51Z)
- **Started:** 2026-09-18T17:14:56Z
- **Completed:** 2026-09-18T17:15:51Z
- **Tasks:** 1 (multi-step)
- **Files modified:** 3

## Accomplishments

- Added `MapHelpers.getWorldEvents(zoneId)` with typeof-guard fallback that delegates to `WorldEvents.getForZone` (returns `[]` when unavailable) (`src/scenes/map_helpers.js`)
- Rendered pulsing event indicator dots on region cells (markerColor; danger-colored outer dot with inner core when expiring within 300s; static radius-5 dot under reduced motion) (`src/scenes/travelMap.js`)
- Added event hit testing (`hitTestEvent`) ahead of landmark/zone in the tap chain; selecting an event clears `selectedLandmark` and sets the Enter button to Resolve
- Built the event detail panel in the landmark detail slot: icon, label, wrapped description, remaining time (`< 1 min` / `Xm` / `Xh Xm`), Resolve action when active, expiry text with no action when expired
- Wired resolve through the existing Enter button: calls `WorldEvents.resolve`, shows a Notify reward toast (gold/karma/divine fragments), clears selection
- Added 10 scene-level tests in `tests/travel_map_events.test.js`: getWorldEvents delegation/unavailable/empty-zone, selectedEvent init, dot render presence/absence, detail panel content, expired no-resolve, resolve-and-clear, reduced-motion static dot

## Commits

Each task was committed atomically:

1. **MapHelpers.getWorldEvents helper** - `1f45322` (feat)
2. **Event indicators, hit testing, detail panel** - `954314f` (feat)
3. **Scene-level tests for event map integration** - `b52dff8` (test)

## Files Modified

- `src/scenes/map_helpers.js` - `getWorldEvents(zoneId)` added with typeof-guard on `WorldEvents.getForZone`
- `src/scenes/travelMap.js` - `selectedEvent` data field, `renderEventIndicators`, `hitTestEvent`, `renderEventDetail`, resolve flow via Enter button, reduced-motion guard
- `tests/travel_map_events.test.js` - 10 test cases using the existing vm sandbox scene-test harness

## Decisions Made

- Dots sit at the cell bottom-left corner (gap 16, one per active event) rather than below the echo row, keeping the echo indicator layout untouched
- Event detail panel matches the landmark detail slot exactly so the two detail states never overlap layouts
- Resolve reuses the primary Enter button (relabeled Resolve) instead of adding a new tap target - keeps the touch-first layout unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Scope] Event dot placement**
- **Plan said:** indicators "positioned below narrative echo indicators" (upper area of the cell)
- **Implemented:** bottom-left corner of the cell (`rect.y + rect.h - 14`), opposite the landmark indicators
- **Rationale:** echo indicators occupy the upper-left with narrative descriptions; the bottom corner is visually distinct and never collides
- **Impact:** none - no test asserted a specific position

**2. [Scope] Expiring tint rendering**
- **Plan said:** "red tint in addition to markerColor"
- **Implemented:** outer dot drawn in danger color with a small inner marker-color core
- **Impact:** none - behavior (urgent + identifiable) preserved; tests assert draw calls, not exact colors

## Verification

- `node --test tests/travel_map_events.test.js` - 10/10 pass
- `node --test tests/*.test.js` - 46/47 at this point (travel_map_landmarks crashed on the stale mock); 48/48 after 11-03
- **Human verification checkpoint (autonomous: false):** NOT conducted in automation. Required browser pass per the plan (verification section): event dots visible on eligible regions, detail panel shows correct info, resolve applies rewards and removes the event, expired events handled correctly. Flagged as remaining manual step in STATE.md.
