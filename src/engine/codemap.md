# src/engine/

## Responsibility
Core game engine — rendering primitives, game loop, scene management, input handling, audio, and global state. The "kernel" that all scenes and systems build upon.

## Design Patterns
- **Global Namespace (`G`, `R`, `UI`, `Scene`, `Input`, `Audio`, `Notify`, `Fade`)**: All engine subsystems exposed as singletons on global scope
- **Watchdog Game Loop**: `requestAnimationFrame` scheduled first, frame execution wrapped in try/catch for crash recovery
- **Scene State Machine**: `Scene.create()` factory + `registerScene()` registry + `gScene()` transition manager
- **Immediate-Mode Rendering**: Canvas 2D API, no retained scene graph — every frame rebuilds from scratch
- **DPR-Aware Canvas**: Logical 400x720, backed by device pixels (max DPR 3)

## Data & Control Flow

### Game Loop (`game.js:gLoopFrame`)
```
rAF → dt calc → Notify.update → R.updateEffects → R.updateProjectiles → R.updateLevelUp
    → R.updateClickFx → Enlightenment decay → Fade.update → Scene.update
    → clearRect → drawBackground → Scene.render → R.renderProjectiles
    → R.renderEffects → R.renderClickFx → R.renderLevelUp → R.renderEnlightenmentAura
    → Fade.render → Notify.render → Perf probes → Adaptive Reduce Motion
```

### Scene Transition (`game.js:gScene` / `Fade`)
```
gScene(name, fade?) → Input.clear() → Modal.clearAll()
    → if fade: Fade.toScene(name) [async, 150ms out / 250ms in]
    → else: currentScene.leave() → currentScene = scenes[name] → safeEnter()
```

### Input Pipeline (`input.js`)
```
pointerdown/touchstart → _pressPos + _touchStartTime
pointerup/touchend → swipe detection (dx > 40px) OR tap queued (_pushTap)
    → clicks/touches arrays (max 4, min 70ms interval)
Scene.update → Input.peekTap()/getTap() → UI.handleButtons()
```

### Audio (`audio.js`)
```
First gesture → Audio.unlock() → AudioContext.create() → resume() if suspended
Music: setInterval(playNote) with OscillatorNode + GainNode per note
SFX: Audio.beep() creates OscillatorNode + GainNode, exponential ramp to 0
Gating: click sounds throttled to 45ms, music only when musicOn=true
```

## Integration Points

| Module | Exports | Consumers |
|--------|---------|-----------|
| `game.js` | `G`, `Notify`, `Fade`, `fitGame`, `gInit`, `gLoop`, `gScene`, `safeEnter`, `drawBackground` | All scenes, systems, main.js |
| `scene.js` | `Scene.create`, `registerScene`, `initSceneManager` | main.js (registration), scenes (inheritance) |
| `scene-helpers.js` | `Scene.drawStatic`, `Scene.scrollInput`, `Scene.drawScrollbar`, `Scene.gearLabel`, `Scene.cullButtons`, `Scene.drawHeader`, `Scene.clipContent`, `Scene.backButton`, `Scene.HeroMoment`, `Scene.ScrollReveal`, `Scene.FluidNav`, `Scene.EmptyState` | All scenes |
| `renderer.js` | `R` (colors, fonts, radius, primitives, effects, projectiles, clickFx, zone backgrounds) | All scenes, systems, UI |
| `input.js` | `Input` (touches, clicks, keys, swipe, scroll, longPress) | All scenes, UI.handleButtons |
| `audio.js` | `Audio` (beep, click, thud, attack, crit, skill, magic, heal, hit, dodge, shield, levelUp, combo, comboMilestone, error, playMusic, stopMusic) | All scenes, Combat, Notify |

## Critical Invariants
- `G.ctx` always has `setTransform(dpr, 0, 0, dpr, 0, 0)` — logical coords = 400x720
- `G.dt` clamped to 0.05s (50ms) max — prevents spiral of death on tab background
- `G._errStreak` tracks consecutive loop errors — toast at 1 and 25, never stops loop
- `Fade` asymmetric: 150ms fade-out, 250ms fade-in (scene "breathes")
- `Notify` queue max 3, achievements max 2 visible
- `R.reducedMotion()` checks `G.state.reduceMotion` OR `prefers-reduced-motion` media query

## Performance Characteristics
| Metric | Current | Notes |
|--------|---------|-------|
| Frame budget | 16.67ms (60fps) | `dt` clamped to 50ms |
| Canvas clear | Full 400x720 every frame | No dirty rect optimization |
| Particle systems | 4 arrays (damage, death, levelUp, clickFx) | Bounded by constants but shift() on overflow |
| Background | New gradient every frame | `drawBackground()` creates `createLinearGradient` |
| Noise overlay | Full 400x720 drawImage every frame | `R.renderNoise()` at 3% alpha |
| Audio context | Single shared `AudioContext` | Created on first gesture, never released |

## Memory Leak Risks
1. **Particle arrays** — `R.damageNumbers`, `R.deathBursts`, `R.levelUpParticles`, `R.clickFx` use `shift()` only when exceeding max, but `push()` unbounded in hot paths
2. **Audio context** — Never `close()`d, persists for session
3. **Event listeners** — `resize`/`orientationchange` on `window` never removed
4. **Intervals** — `SaveSystem._timer`, `Audio._musicInterval` require explicit stop
4. **Scene references** — `_heroMoment`, `_fluidNav`, `_shell` created in `render()`, never nulled in `leave()`

## Refactoring Opportunities
1. **Extract `GameLoop` class** — encapsulate rAF, dt, error handling
2. **Extract `SceneManager` class** — own registry, transitions, lifecycle
3. **Extract `Renderer` class** — own canvas, context, draw calls
4. **Object pooling** — Pre-allocate particle arrays, reuse objects
5. **Viewport culling** — Skip off-screen particles/projectiles
6. **Cached gradients** — Create background gradients once
7. **ES Modules** — Replace script-tag loading with static imports