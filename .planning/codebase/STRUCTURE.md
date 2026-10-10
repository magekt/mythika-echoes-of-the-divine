# Codebase Structure

**Analysis Date:** 2026-10-08

## Directory Layout

```
dragonSword_EXPMinima/
├── .agents/                    # Agent skills (project-local)
├── .github/                    # GitHub workflows (if any)
├── .opencode/                  # OpenCode configuration
├── .planning/                  # Planning artifacts (this directory)
├── .slim/                      # Slim configuration
├── src/                        # Game source code
│   ├── engine/                 # Runtime infrastructure
│   ├── data/                   # Declarative gameplay data (20 files)
│   ├── systems/                # Authoritative game rules (18 files)
│   ├── ui/                     # Immediate-mode UI components (9 files)
│   ├── scenes/                 # Game screens (26 files)
│   └── main.js                 # Boot entry point
├── tests/                      # Node.js tests (30+ files)
├── tools/                      # Verification scripts
├── styles/                     # CSS
│   └── game.css                # Single stylesheet
├── index.html                  # Entry point (script orchestration)
├── sw.js                       # Service Worker (v11)
├── manifest.json               # PWA manifest
├── icon-192.png / icon-512.png # PWA icons
├── AGENTS.md                   # Agent instructions
├── codemap.md                  # Hierarchical code map
└── *.md                        # Design docs (ARCHITECTURE.md, STYLE_GUIDE.md, etc.)
```

## Directory Purposes

**src/engine/:**
- Purpose: Runtime infrastructure — game loop, rendering, input, audio, scene management, Firebase bridge
- Contains: `game.js` (G, loop, Fade, Notify), `renderer.js` (R), `input.js` (Input), `audio.js` (Audio), `scene.js` (Scene base), `scene-helpers.js` (registerScene, gScene), `auth.js` (Auth), `firebase-config.js` (gitignored), `firebase-config.template.js`
- Key files: `game.js`, `renderer.js`, `scene-helpers.js`

**src/data/:**
- Purpose: Pure declarative content — read-only at runtime, no logic
- Contains: 20 files defining heroes, enemies, zones, items, quests, classes, perks, auras, spirit beasts, cultivation, alchemy, journeys, landmarks, map layout, encounters, narrative echoes, world events, influence rules, achievements
- Key files: `heroes.js`, `enemies.js`, `zones.js`, `items.js`, `quests.js`, `classes.js`

**src/systems/:**
- Purpose: Authoritative rules — mutate G.state, no rendering, owned by domain
- Contains: 18 files — combat, progression, save, world_state, quest, encounter, journey, farm, alchemy, cultivation_sys, influence, landmarks, zone_rewards, economy, duel, achievements, hints, narrative_echoes, world_events
- Key files: `save.js`, `combat.js`, `progression.js`, `world_state.js`, `quest.js`

**src/ui/:**
- Purpose: Reusable immediate-mode components — factories returning {render, update, click, contains}
- Contains: 9 files — button, panel, progressBar, text, list, tabbar, modal, card, heroSurface
- Key files: `button.js`, `panel.js`, `modal.js`, `list.js`

**src/scenes/:**
- Purpose: Full-screen game screens — each implements enter/update/render/leave
- Contains: 26 files — title, characterCreate, ashram, travelMap, zoneExploration, combatScene, party, cultivationScene, alchemyScene, punarjanma, spiritBeast, questLog, forge, tournament, trials, bazaar, farm, fishing, settings, achievementsScene, equipment, welcome, debug, journeyScene, encounterScene, authScene
- Key files: `title.js`, `ashram.js`, `travelMap.js`, `combatScene.js`, `party.js`

**tests/:**
- Purpose: Node.js unit/integration tests
- Contains: 30+ `*.test.js` files mirroring systems/scenes (e.g., `world_state.test.js`, `travel_map.test.js`, `combat.test.js`)

**tools/:**
- Purpose: Verification and maintenance scripts
- Contains: `check_ui_invariants.sh`, `verify_matrix.py`, `selftest.html`

**styles/:**
- Purpose: Single stylesheet for layout, boot splash, responsive rules
- Contains: `game.css`

## Key File Locations

**Entry Points:**
- `index.html` — Synchronous script orchestration, Firebase bootstrap, canvas mount
- `src/main.js` — Boot IIFE: validates globals, registers scenes, starts game loop

**Configuration:**
- `src/engine/firebase-config.js` — Firebase config (gitignored, created from template)
- `src/engine/firebase-config.template.js` — Template for firebase-config.js
- `manifest.json` — PWA manifest (name, icons, orientation, theme color)
- `sw.js` — Service Worker (cache-first assets, network-first index.html)

**Core Logic:**
- `src/engine/game.js` — G, game loop, Fade, Notify, gScene, safeEnter, fitGame
- `src/engine/renderer.js` — R (roundRect, textCenter, effects, projectiles, clickFx)
- `src/engine/scene-helpers.js` — registerScene, gScene, scene utilities
- `src/systems/save.js` — SaveSystem (localStorage + Firestore, migrate, import/export)
- `src/systems/combat.js` — Combat (turn logic, damage, status, rewards)
- `src/systems/progression.js` — Progression (XP, realm, rebirth)
- `src/systems/world_state.js` — WorldState (map, landmarks, influence, echoes)

**Testing:**
- `tests/*.test.js` — Node test files (run with `node --test tests/*.test.js`)
- `tools/check_ui_invariants.sh` — Syntax + UI/script-loading invariants
- `tools/verify_matrix.py` — Browser boot matrix (requires Chrome/Edge)

## Naming Conventions

**Files:**
- PascalCase for scene files: `combatScene.js`, `travelMap.js`, `characterCreate.js`
- camelCase for systems/data/ui: `save.js`, `world_state.js`, `button.js`, `heroes.js`
- snake_case for some data: `alchemy_recipes.js`, `spirit_beasts.js`, `map_layout.js`, `influence_rules.js`, `narrative_echoes.js`, `world_events.js`, `zone_rewards.js`, `cultivation_sys.js`

**Directories:**
- Lowercase plural: `engine/`, `data/`, `systems/`, `ui/`, `scenes/`, `tests/`, `tools/`, `styles/`

**Globals:**
- Single uppercase letter: `G`, `R`, `UI`, `Scene`, `Input`, `Audio`, `Notify`, `Fade`, `Combat`, `Progression`, `SaveSystem`, `Auth`, `WorldState`, `FarmSystem`, `WorldEvents`, `ZoneRewardSystem`, `EquipmentSystem`, `Hints`
- Scene objects: `<name>Scene` (e.g., `titleScene`, `combatScene`, `ashramScene`)

## Where to Add New Code

**New Feature (gameplay system):**
- Primary code: `src/systems/<feature>.js` — export singleton object with `tick(dt)` if loop-driven
- Data: `src/data/<feature>.js` if declarative content needed
- Scene: `src/scenes/<feature>Scene.js` if new screen required
- Registration: Add `<script src="src/systems/<feature>.js">` in `index.html` (Systems section, before UI)
- Scene registration: Add to `SCENE_TABLE` in `src/main.js:37-63`

**New UI Component:**
- Implementation: `src/ui/<component>.js` — factory returning `{ render, update, click, contains }`
- Style: Use `R.colors`, `R.fonts`, `R.radius`, `R.reducedMotion()`
- Registration: Add `<script src="src/ui/<component>.js">` in `index.html` (UI section, before Scenes)

**New Data Definition:**
- File: `src/data/<name>.js` — plain object/array export to global (e.g., `const newData = {...}`)
- Registration: Add `<script src="src/data/<name>.js">` in `index.html` (Data section, before Systems)

**New Scene:**
- File: `src/scenes/<name>Scene.js` — object with `enter`, `update(dt)`, `render(ctx)`, `leave()`
- Registration: Add to `SCENE_TABLE` in `src/main.js:37-63` (use `typeof <name>Scene !== 'undefined'`)
- Script tag: Add `<script src="src/scenes/<name>Scene.js">` in `index.html` (Scenes section, before boot)

**Utilities / Helpers:**
- Shared: `src/engine/scene-helpers.js` (scene utilities) or new `src/engine/<helper>.js`
- Render: Extend `R` in `src/engine/renderer.js`

## Special Directories

**.planning/codebase/:**
- Purpose: Codebase mapping documents (this file + STACK.md, INTEGRATIONS.md, ARCHITECTURE.md, CONCERNS.md, CONVENTIONS.md, TESTING.md, STRUCTURE.md)
- Generated: Yes (by gsd-map-codebase)
- Committed: Yes

**motion-audits/:**
- Purpose: Motion audit HTML reports (from design-motion-principles skill)
- Generated: Yes (on demand)
- Committed: Yes

**tests/:**
- Purpose: Test files
- Generated: No (hand-written)
- Committed: Yes

**tools/:**
- Purpose: Verification scripts
- Generated: No (hand-written)
- Committed: Yes

---

*Structure analysis: 2026-10-08*