# Mythika: Echoes of the Divine — Repository Atlas

## Project Responsibility
A mobile-first, offline-capable idle/cultivation RPG with turn-based combat, built in vanilla JavaScript (ES6+) targeting HTML5 Canvas. 25-30 hours base playtime, 40+ hours completionist. Premium $7.99 + optional cosmetic DLC.

## System Entry Points
- `index.html` — Script loading order (63 scripts), PWA manifest, service worker
- `src/main.js` — Boot sequence, scene registration, `bootGame()` idempotent entry
- `src/engine/game.js` — Global state (`G`), game loop (`gLoop`), scene manager (`gScene`), `Notify`, `Fade`
- `package.json` — (Not present — no build step, direct script loading)

## Directory Map (Aggregated)

| Directory | Responsibility Summary | Detailed Map |
|-----------|------------------------|--------------|
| `src/engine/` | Core game engine — rendering primitives, game loop, scene management, input, audio, global state | [View Map](src/engine/codemap.md) |
| `src/data/` | Static game data — heroes, enemies, zones, realms, perks, auras, classes, items, journeys, quests, achievements, alchemy | [View Map](src/data/codemap.md) |
| `src/systems/` | Game logic systems — combat, progression, cultivation, save, journey, alchemy, economy, achievements, quests, duel | [View Map](src/systems/codemap.md) |
| `src/scenes/` | 30 scene implementations — each a self-contained screen with enter/update/render/leave lifecycle | [View Map](src/scenes/codemap.md) |
| `src/ui/` | Reusable UI components — buttons, panels, lists, modals, progress bars, tab bars, text, cards | [View Map](src/ui/codemap.md) |

## Architecture Overview

### Global Namespace (Singletons)
```
G          → Global game state, canvas, loop, scene registry
R          → Renderer: colors, fonts, radius, primitives, effects, projectiles
UI         → UI component factories (Button, MagneticBtn, PremiumShell, etc.)
Scene      → Scene factory + helpers (HeroMoment, FluidNav, ScrollReveal)
Input      → Touch/mouse/keyboard handling, tap queue, swipe, scroll
Audio      → Web Audio API wrapper (procedural synthesis)
Notify     → Toast/achievement queue with animations
Fade       → Scene transition fade (asymmetric 150ms/250ms)
Combat     → Turn-based combat engine
Progression → XP, leveling, challenge scaling, difficulty
CultivationSystem → Realm progression, breakthrough, idle tick
SaveSystem → localStorage persistence, migration, offline progress
JourneySystem → Narrative journeys, aura unlocks
AlchemySystem → Pill crafting
Economy    → Currency transactions
AchievementSystem → Achievement tracking
QuestSystem → Quest state machine
DuelSystem → Tournament PvP combat
```

### Data Flow (Simplified)
```
index.html loads 63 scripts in dependency order
    ↓
main.js: bootGame() → gInit() → gLoop()
    ↓
gLoopFrame(dt):
  1. Update: Notify, R.effects, R.projectiles, R.clickFx, Enlightenment, Fade, Scene.update
  2. Render: clearRect → drawBackground → Scene.render → R.projectiles → R.effects → R.clickFx → R.levelUp → R.enlightenmentAura → Fade → Notify
  3. Perf: FPS probe, Adaptive Reduce Motion (auto-enable after 2× sub-30fps)
```

### Scene Lifecycle
```
gScene('name', fade?) → Fade.toScene() [async] OR immediate
    → currentScene.leave() → currentScene = scenes[name] → safeEnter()
    → scene.enter() builds UI (buttons, HeroMoment, shells)
    → scene.update(dt) handles input, tick, scroll
    → scene.render(ctx) draws: noise → HeroMoment → shells → clipped buttons → scrollbar → FluidNav → Modal
```

## Key Architectural Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **No bundler / ES modules** | Zero config, works on file://, instant reload | No tree-shaking, global namespace pollution |
| **Immediate-mode Canvas** | Simple, predictable, no VDOM overhead | Full redraw every frame, no dirty rects |
| **Global `G` state** | Zero boilerplate, easy debugging | Tight coupling, hard to test in isolation |
| **Procedural Audio** | Zero asset size, works offline | Limited expressiveness vs sampled audio |
| **localStorage saves** | Universal browser support, no backend | 5MB limit, no cloud sync at launch |
| **Scene-per-file** | Clear ownership, easy to find | 30+ script tags, load order matters |
| **Double-bezel PremiumShell** | Premium feel, consistent depth | More draw calls per panel |

## Performance Baseline (Current)

| Metric | Value | Target |
|--------|-------|--------|
| Avg Frame Time | ~16ms (60fps) | <16ms sustained |
| P99 Frame Time | Unknown | <33ms (30fps) |
| Memory (30min) | Unknown | <50MB |
| GC Pressure | High (particle arrays, deep clone saves) | Low |
| Save Serialization | ~5ms (full deep clone) | <1ms (selective) |
| Scene Transition | ~400ms (Fade) | <200ms |
| Particle Count | Unbounded (shift at max) | <100 active |

## Critical Technical Debt

### Memory Leaks (P0)
1. **Particle arrays unbounded** — `R.damageNumbers`, `R.deathBursts`, `R.levelUpParticles`, `R.clickFx` push without guaranteed cleanup
2. **Scene object retention** — `_heroMoment`, `_fluidNav`, `_shell` created in `render()`, never nulled in `leave()`
3. **Audio context never released** — `Audio._ctx` persists for session
4. **Interval timers not cleaned** — `SaveSystem._timer`, `Audio._musicInterval`
5. **Event listeners never removed** — `resize`/`orientationchange` on `window`

### Performance (P1)
6. **Full canvas clear every frame** — No dirty rect optimization
7. **No viewport culling** — All particles/projectiles rendered regardless of visibility
8. **Gradient per frame** — `drawBackground()` creates new `createLinearGradient`
8. **Noise overlay every frame** — Full 400x720 `drawImage` at 3% alpha
9. **Deep clone on save** — `JSON.parse(JSON.stringify(G.state))` every 30s

### Architecture (P2)
10. **Global namespace pollution** — 25+ globals, circular dependencies
11. **No module system** — Script tag loading order fragile
12. **No centralized state** — Direct `G.state` mutations everywhere
13. **Scene cleanup inconsistent** — `leave()` often missing or incomplete
14. **No TypeScript** — No compile-time safety for 63 files

## Verification Plan (Evidence Paths)

| Claim | Evidence Path | Status |
|-------|---------------|--------|
| Particle arrays bounded | Check `R.CLICKFX_MAX` enforcement in all push paths | ⬜ |
| Scene cleanup runs | Verify `leave()` nulls `_heroMoment`, `_fluidNav` | ⬜ |
| Auto-save cleans up | Verify `SaveSystem.stopAutoSave()` on scene leave | ⬜ |
| Audio context suspendable | Test `Audio._ctx.suspend()` on page hide | ⬜ |
| Reduce motion triggers | Simulate load, verify `G.state.reduceMotion` set | ⬜ |
| Offline progress correct | Mock localStorage with old timestamp, verify gains | ⬜ |
| Save migration robust | Test with malformed localStorage entries | ⬜ |

## Phased Remediation Plan

### Phase 1: Critical Memory Leaks (Week 1)
- [ ] Bound all particle arrays with circular buffers
- [ ] Implement `Scene.leave()` cleanup for all 30 scenes
- [ ] Add `Audio.cleanup()` + `pagehide` listener
- [ ] Remove event listeners on cleanup
- [ ] Clear intervals on scene leave

### Phase 2: Rendering Performance (Week 2)
- [ ] Object pooling for particles (pre-allocate, reuse)
- [ ] Viewport culling for effects/projectiles
- [ ] Cache background gradients (create once)
- [ ] Optimize noise overlay (render every N frames or CSS filter)

### Phase 3: State Management (Week 3)
- [ ] Centralized state store with selectors
- [ ] Selective serialization (dirty tracking)
- [ ] State validation schema (Zod or custom)
- [ ] Migrate systems to use store

### Phase 4: Architecture Modernization (Week 4)
- [ ] Convert to ES modules (Vite or esbuild)
- [ ] Dependency injection container
- [ ] Lazy scene loading (dynamic import)
- [ ] Module boundary tests

### Phase 5: Verification & Monitoring (Week 5)
- [ ] Frame time histogram (p50/p95/p99)
- [ ] Memory tracking (`performance.memory`)
- [ ] Automated stress tests (100 scene transitions)
- [ ] Performance regression CI gate

## Cross-References
- **Wireframe Plan**: `MYTHIKA_WIREFRAME_PLAN.md` — Screen designs, system specs, economy
- **Cultivation Design**: `CULTIVATION_SCENE_DESIGN.md` — Premium UI spec for cultivation scene
- **Deepwork Progress**: `.slim/deepwork/architecture-audit.md` — This audit with implementation plan
- **Codemap State**: `.slim/codemap.json` — File hashes for change detection

## Quick Start for New Agents
1. Read this atlas (`codemap.md`)
2. Read relevant directory codemap for your work area
3. Check `.slim/deepwork/architecture-audit.md` for current phase
4. Follow verification plan for any changes
5. Update codemaps after modifications