---
phase: 10-environmental-narrative-echoes
plan: 02
subsystem: scenes
tags: [narrative-echoes, region-map, travel-map, rendering]

# Dependency graph
requires:
  - phase: 10-environmental-narrative-echoes
    plan: 01
    provides: "NARRATIVE_ECHOES data registry and NarrativeEchoes.getForRegion API"
  - phase: 07-visual-region-map
    provides: "MapLayout entries, travelMap scene with region cells and detail panel"
  - phase: 08-landmark-discovery
    provides: "Landmarks indicators rendering pattern on region cells"
provides:
  - "Echo marker rendering on region cells (colored dot + label)"
  - "Narrative echo label + description in the region detail panel"
  - "Reduced-motion-safe echo markers"
affects:
  - "10-environmental-narrative-echoes"
  - "region-map-rendering"

# Tech tracking
tech-stack:
  added: []
  patterns: [map-helper-delegation, reduced-motion-guard]

key-files:
  created: []
  modified:
    - src/scenes/map_helpers.js
    - src/scenes/travelMap.js
    - sw.js

key-decisions:
  - "MapHelpers.getNarrativeEchoes delegates to NarrativeEchoes.getForRegion with an optional-guard (returns [] when system unavailable)"
  - "MapHelpers.getNarrativeEchoColor exposes the first active echo marker color for map styling"
  - "Echo indicators render as a colored dot + label per active echo; skipped entirely under reduced motion except the static dot"
  - "Detail panel shows the first echo's label (colored) and wrapped description; locked regions suppress echo rendering"
  - "sw.js precache updated for narrative echo data/system (coherence test guards this)"

patterns-established:
  - "Map scene helper delegation: scene calls MapHelpers.* which delegates to owning system with optional-guard"
  - "Echo markers placed under landmark indicators at the region cell bottom, using markerColor for visual distinction"

validation:
  - "node --test tests/world_state.test.js tests/save_coherence.test.js — 13/13 pass (sw.js coherence test caught the precache gap)"
  - "node -c src/scenes/travelMap.js passes"

commits:
  - "c6b37d3 feat(10-02): add getNarrativeEchoes/getNarrativeEchoColor to MapHelpers"
  - "27c45e6 feat(10-02): render echo markers on region cells and narrative descriptions in detail panel"
  - "b11f545 fix(10-02): precache narrative echo data and system in service worker"

# Verification evidence
verification:
  automated:
    - "JavaScript syntax check: node -c passes"
    - "Full test suite: 13/13 pass"
  manual:
    - "Open Travel Map and select a region with a resolved encounter flag; expect echo label + description in detail panel"
    - "Regions without flags show no echo markers"
    - "Reduced motion: markers render as static dots only"