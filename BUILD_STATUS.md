# Mythika: Echoes of the Divine — Build Status

**58 files, ~9,300 lines of JavaScript** across 6 directories.

## Directory Structure

```
Mythika/
├── index.html            (HTML shell, loads 58 scripts)
├── netlify.toml          (deploys the repo root as-is)
├── styles/
│   └── game.css          (dark theme, content-box canvas, JS-driven responsive fit)
├── src/
│   ├── main.js           (scene registration — 23 scenes)
│   ├── engine/           (6 files — game loop, scene, scene-helpers, input, audio, renderer)
│   ├── ui/               (8 files — button, panel, progress bar, text, list, tabbar, modal, card)
│   ├── data/             (12 files — heroes, enemies, zones, items, classes, perks,
│   │                      auras, cultivation, alchemy, spirit beasts, quests, achievements)
│   ├── systems/          (8 files — economy, progression, combat, cultivation, alchemy,
   │                      save, quest, achievements)
│   └── scenes/           (23 files — all scenes incl. equipment, questLog, trials)
```

## ✅ Completed Features

### Core Engine
- Game loop with delta-time, scene management, notification toasts (capped, bottom-anchored)
- Input: mouse, touch, keyboard — tap-on-release with dead-zone, touch drag-scrolling,
  swipe detection, stale-input cleared on every scene change
- 8-bit audio: beep-based SFX + Web Audio API background music, SFX/music toggles
- Pixel-art renderer: colors, fonts (xs/sm/md/lg/xl), shapes with radius guards, pixel
  text/characters, enemy/hero sprites, projectile arcs, level-up flash, zone backgrounds
- Responsive fit: `fitGame()` letterboxes the 400x720 canvas to any viewport, preserving aspect ratio
- Offline progress calculation on load (capped 8h) with save migration
  (legacy string gear slots and junk inventory entries healed automatically)

### Data Layer
- **5 Heroes**: Arjuna, Bhima, Karna, Draupadi (Rishi support/mage), Hanuman (Yogi agile fighter)
- **27 Enemies** across 5 zones with **18 unique enemy abilities** (used ~40% of the time)
- **5 Zones**: Aryavarta → Dandaka → Meru → Patala → Svarga
- **Items**: weapons/armors/accessories with **4 rarity tiers** (35 loot templates,
  zone-gated, stats scale with rarity x level x adaptive challenge), consumables with stacking
- **3 Classes**: Kshatriya, Rishi, Yogi → 6 elite classes
- **11 Perks (Siddhi)**, **24 Auras**, **5 Realms (Vedic)**
- **9 Alchemy Recipes**, **3 Herbs** with growth timers
- **10 Spirit Beasts** with **20 evolution forms** (2-stage: Lv.10 and Lv.25 via evolutionStage)
- **21 Achievements** (incl. Endless Trials tiers), **25 quests + 10 multi-step quest chains** with final rewards

### Systems
- **Economy**: gold, karma, divine fragments, inventory with quantity stacking
- **Progression**: XP/leveling, stat growth, skill points per level,
  **dynamic adaptive difficulty** — a `challenge` factor (0.6–1.5) rubber-bands on combat
  performance (win/loss, HP remaining, speed); scales enemy HP/damage and reward/loot
  quality; shown as Threat level on the Travel Map. Replaces the old manual difficulty picker.
- **Combat**: turn-based (agi ordering, dead actors skipped), effective stats include
  equipped gear objects, combo counter with real damage multiplier, enemy abilities,
  visible target selection, pinned combat log, beast skills with visible cooldowns,
  auto-battle, enlightenment choice with Decline option
- **Cultivation**: idle base + prana per second, breakthroughs, realm advancement
- **Alchemy / Farm / Fishing**: full crafting, grow-harvest, and minigame loops
- **Quest System**: zone quests + chains with per-step progress and claimable rewards
- **Save/Load**: localStorage, auto-save every 30s, versioning, offline progress,
  one-time migration for pre-object-gear saves, file export/import backup
  (imports re-run migration and reject files missing party data)

### Endgame
- **Endless Trials**: unlocked by defeating Svarga's boss; endless waves cycling all
  five zones with per-wave scaling, gold/karma/XP rewards, respite heals,
  persistent best-wave tracking, and two dedicated achievements
- **Combat polish**: death-burst animations (expanding ring + sparks) for fallen
  enemies and heroes

### Scene Conventions (see src/engine/scene-helpers.js)
- `Scene.drawStatic(ctx, draws)` — build-time text/panels recorded in `data.staticDraws`,
  rendered inside the scroll clip every frame
- `Scene.scrollInput(scene)` / `Scene.drawScrollbar(...)` — shared scroll handling
- `Scene.gearLabel(slot)` — safe label for object/legacy-string/empty gear slots
- Modal guard at the top of `update()` in every scene that can open modals

### UI Components
- Buttons with hover/disabled states, gold/small/wide variants
- Panels/dialogs, progress bars, text wrappers, scroll lists, tab bars, modals

### Scene Features
- **Title**: particles, pixel logo, New Game/Continue
- **Character Create**: 3-step wizard (Path → Hero → Elite) with confirmation modal
- **Ashram Hub**: full menu grid, passive cultivation, zone indicator, nav badges
- **Travel Map**: zone gating (level + previous zone), threat display, explore/boss actions
- **Zone Exploration**: encounter timer, stories, progress; boss fight gated once per zone
- **Combat**: full UI with visible targeting, adaptive difficulty feedback, once-per-combat
  Rebirth Flame, enlightenment buffs
- **Party / Equipment**: two equip surfaces sharing the object-based gear model
- **Cultivation / Alchemy / Punarjanma / Spirit Beasts / Quest Log / Achievements /
  Forge / Tournament / Bazaar / Farm / Fishing / Settings / Debug**: all functional
  with readable static panels (headers, details, logs render every frame)

### Polish & Balance
- Zone gating requires level AND 100% previous-zone exploration
- Enemy stats scale per zone tier AND adaptive challenge
- Combat HP clamped everywhere; HP bars clamp to track width
- Boss rewards granted once per zone (no infinite karma farm)
- Beast XP capped at Lv.30 with level-up notifications
- Toasts and achievement banners placed to never cover action buttons
- Mobile: touch scrolling everywhere, tap-on-release, no phantom taps across scenes
