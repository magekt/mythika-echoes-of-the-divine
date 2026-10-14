# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [10.0.0] - 2026-10-14
### Added
- UI Component Factory Foundation (Phase 50): `UI.Component` base factory + 5 mixins (`render`, `update`, `spring`, `ease`, `contains`); refactored `UI.Button`, `UI.Panel`, `UI.Modal` to compose from base + mixins
- Spring Config Registry (Phase 51): `R.springConfigs` registry with 12 named spring configurations; `R.springConfig(name)` accessor; replaced 8+ inline spring configs
- Renderer Primitive Hardening (Phase 52): `R.strokeRoundRect` validation, `R.doubleBezel` `insetHighlight` support, `R.easePremiumInv`, `R.spring.step` alias, `R.reducedMotion.watch`, 4 new semantic tokens (`focus`, `success`, `warning`, `danger`)
- Component Factory Migration + Test Suite (Phase 53): migrated 9 UI components (`Button`, `Panel`, `Modal`, `List`, `Feedback`, `HeroSurface`, `TabBar`, `Input`, `Dialog`, `EmptyState`) to `UI.Component` + mixins; added 3 test files (`component_factory.test.js`, `spring_registry.test.js`, `renderer_extended.test.js`)
- Shared library foundations enabling consistent component architecture, spring physics, and renderer primitives

### Fixed
- Critical: Missing `component.js` in script loading order (caused UI component factory to be undefined)
- Critical: Dead UI components (`currency-badge.js`, `map-card.js`, `wordmark.js`) - never loaded or used
- Critical: Duplicate color tokens in `R.colors` (hex values silently overwritten by rgba values)
- Critical: Spring step function allocating new object every frame (zero-per-frame allocation violation)
- Critical: `R.doubleBezel` calls creating object literals every render frame
- Critical: Redundant `R.reducedMotion()` checks in hot paths
- Critical: Unused `_hoverSpringStep` allocation in `UI.MagneticBtn`

### Changed
- Updated loading progress tracker in `index.html`: added `component.js`, increased TOTAL from 104 to 105, updated group counts
- Updated service worker (`sw.js`): added `src/ui/component.js` to precache list
- Updated test fixtures (`tools/layout_harness/expected_pairs.json`): adjusted script counts
- `src/engine/renderer.js`: removed duplicate hex color definitions, kept Phase 52 rgba semantic tokens

### Testing
- All tests pass: 579 pass / 0 fail / 1 skipped
- UI invariants check: all checks passed
- Browser matrix verification: 3/3 profiles clean (desktop, phone, phone-land)


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
- Combat/cultivation routes pointed at nonexistent scenes (every combat entry fell back to Ashram since Phase 18); `Navigation.go` recursed infinitely on remapped names and dropped the fade flag (synchronous entry broken)
- NOTE: combat entry was effectively unreachable between Phase 18 and this fix; BAL-01/BAL-02 baselines are unaffected (simulator drives the combat module directly, not the route)
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
