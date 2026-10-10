---
phase: 03-mythological-narrative-encounters
plan: 01
subsystem: narrative encounters
tags: [encounters, narrative, flags, canonical-reward-routing, save-migration]

# Dependency graph
requires:
  - phase: 02-access-gate-enforcement
    provides: "Canonical equipment/zone/travel authority gates; working economy/progression systems"
provides:
  - "ENCOUNTERS registry with 2 seed encounters (nagaBargain, marutCrossing)"
  - "EncounterSystem (start/choose/setFlag/isSeen/getChoices/getMarker)"
  - "EncounterTrigger (rollZone/rollTravel with NARRATIVE_CHANCE gate)"
  - "encounterAvailable/getZoneEncounters/getTravelEncounters/pickWeighted helpers"
  - "Default state encounters: {} field in createDefaultGameState"
  - "Save migration for encounters.seen ledger (legacy save tolerance)"
affects: [03-02-encounter-scene, 03-03-lore-encounters]

# Tech tracking
tech-stack:
  added: []
  patterns: [encounter-data-registry, canonical-reward-routing, choice-level-flagsReq, marker-chain-pattern]

key-files:
  created:
    - src/data/encounters.js
    - src/systems/encounter.js
  modified:
    - src/engine/game.js
    - src/systems/save.js
    - index.html

key-decisions:
  - "Duplicate journeyTextLines as scene-local helper (not cross-scene import) — matching journeyScene pattern"
  - "encounterAvailable reads G.state.flags + encounters.seen without mutation (pure-read gate)"
  - "getChoices filters by choice.flagsReq at system level — scene never sees hidden choices"
  - "choose re-validates flagsReq as defense-in-depth before granting rewards"

patterns-established:
  - "Encounter data registry: keyed ENCOUNTERS object with pool/zones/weight/karma/flagsReq/prompt/choices"
  - "Canonical reward routing: Economy.addGold/addKarma/addDivineFragments, Progression.addPartyXP, CultivationSystem.addPrana/addCultivationBase"
  - "Marker convention: G.state.flags['enc_<id>'] = choice marker string"
  - "Ledger convention: G.state.encounters.seen[id] = marker"

requirements-completed: [REQ-003, REQ-005]

# Metrics
duration: 8min
completed: 2026-09-15
---

# Plan 03-01: Encounter Core System Summary

**Encounter data registry with 2 seed encounters, EncounterSystem with canonical reward routing, EncounterTrigger with zone/travel roll pickers, and save migration for the encounters ledger.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-09-15T06:04:56Z
- **Completed:** 2026-09-15T06:12:00Z
- **Tasks:** 3/3
- **Files created:** 2
- **Files modified:** 3

## Accomplishments

- ENCOUNTERS registry with prerequisite/pool/weight helpers and 2 seed encounters (nagaBargain zone, marutCrossing travel)
- EncounterSystem with full lifecycle (start → getChoices → choose → mark seen) using only canonical reward APIs
- EncounterTrigger pure-roll pickers for zone and travel encounter surfacing
- Legacy save migration tolerates the new encounters ledger without crashes

## Task Commits

Each task was committed atomically:

1. **task 1: ENCOUNTERS data registry** - `5cbba94` (feat)
2. **task 2: EncounterSystem + EncounterTrigger** - `05ff895` (feat)
3. **task 3: default state + save migration** - `c2edf0c` (feat)

## Known Stubs

None. All interfaces are fully wired for downstream consumption by Plan 03-02 (encounter scene UI).

## Threat Flags

No new security-relevant surface introduced — encounters read G.state.flags and write via Economy APIs only.

## Self-Check: PASSED
- ENCOUNTERS registry: 2 encounters with correct pool/zones/weight/prompts/choices ✓
- encounterAvailable: level/karma/flag prerequisite checks ✓
- getZoneEncounters/getTravelEncounters: filtered eligible unseen pools ✓
- pickWeighted: weight-based random pick ✓
- EncounterSystem: init/start/isSeen/getMarker/getChoices/choose/setFlag ✓
- EncounterTrigger: rollZone/rollTravel with NARRATIVE_CHANCE ✓
- Canonical reward routing: Economy/Progression/CultivationSystem APIs only ✓
- Choice-level flagsReq: getChoices filters, choose re-validates ✓
- Default state: encounters: {} in createDefaultGameState ✓
- Save migration: G.state.encounters.seen normalization ✓
- index.html: encounters.js + encounter.js script tags present ✓
