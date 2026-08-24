# Phase 1 Verification Plan — Memory Leak Remediation

**Date:** 2026-08-23  
**Scope:** Three high-priority fixes from architecture audit

---

## Claim 1: Particle Arrays Are Bounded

### Framed Claim
> After remediation, all particle arrays (`R.damageNumbers`, `R.deathBursts`, `R.levelUpParticles`, `R.clickFx`) maintain a fixed maximum capacity. When capacity is reached, oldest entries are overwritten (circular buffer) rather than accumulating indefinitely via `push()` + `shift()`.

### Meaningful Uncertainty
- Current code uses `push()` + `shift()` when `length >= MAX` — this works but creates GC pressure from frequent array reallocation
- Circular buffer avoids allocation but requires index management
- Must verify all push paths respect the bound (some may bypass the check)

### Failure Modes
| Mode | Consequence |
|------|-------------|
| Bound not enforced in all paths | Memory grows unbounded during intense combat |
| Circular buffer index bug | Visual glitches (missing/duplicate particles) |
| MAX constant too low | Particles disappear prematurely |
| MAX constant too high | Memory still grows under sustained load |

### Evidence Path
**Primary:** Static analysis of all `push()` sites in `renderer.js` for each particle array
- `R.damageNumbers.push()` — line 256
- `R.deathBursts.push()` — line 273
- `R.levelUpParticles.push()` — line 597
- `R.clickFx.push()` — lines 353, 365, 379

**Secondary:** Runtime verification via console instrumentation
```javascript
// In browser console after load:
setInterval(() => {
  console.log('Particles:', {
    damage: R.damageNumbers.length,
    death: R.deathBursts.length,
    levelUp: R.levelUpParticles.length,
    click: R.clickFx.length
  });
}, 1000);
```
Trigger combat, level-ups, clicks for 60s — verify all stay ≤ MAX.

**Tertiary:** Memory profiling (Chrome DevTools)
- Record heap snapshot before/after 5min stress test
- Verify no retained growth in particle arrays

### Verification Budget
- **Owner:** fixer agent (implementation) + orchestrator (verification)
- **Evidence:** Modified `renderer.js` + console log output + heap snapshots
- **Threshold:** All arrays ≤ MAX at all times during 5min stress test

---

## Claim 2: Scene Lifecycle Cleanup Is Comprehensive

### Framed Claim
> After remediation, every scene's `leave()` method nullifies all retained references (`_heroMoment`, `_fluidNav`, `_shell`, timers, intervals, event listeners) and stops any auto-save/animation loops started in `enter()`.

### Meaningful Uncertainty
- 30 scenes with varying cleanup needs — some have `leave()`, some don't
- Common retained fields: `_heroMoment`, `_fluidNav`, `_shell`, `_popup`, timers
- Must verify each scene without missing edge cases

### Failure Modes
| Mode | Consequence |
|------|-------------|
| Scene missing `leave()` | Objects retained for session lifetime |
| `leave()` incomplete | Partial cleanup (e.g., `_heroMoment` nulled but `_fluidNav` not) |
| Timer not cleared | `CultivationSystem.tick` runs in wrong scene, auto-save persists |
| Event listener not removed | Memory leak + duplicate handlers on re-entry |

### Evidence Path
**Primary:** Static audit of all 30 scene files
- Check each has `leave()` method
- Verify `leave()` nullifies: `_heroMoment`, `_fluidNav`, `_shell`, `_popup`, any timers/intervals
- Verify `SaveSystem.stopAutoSave()` called where `startAutoSave()` used

**Secondary:** Runtime verification via scene transition stress test
```javascript
// In browser console:
let transitionCount = 0;
const scenes = ['ashram', 'travelMap', 'cultivationScene', 'party', 'forge', 'alchemyScene', 'bazaar', 'farm', 'fishing', 'journeyScene', 'questLog', 'achievementsScene', 'spiritBeast', 'punarjanma', 'settings'];
function stressTransition(i = 0) {
  if (i >= scenes.length) { console.log('Done:', transitionCount); return; }
  gScene(scenes[i]);
  transitionCount++;
  setTimeout(() => stressTransition(i + 1), 500);
}
stressTransition();
// After: check console for errors, verify no retained objects in heap
```

**Tertiary:** Heap snapshot comparison
- Snapshot before transitions
- Run 100 transitions (loop through scenes)
- Snapshot after — verify no cumulative retained scene objects

### Verification Budget
- **Owner:** fixer agent (implementation) + orchestrator (verification)
- **Evidence:** Modified 30 scene files + stress test console output + heap snapshots
- **Threshold:** Zero retained scene-specific objects after 100 transitions

---

## Claim 3: Audio & Event Management Cleanup

### Framed Claim
> After remediation:
> 1. `Audio.cleanup()` exists and releases `AudioContext`, stops music interval, clears music nodes
> 2. `pagehide` listener calls `Audio.cleanup()` and `Audio._ctx.suspend()`
> 3. `window` resize/orientationchange listeners removed on cleanup
> 4. All scene intervals (auto-save, cultivation tick) cleared on `leave()`

### Meaningful Uncertainty
- `Audio._ctx` created on first gesture, never released
- `SaveSystem._timer` (30s auto-save) started in `ashram.enter()`, stopped in `ashram.leave()` — but what if scene changes via Fade?
- `CultivationSystem.tick(dt)` called every frame in `gLoopFrame` regardless of scene — should it be scene-scoped?

### Failure Modes
| Mode | Consequence |
|------|-------------|
| AudioContext not suspended on pagehide | Audio keeps playing in background, battery drain |
| Resize listener not removed | Accumulated listeners on repeated loads |
| Auto-save interval not cleared | Saves fire in wrong scene, potential corruption |
| Cultivation tick runs everywhere | Wasted CPU in non-cultivation scenes |

### Evidence Path
**Primary:** Static analysis of `audio.js`, `game.js`, `save.js`, `ashram.js`
- Verify `Audio.cleanup()` implementation
- Verify `pagehide` listener registration
- Verify `resize`/`orientationchange` removal
- Verify `SaveSystem.stopAutoSave()` in all relevant `leave()`

**Secondary:** Runtime verification
```javascript
// Test pagehide:
document.dispatchEvent(new Event('pagehide'));
// Verify: Audio._ctx.state === 'suspended', Audio._musicInterval === null

// Test resize listener cleanup:
window.dispatchEvent(new Event('resize'));
// Verify: no errors, fitGame() called once

// Test auto-save cleanup:
gScene('ashram'); // starts auto-save
gScene('travelMap'); // should stop auto-save
// Verify: SaveSystem._timer === null
```

**Tertiary:** Battery/CPU profiling
- Leave game in background for 5min — verify no audio CPU usage
- Rapid scene transitions — verify no listener accumulation

### Verification Budget
- **Owner:** fixer agent (implementation) + orchestrator (verification)
- **Evidence:** Modified `audio.js`, `game.js`, `save.js`, `ashram.js` + runtime test output
- **Threshold:** AudioContext suspended on pagehide, zero listener accumulation, auto-save interval cleared on scene exit

---

## Combined Verification Checklist

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Particle arrays bounded | Console log + heap snapshot | All ≤ MAX during 5min stress |
| All 30 scenes have `leave()` | Static audit | 30/30 have leave() |
| `leave()` nullifies common fields | Static audit + heap snapshot | Zero retained scene objects after 100 transitions |
| Auto-save stops on scene exit | Runtime test | `SaveSystem._timer === null` after leaving ashram |
| AudioContext suspended on pagehide | Runtime test | `Audio._ctx.state === 'suspended'` |
| Resize listeners don't accumulate | Runtime test | `fitGame` called once per resize |
| No console errors during transitions | Stress test | Zero errors in 100 transitions |

---

## Implementation Order (Dependency-Aware)

1. **Particle Arrays** (renderer.js) — Independent, low risk
2. **Audio Cleanup** (audio.js, game.js) — Independent, affects page lifecycle
3. **Scene leave() Cleanup** (30 scene files) — Depends on knowing all retained fields
4. **Event/Interval Cleanup** (save.js, ashram.js, game.js) — Cross-cutting

---

## Affordances Needed

| Affordance | Purpose | Lifecycle |
|------------|---------|-----------|
| `R.particlePool` | Object pool for particles (replaces arrays) | Durable — replaces current arrays |
| `Scene.cleanup()` base method | Standardized cleanup hook | Durable — added to Scene factory |
| `Audio.cleanup()` | Explicit audio resource release | Durable — part of Audio API |
| Console particle monitor | Verification affordance | Temporary — remove after Phase 1 |

---

## Sign-Off Criteria

Phase 1 complete when:
- [ ] All 4 particle arrays use circular buffer / object pool
- [ ] All 30 scenes have `leave()` with comprehensive cleanup
- [ ] `Audio.cleanup()` implemented + `pagehide` listener registered
- [ ] `window` resize/orientationchange listeners properly managed
- [ ] `SaveSystem.stopAutoSave()` called on all relevant scene exits
- [ ] Stress test (100 transitions, 5min combat) passes with zero leaks
- [ ] Heap snapshots show stable memory