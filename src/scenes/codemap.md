# src/scenes/

## Responsibility
30 scene implementations — each a self-contained screen with its own state, UI, and logic. Scenes follow a common pattern: `enter()` builds UI, `update(dt)` handles input/tick, `render(ctx)` draws, `leave()` cleans up.

## Design Patterns
- **Scene Factory**: `Scene.create(def)` returns object with `name`, `enter`, `leave`, `update`, `render`, `data`
- **Scrollable Content**: Standard `data.scrollY`, `data.contentHeight`, `clampScroll()`, `getContentTop()`, `getContentHeight()`
- **Button Arrays**: `data.buttons[]` built in `enter()`/`buildMenu()`, updated via `UI.updateButtons()`, handled via `UI.handleButtons()`
- **Modal Guard**: `if (UI.Modal.active) { UI.Modal.handleInput(); return; }` at top of `update()`
- **Viewport Culling**: `Scene.cullButtons()` for long lists (inventory, party)
- **Clip + Translate**: `Scene.clipContent(ctx, scene)` saves, clips to content band, translates by `-scrollY`
- **Premium UI Components**: `Scene.HeroMoment`, `Scene.ScrollReveal`, `Scene.FluidNav`, `Scene.EmptyState` from scene-helpers
- **UI Components**: `UI.PremiumShell`, `UI.MagneticBtn`, `UI.ProgressBar`, `UI.Button` from button.js

## Scene Catalog

### Core Progression Scenes
| Scene | Purpose | Key Systems |
|-------|---------|-------------|
| `title.js` | Entry point, animated logo, continue/new/settings | Audio (title music), SaveSystem |
| `welcome.js` | First-run onboarding, class selection | Progression (class), SaveSystem |
| `characterCreate.js` | Name + stat allocation (10 points) | Progression, HEROES data |
| `ashram.js` | Home base — navigation hub, stats, upgrades | CultivationSystem, Economy, JourneySystem, FluidNav |
| `travelMap.js` | Zone selection, progress overview | ZONES data, zoneProgress |
| `zoneExploration.js` | Zone gameplay — explore, rest, fish, encounters | Combat (encounters), Economy, Fishing |
| `cultivationScene.js` | Realm progression, meditation, breakthrough | CultivationSystem, PremiumShell, HeroMoment |

### Combat & Party
| Scene | Purpose | Key Systems |
|-------|---------|-------------|
| `combatScene.js` | Turn-based combat with timing taps | Combat, Progression, AURAS, SpiritBeasts |
| `party.js` | Hero management — equip, skills, stats | Progression, ITEMS, AURAS, CLASSES |
| `equipment.js` | Gear inspection, comparison, salvage | ITEMS, Economy, Forge |
| `trials.js` | Endless wave survival | Combat, Progression, Economy |
| `tournament.js` | Procedural AI opponents | Combat, Economy, Progression |
| `duel.js` | (System) PvP-style combat logic | Combat |

### Crafting & Economy
| Scene | Purpose | Key Systems |
|-------|---------|-------------|
| `alchemyScene.js` | Pill crafting from herbs | AlchemySystem, HERB_GROWTH |
| `forge.js` | Equipment upgrade (+1 to +15), gem socketing | Economy, ITEMS, Progression |
| `bazaar.js` | NPC shop with randomized inventory | Economy, ITEMS, ZONES |
| `farm.js` | Herb growing (in-game time) | AlchemySystem, HERB_GROWTH |
| `fishing.js` | Mini-game for rare materials | Economy, RNG |

### Meta & Progression
| Scene | Purpose | Key Systems |
|-------|---------|-------------|
| `journeyScene.js` | Narrative choices, aura unlocks | JourneySystem, AURAS |
| `questLog.js` | Quest tracking, rewards | QuestSystem, Economy |
| `achievementsScene.js` | Achievement gallery | AchievementSystem |
| `spiritBeast.js` | Beast management, equip | SPIRIT_BEASTS, Progression |
| `punarjanma.js` | Rebirth — reset to Mortal, gain perks | Progression (perks), SaveSystem |
| `settings.js` | Audio, graphics, accessibility, data mgmt | Audio, SaveSystem, R.applyFontScale |

### Utility
| Scene | Purpose |
|-------|---------|
| `debug.js` | Dev tools — state inspector, console, perf probe |

## Data & Control Flow

### Standard Scene Lifecycle
```
gScene('sceneName') → Fade (optional) → safeEnter()
    → scene.enter() → build UI (buttons, HeroMoment, shells)
    → game loop: scene.update(dt) → scene.render(ctx)
    → gScene('nextScene') → scene.leave() → cleanup
```

### Scrollable Scene Pattern (ashram, cultivation, zoneExploration, etc.)
```
enter(): data.scrollY = 0; buildButtons(); buildMenu()
update(dt): Scene.scrollInput(); UI.updateButtons(); UI.handleButtons()
render(ctx): R.renderNoise(); HeroMoment.render(); PremiumShell.render();
    Scene.clipContent(); buttons.render(); ctx.restore(); drawScrollbar()
```

### Combat Scene Pattern
```
enter(): Combat.startBattle(heroes, enemies); buildActionBar()
update(dt): Combat.tick(dt); handleActionBarInput(); checkBattleEnd()
render(ctx): drawEnemy(); drawHeroParty(); drawActionBar(); drawCombatLog()
```

## Integration Points

| Scene | Systems Used | Data Used | UI Components |
|-------|--------------|-----------|---------------|
| `ashram` | Cultivation, Economy, Journey, Quest | REALMS, ZONES, PERKS | HeroMoment, PremiumShell, MagneticBtn, FluidNav, ProgressBar |
| `cultivationScene` | Cultivation | REALMS, CULTIVATION_RATES | HeroMoment, PremiumShell, MagneticBtn, ProgressBar |
| `combatScene` | Combat, Progression, AURAS | HEROES, ENEMIES, PERKS | MagneticBtn, ProgressBar (HP/MP) |
| `travelMap` | — | ZONES, zoneProgress | HeroMoment, PremiumShell, MagneticBtn |
| `party` | Progression | HEROES, ITEMS, AURAS, CLASSES | PremiumShell, MagneticBtn, TabBar |
| `forge` | Economy, Progression | ITEMS, PERKS | PremiumShell, MagneticBtn, ProgressBar |
| `alchemyScene` | Alchemy | ALCHEMY_RECIPES, HERB_GROWTH | PremiumShell, MagneticBtn, List |
| `journeyScene` | Journey, AURAS | JOURNEYS, AURAS | PremiumShell, MagneticBtn, HeroMoment |

## Critical Invariants
1. **Every scene must implement `enter()`** — builds `data.buttons`, initializes `data.scrollY`
2. **Every scene with buttons must call `UI.updateButtons(dt)` and `UI.handleButtons()` in `update()`**
3. **Scrollable scenes must implement `clampScroll()`, `getContentTop()`, `getContentHeight()`**
4. **Modal guard at top of `update()`** — `if (UI.Modal.active) { UI.Modal.handleInput(); return; }`
5. **`leave()` must clean up** — stop auto-save, null `_heroMoment`, `_fluidNav`, `_shell` refs
6. **HeroMoment created lazily in `render()`** — cached on `this._heroMoment`
7. **FluidNav created lazily in `render()`** — cached on `this._fluidNav`

## Memory Leak Risks (Scene-Specific)
| Scene | Risk | Location |
|-------|------|----------|
| `ashram` | `_heroMoment`, `_fluidNav` never nulled | render():378, 443 |
| `cultivationScene` | `_heroMoment` never nulled | render():139 |
| `combatScene` | Combat references not cleared | leave() missing |
| `zoneExploration` | Encounter timers not cleared | leave() missing |
| `alchemyScene` | Crafting timers not cleared | leave() missing |
| `farm` | Grow timers not cleared | leave() missing |
| `fishing` | Bobber animation state not cleared | leave() missing |

## Refactoring Opportunities
1. **Base `Scene` class** — enforce `enter`/`leave`/`update`/`render` with lifecycle hooks
2. **Standardized `leave()`** — auto-null common fields (`_heroMoment`, `_fluidNav`, `_shell`, timers)
3. **Scene registry with lazy loading** — load scene modules on demand
4. **Extract `ScrollableScene` mixin** — shared scroll/clamp/cull logic
5. **Extract `CombatScene` base** — shared combat UI (action bar, HP bars, log)
6. **Button factory** — reduce boilerplate in `buildMenu()`/`buildButtons()`