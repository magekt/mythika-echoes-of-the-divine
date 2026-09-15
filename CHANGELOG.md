# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Encounter system with mythological narrative encounters by `d722f6b`
  - `ENCOUNTERS` data registry with prerequisite and pool helpers by `5cbba94`
  - `EncounterSystem` + `EncounterTrigger` core logic by `05ff895`
  - Encounters in default game state + save migration by `c2edf0c`
  - Encounter UI with triggers and 8 lore encounters with marker chains by `603bdc4`
  - EncounterScene choice UI with prompt, cards, result panel by `e144863`
- Cross-system hooks connecting encounters with quests and achievements by `90e029b`
  - `QuestSystem.trackEncounter` method and chain helper by `8fc1d56`
  - Encounter journey grants routed through `JourneySystem.start` by `59fed48`
  - `narrative_enthusiast` achievement by `fc05ca0`
- Authority gate system for feature access control by `0599000`
  - `JourneyAccess` authority gate by `71757ef`
  - `RebirthAccess` authority gate by `352d1bd`
  - `ForgeAccess` authority gate by `0feb2ea`
  - `RecruitAccess` authority gate by `8b6c182`
  - `TournamentAccess` and `TrialsAccess` authority gates by `20bad46`
- Combat UI reflow with vertical stacking of hero strip and enemy panel by `a985acd`
- Personalized user journeys with branching choices by `b40176c`
- Active cultivation, fishing bait tiers, achievement progress by `3d073cc`
- Premium UI/UX redesign with design-taste-frontend + high-end-visual-design by `2f474ba`
- Cinematic 1.6s title entrance on first-ever visit only by `3c96e34`
- Click-outcome FX system (valid tick / stone-hits-glass) by `678ad58`
  - Valid vs invalid click classification with FX + audio by `20d43f5`
  - Click-FX coverage for TabBar and ScrollList by `b92f3a9`
- Cultivation breakthrough failures report blocked feedback by `bf50ede`
- Farm→Alchemy pipeline + offline growth by `6fd7b2a`
- Farm→Alchemy + Forge + Ashram economy by `174e36b`
- Tapobhumi content + Realm 51-60 by `acda946`
- Light aura wiring + quest/achievement fixes by `9267339`

### Changed
- Achievement banners now exit in 200ms by `65179be`
- Scene `enter()` failures are now non-fatal (safeEnter) by `8468346`

### Fixed
- Forge rendered zero (dead screen fix) by `db043e0`
- Add `UI.Modal.clearAll` (missed from scene-transition commit) by `dc6f3d4`

### Documentation
- Milestone complete — all 5 phases executed by `d339303`
- Phase 05 complete with 05-02 and 05-03 summaries by `5af3243`
- Phase 04 complete with summary by `2dedcf1`
- Phase 03 complete by `da58a39`
- Phase 02 complete — access-gate enforcement by `138710b`
- Phase 01 complete — project foundation by `6a8e6ce`
- Cross-system hooks plan by `90e029b`
- Mythological narrative encounters phase plan by `1819915`
- Combat UI reflow phase plan by `691a747`
- Access-gate enforcement phase plan by `a5b3e18`
- Project foundation phase plan by `e8c7a52`
- Click-FX coverage completion and banner exit polish by `d02d3a8`
- Forge dead-screen fix and input diagnostics by `1ed59f0`
- Motion audit report archived by `dacd7fe`

### Testing
- UAT complete - 8/8 passed via browser-use verification by `aa6cfd6`
- Selftest phase 2 asserts blocked FX on active-tab re-tap by `fddd38e`
- Input-chain self-test (`?probe&selftest`) and CDP click diagnostic by `34167a8`
- Selftest asserts click FX spawn; outcome convention documented by `73dafe4`

### CI/CD
- Verify-and-deploy pipeline for GitHub Pages by `1305303`
- Harness honors `MYTHIKA_CHROME` and adds runner flags under CI by `6d382f4`

### Chore
- Retire Netlify config - GitHub Pages is the only host by `06517b9`

---

## Release History

### Phase 5: Connected Systems Polish (2026-09-15)
- Cross-system hooks connecting encounters with quests and achievements
- `QuestSystem.trackEncounter` for encounter tracking
- Journey grants routed through `JourneySystem.start`
- `narrative_enthusiast` achievement

### Phase 4: Combat UI Reflow (2026-09-15)
- Vertical stacking of hero strip and enemy panel
- Improved combat layout readability

### Phase 3: Mythological Narrative Encounters (2026-09-15)
- EncounterSystem with 8 lore encounters
- EncounterScene with choice UI (prompt, cards, result panel)
- Prerequisite and pool helpers for encounter selection
- Save migration for encounter state

### Phase 2: Access-Gate Enforcement (2026-09-14)
- Authority gate system (`JourneyAccess`, `RebirthAccess`, `ForgeAccess`, `RecruitAccess`, `TournamentAccess`, `TrialsAccess`)
- UAT verification - 8/8 tests passed

### Phase 1: Project Foundation (2026-09-13)
- Initial project structure
- Core systems setup

### Premium Redesign (2026-08-23)
- High-end visual design overhaul
- Click-outcome FX system
- Achievement progress tracking
- Fishing bait tiers
- Active cultivation

### Content Expansion (2026-08-23)
- Tapobhumi content
- Realm 51-60 progression
- Farm→Alchemy + Forge + Ashram economy

### Initial Development (2026-08-03 to 2026-08-22)
- Core game engine
- Combat system
- Cultivation system
- Save system
- Audio system
- Input handling
- Scene management
