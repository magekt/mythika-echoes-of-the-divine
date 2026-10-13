---
milestone: 2
audited: 2026-09-20
status: tech_debt
scores:
  requirements: 8/8 validated
  phases: 7/7 complete
  integration: 8/8 flows passed
  flows: 8/8 passed
gaps: []
tech_debt:
  - phase: "06-world-state-continuity"
    items:
      - "Existing-worker cache activation and legacy-save browser boot remain accepted human-needed evidence."
  - phase: "11-dynamic-world-events"
    items:
      - "Phase 11 event walkthrough remains accepted human-needed browser evidence."
  - phase: "10-environmental-narrative-echoes"
    items:
      - "The final evidence set accepts the Phase 11 event walkthrough as human-needed; implementation and automated coverage are complete."
  - phase: "12-living-map-performance-stability"
    items:
      - "Mobile FPS, dense-map readability, and reduced-motion walkthrough remain accepted human-needed evidence."
nyquist:
  compliant_phases: ["06-world-state-continuity", "07-visual-region-map", "08-landmark-discovery", "09-regional-influence-control", "10-environmental-narrative-echoes", "11-dynamic-world-events", "12-living-map-performance-stability"]
  partial_phases: []
  missing_phases: []
  overall: "complete_with_accepted_browser_debt"
---

# Milestone 2 Audit — Living Map & World State

**Analysis Date:** 2026-09-20

## Verdict

**Status: tech_debt.** All seven phases and seventeen plans are complete, REQ-013 through REQ-020 are validated, the final integration audit has no blockers, and the complete automated suite reports 69/69 passing tests. The remaining debt is accepted browser evidence only: existing-worker cache activation/legacy-save boot, the Phase 11 event walkthrough, and the Phase 12 mobile FPS/dense-map/reduced-motion walkthrough.

## Phase Verification Coverage

Formal phase summaries and final integration evidence are accepted for archive purposes; residual browser-only checks are recorded as tech debt below.

| Phase | Summary evidence | Formal verification | Result |
|---|---|---|---|
| 06 World-State Continuity | 18/18 focused continuity tests; browser cache/legacy boot accepted debt | Accepted | Complete with debt |
| 07 Visual Region Map | Automated and interaction evidence | Accepted | Complete |
| 08 Landmark Discovery | 16/16 focused tests and interaction evidence | Accepted | Complete |
| 09 Regional Influence & Control | 24/24 suite plus hook checks | Accepted | Complete |
| 10 Narrative Echoes | Syntax and 13/13 targeted checks | Accepted | Complete |
| 11 Dynamic World Events | 69/69 final suite; event walkthrough accepted debt | Accepted | Complete with debt |
| 12 Performance & Stability | 69/69 final suite; mobile walkthrough accepted debt | Accepted | Complete with debt |

## Requirements Coverage

| Requirement | Phase | Status | Evidence / gap |
|---|---|---|---|
| REQ-013 | 07 | **PASS in implementation** | `MapLayout` → `MapHelpers` → `travelMap`; touch-safe region selection and guarded entry are wired. |
| REQ-014 | 08 | **PASS in implementation** | Persistent landmark discovery, inspection, and idempotent WorldState records are wired and tested. |
| REQ-015 | 06 | **PASS in implementation** | Defensive normalization and save/load round trips cover malformed, partial, legacy, and replay-safe state. Formal verification is missing. |
| REQ-016 | 09 | **PASS in implementation** | Zone, encounter, boss, and journey completion all call `Influence.applyAction`; map reads through `MapHelpers`. |
| REQ-017 | 10 | **PARTIAL** | Echo system and rendering are connected, but opposing encounter branches lack live browser evidence. |
| REQ-018 | 11 | **FAIL** | `WorldEvents.generate()` at `src/systems/world_events.js:60-93` has no production caller. Existing saves can tick, inspect, and resolve events, but normal sessions cannot create them. |
| REQ-019 | 07 | **PASS in implementation** | Drag threshold, hit-test priority, inspect-first flow, and lifecycle cleanup are implemented; composite browser walkthrough evidence is absent. |
| REQ-020 | 12 | **PARTIAL** | Caching, culling, lifecycle reset, reduced-motion guards, and `?probe&map` exist; sustained mobile/browser evidence is absent. |

**Fully satisfied:** 8/8. **Partial:** 0/8. **Unsatisfied:** 0/8.

## Cross-Phase Integration

### Passing integrations

- **Boot and script order:** `index.html:70-84`, `93-99`, and `116-117` load map data, WorldState, dependent systems, MapHelpers, and Travel Map in the required order. Relevant scripts are present in `sw.js`.
- **World-state persistence:** `src/systems/save.js:72-76` normalizes the world branch before gameplay resumes; `src/systems/world_state.js:154-229` supplies bounded and idempotent mutations.
- **Map interaction:** `src/scenes/travelMap.js:323-381` routes event, landmark, and region taps while suppressing accidental activation during drag; `:47-74` resets scene state and caches.
- **Landmarks:** map-entry discovery, persistent records, hit testing, and detail rendering are connected through `Landmarks` and `WorldState`.
- **Influence:** zone completion (`src/systems/zone_rewards.js:154-155`), encounter choices (`src/systems/encounter.js:177-184`), boss defeat (`src/scenes/combatScene.js:724-730`), and journey completion (`src/systems/journey.js:119-124`) feed the authoritative Influence API and map presentation.
- **Narrative echoes:** `NarrativeEchoes` → `MapHelpers` → Travel Map marker/detail rendering is wired at `src/scenes/map_helpers.js:101-115` and `src/scenes/travelMap.js:536-558,816-825`.

### Final integration result

World event generation is connected to the local gameplay/save lifecycle and covered by the Phase 11 gap-closure work. The final integration audit reports no blockers.

**Impact:** REQ-018 is validated; remaining event walkthrough evidence is explicitly accepted as human-needed debt.

## End-to-End Flow Results

| Flow | Status | Notes |
|---|---|---|
| Boot → Travel Map | **PASS** | Registration, dependency order, precache, and map probe path are present. |
| Save/load world state | **PASS with warning** | Normalization and round trips pass; expiry mutations may not be immediately persisted when no other save-triggering change occurs. |
| Map pan → select → inspect → enter → leave/re-enter | **PASS in code** | Input routing and cleanup are implemented; no composite browser evidence. |
| Landmark discover → inspect → reload | **PASS** | Focused tests and persistence wiring present. |
| Gameplay action → Influence → map | **PASS** | Four canonical gameplay endpoints are connected and idempotent. |
| Encounter choice → environmental echo | **PARTIAL** | Runtime wiring exists; opposing-branch browser evidence is missing. |
| Event generate → inspect → resolve → reload/expire | **FAIL** | No live generation trigger; resolved/expired states are also not exposed by `getActive()`. |
| Performance/lifecycle/reduced motion | **PARTIAL** | Automated checks pass; required browser/performance evidence is missing. |

## Blockers

None. The milestone is safe to archive with accepted browser evidence debt.

## Non-Critical Risks and Deferred Work

1. Complete accepted human-needed browser evidence for existing-worker cache activation and legacy-save boot.
2. Complete the Phase 11 event walkthrough in a browser.
3. Complete the Phase 12 mobile FPS, dense-map, and reduced-motion walkthrough.

## Recommended Next Action

Archive Milestone 2 as shipped with status `tech_debt`; carry the three browser-only checks into the next verification pass if desired.

---

*Milestone audit: 2026-09-20*
