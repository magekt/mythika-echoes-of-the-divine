**Confidence:** HIGH
Phase 03 adds mythology-driven narrative encounters that trigger during zone exploration and travel, present choices, and persist consequences. This is a greenfield subsystem, but the codebase already contains a near-identical pattern — `JOURNEYS` data + `JourneySystem` + `journeyScene` (choice nodes, rewards, persistent progress). Phase 03 generalizes that pattern: encounters hook into the existing zone-exploration and travel loops, write durable markers into `G.state.flags`, and route rewards exclusively through canonical system APIs.
**Primary recommendation:** Implement three layers.
1. **Data** — `src/data/encounters.js`: a `ENCOUNTERS` registry (object keyed by id, like `JOURNEYS`) plus pure helper functions `encounterAvailable(enc, ctx)`, `getZoneEncounters(zoneId)`, `getTravelEncounters(fromZone, toZone)`. Encounter entries declare `pool: 'zone' | 'travel'`, eligible `zones`, level bounds, `flagsReq` (markers that gate the encounter), optional `karmaMin`/`karmaMax`, a `prompt`, and `choices[]`.
2. **System** — `src/systems/encounter.js`: `EncounterSystem` (stateless operator on `G.state`, matching every other system) with `start(id)`, `choose(id, choiceIdx)`, `getState(id)`, `setFlag(key, value)`, and an `EncounterTrigger` object with `shouldRollZone(zoneId)` and `shouldRollTravel(fromZone, toZone)` — pure pickers that never mutate state.
3. **Scene** — `src/scenes/encounterScene.js`: Canvas choice UI modeled on `journeyScene`'s detail view (`UI.PremiumShell` cards, `journeyTextLines`-style wrapping, `Scene.scrollInput`/`Scene.drawScrollbar`, `Scene.cullButtons`). Shows prompt + per-choice cards with consequence preview; resolves via `EncounterSystem.choose`; returns to origin scene.

**Trigger wiring:** `zoneExploration` already has an `encounterTimer` that spawns enemies (line ~267). Add a narrative roll at that point: when the timer fires, if `EncounterTrigger.shouldRollZone(zoneId)` returns an encounter id, route to `encounterScene` instead of spawning an enemy. `travelMap`'s travel action (around line 192, before `ZoneAccess.enter`) gets a travel-lane roll; on resolve, the scene resumes travel into the pending zone.

**Canonical reward routing (REQ-005):** `EncounterSystem.choose` applies `reward` exactly like `JourneySystem.choose` (journey.js lines 84-101) — the accepted canonical path in this codebase:
- `gold`/`karma`/`divineFragments` → `Economy.addGold` / `Economy.addKarma` / `Economy.addDivineFragments` (negative amounts reduce — `addKarma` accepts negatives, used by Wrath-path journeys)
- `xp` → `Progression.addPartyXP`
- `prana`/`cultivationBase` → `CultivationSystem.addPrana` / `CultivationSystem.addCultivationBase`
- `items` → `Economy.addItem(item)` (consumables/herbs stack; triggers `QuestSystem.trackCollect`)
- stat grants (`hp`/`str`/`agi`/`mag`/`def`) → direct party-hero mutation, the existing journey precedent
- After grants: `QuestSystem.trackCollect` (for items) and `AchievementSystem.check()`
No new currency/stat mutation paths. Verification uses grep/`node -e` gates asserting the new files never assign `G.state.gold`/`G.state.karma`/etc. directly.

**Marker storage (REQ-004):** Two layers, both durable through `SaveSystem`:
1. `G.state.flags['enc_<encounterId>'] = <choiceId>` — story markers readable by future encounters (`flagsReq`), quests, and achievements. Matches existing flag conventions (`boss_svarga`, `titleSeen`, `itemsCrafted`). `flagsReq` may also require a specific value: `{ 'enc_nagaMercy': 'take' }`.
2. `G.state.encounters = { seen: {} }` — completion ledger keyed by encounter id (bounded; no arrays, no unbounded growth). Prevents re-triggering completed encounters and exactly parallels `G.state.journeys.progress`.

**Save integration:** `createDefaultGameState()` in `src/engine/game.js` (line ~167) gains `encounters: {}`. `SaveSystem.migrate()` (save.js line ~41) normalizes it like `flags`: ensure object, drop arrays/nulls. Existing saves hydrate cleanly — no version bump needed.

**Script order:** `index.html` — `src/data/encounters.js` after `journeys.js` (line 79); `src/systems/encounter.js` after `journey.js` (line 92); `src/scenes/encounterScene.js` beside `journeyScene.js` (line 124) before `main.js`.

**Verification pattern:** This repo has no unit-test runner. Phase 02 verified with `grep -c` gates plus source-assertion `node -e` checks (e.g., `JourneySystem.start.toString().includes('JourneyAccess')`) and a browser UAT (browser-use CDP, documented in `*-UAT.md`). Phase 03 follows the same pattern: grep gates for file/API presence, `node -e` source assertions for routing/guards, and a final checkpoint:human-verify browser UAT.

**Architectural Responsibility Map:**
| Component | File | Responsibility |
|-----------|------|----------------|
| Encounter data registry + prereq + pool helpers | `src/data/encounters.js` | Static, pure, no mutations |
| EncounterSystem (choose/apply/ledger) | `src/systems/encounter.js` | All state mutations, canonical API routing |
| EncounterTrigger (zone/travel pickers) | `src/systems/encounter.js` | Pure selection, no mutations |
| Encounter scene UI | `src/scenes/encounterScene.js` | Presentation only; calls system on choice |
| Default state + save normalization | `src/engine/game.js`, `src/systems/save.js` | Hydration safety |
| Trigger hooks | `src/scenes/zoneExploration.js`, `src/scenes/travelMap.js` | Call trigger, route to scene |

**Don't hand-roll:**
| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gold/karma/fragments | `G.state.gold = ...` | `Economy.addGold` etc. | Canonical + REQ-005 gate |
| Party XP | Custom loop | `Progression.addPartyXP` | Level-up chain, difficulty hooks |
| Item grant | `G.state.inventory.push` | `Economy.addItem(item)` | Stacking + quest tracking |
| Prana/cultivation | `G.state.prana = ...` | `CultivationSystem.addPrana` | Canonical rate logic |
| Text wrapping | Custom wrap | `journeyTextLines` (journeyScene.js) | Proven wrapping + ellipsis |
| Scroll/culling | Custom scroll | `Scene.scrollInput`, `Scene.drawScrollbar`, `Scene.cullButtons` | Repo scroll conventions |

**Common pitfalls:**
1. **Direct reward mutation** — `choose()` writing `G.state.gold += x` bypasses canonical APIs and fails REQ-005's evidence gate. Route every reward through the listed APIs.
2. **Unbounded ledger** — storing an array of past encounter instances grows forever (ROADMAP: "no unbounded array growth"). Use keyed objects (`seen: { id: choiceId }`).
3. **Re-triggering completed encounters** — without a `seen` check, the zone roll can re-offer resolved encounters. `EncounterTrigger` must exclude seen ids.
4. **Empty-pool crash** — if `shouldRollZone`/`shouldRollTravel` return null, the caller must fall through to the normal enemy/travel path, never `gScene('encounterScene')` with no encounter.
5. **Mutation in trigger helpers** — `encounterAvailable`/pickers must be pure; all mutation lives in `EncounterSystem.choose` and `EncounterSystem.setFlag`.
6. **Scene state loss on resolve** — the encounter scene must restore the origin correctly (`zoneExploration` continues its timer; `travelMap` resumes travel into the pending zone). Store `origin` + `pendingZone` in scene data, not `G.state`.
7. **Lore tone** — devas/asuras/rishis/yakshas/nagas must be depicted respectfully (REQ-003); encounters may test, tempt, or bless the player but never demean the figures.
