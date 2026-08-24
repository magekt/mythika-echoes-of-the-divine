# AGENTS.md

## Repository Map

A full codemap is available at `codemap.md` in the project root.

Before working on any task, read `codemap.md` to understand:
- Project architecture and entry points
- Directory responsibilities and design patterns
- Data flow and integration points between modules

For deep work on a specific folder, also read that folder's `codemap.md`.

---

## Project Overview

**Mythika: Echoes of the Divine** — Mobile-first idle/cultivation RPG with turn-based combat.

**Stack**: Vanilla JS (ES6+), HTML5 Canvas 2D, Web Audio API, localStorage, PWA (Service Worker)

**Entry Points**:
- `index.html` — 63 script tags in dependency order
- `src/main.js` — Boot sequence, scene registration
- `src/engine/game.js` — Global state (`G`), game loop, scene manager

**Key Globals**: `G`, `R`, `UI`, `Scene`, `Input`, `Audio`, `Notify`, `Fade`, `Combat`, `Progression`, `CultivationSystem`, `SaveSystem`, `JourneySystem`, `AlchemySystem`, `Economy`, `AchievementSystem`, `QuestSystem`, `DuelSystem`

---

## Directory Structure

```
Mythika/
├── index.html              # Entry point, script loading order
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── styles/game.css         # Container scaling CSS
├── src/
│   ├── main.js             # Boot, scene registration
│   ├── engine/             # Core engine (game loop, renderer, input, audio, scene mgmt)
│   ├── data/               # 14 static data files (heroes, enemies, zones, realms, etc.)
│   ├── systems/            # 10 game logic systems (combat, progression, cultivation, save, etc.)
│   ├── scenes/             # 30 scene implementations
│   └── ui/                 # 7 reusable UI component modules
└── .slim/
    ├── codemap.json        # File hashes for change detection
    └── deepwork/           # Architecture audit & implementation plan
```

---

## Development Workflow

### Running the Game
Open `index.html` in a browser (or serve via `npx serve Mythika`). No build step required.

### Making Changes
1. Read relevant `codemap.md` for the directory you're modifying
2. Follow the verification plan in `.slim/deepwork/architecture-audit.md`
3. Update codemaps after modifications
4. Test in browser — check console for errors

### Performance Testing
Add `?probe` to URL for FPS logging. Add `?probe&selftest` for input chain self-test.

### Reduce Motion Testing
Enable "Reduce Motion" in OS settings, or set `G.state.reduceMotion = true` in console.

---

## Key Systems Reference

| System | File | Purpose |
|--------|------|---------|
| Game Loop | `src/engine/game.js` | rAF loop, error recovery, adaptive reduce motion |
| Renderer | `src/engine/renderer.js` | All drawing primitives, effects, projectiles |
| Scene Manager | `src/engine/scene.js` + `scene-helpers.js` | Scene factory, transitions, scroll/clipping |
| Input | `src/engine/input.js` | Touch/mouse/keyboard, tap queue, swipe, scroll |
| Audio | `src/engine/audio.js` | Procedural synthesis, music tracks, SFX |
| Combat | `src/systems/combat.js` | Turn-based, damage calc, AI, ailments, combos |
| Progression | `src/systems/progression.js` | XP, levels, challenge scaling, difficulty |
| Cultivation | `src/systems/cultivation_sys.js` | Realms, breakthrough, idle tick |
| Save | `src/systems/save.js` | localStorage, migration, offline progress |
| Journey | `src/systems/journey.js` | Narrative choices, aura unlocks |

---

## Coding Conventions

- **Immediate-mode Canvas**: Every frame rebuilds from scratch — no retained scene graph
- **Global State**: `G.state` mutated directly — no Redux/Flux
- **Factory Functions**: `UI.ComponentName(x, y, ...)` returns `{ render, update, onClick, contains }`
- **Spring Physics**: `stiffness=120, damping=22` for MagneticBtn
- **Reduced Motion**: Check `R.reducedMotion()` before any animation
- **Color Tokens**: Use `R.colors.*` semantic tokens, never raw hex in components
- **Radius Scale**: `R.radius.xs=3, s=5, m=8, l=10` — Shape Consistency Lock

---

## Testing Checklist

- [ ] Scene transitions work (Fade in/out)
- [ ] Buttons respond to tap/click (MagneticBtn spring)
- [ ] Scroll works (touch drag, wheel)
- [ ] Save/load persists state correctly
- [ ] Offline progress calculates on load
- [ ] Reduce motion disables animations
- [ ] No console errors during 5min play
- [ ] Memory stable over 30min (no leaks)