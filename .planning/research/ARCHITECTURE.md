# Architecture Research: v12.0 Visual Polish & Combat FX

**Project:** Mythika: Echoes of the Divine  
**Milestone:** v12.0 — Visual Polish & Combat FX  
**Researched:** 2026-10-22  
**Domain:** Vanilla JS Canvas RPG combat FX + zone content integration  
**Confidence:** HIGH (all claims verified against source code)

---

## Executive Summary

Mythika v12.0 builds on v11.0 (Combat Damage FX) and v10.0 (Shared Library Foundations) to add visual polish (particle variety, screen shake), expanded combat FX integration, and new realm/zone content. The existing architecture already provides the complete foundation: `R.colors.elements` token map (fire/ice/lightning/dark/holy/default), `R.damageNumber` spring-driven floaters, `R.elementBurst` 60-slot circular particle buffer, `R.screenShake`, and combat hit sites wired to both floaters and bursts via ailment-derived element keys. No new element types, no WebGL, and no bundler are permitted — all work extends the existing vanilla-JS immediate-mode Canvas stack with circular buffers and `R.reducedMotion()` gating.

The research confirms that all v12.0 features integrate through 5 existing integration points with zero architectural breaking changes. The build order follows dependency chains: renderer primitives → combat FX system → combatScene hit sites → zone content → UI verification.

---

## 1. Integration Points with Existing Systems

### 1.1 R.damageNumber Extension (v11.0 foundation)

**File:** `src/engine/renderer.js` (lines 505-534, 553-567, 584-631)

**What exists:**
- `R.damageNumber(ctx, x, y, value, color, opts)` with opts `{element, crit, heal}`
- Pre-allocated circular buffer `R.damageNumbers` (capacity 50) via `createCircularBuffer`
- Spring state pre-allocated per floater (`_spring` with `_springFn` from `FLOATER_SPRING`)
- Element tint + icon chip from `R.colors.elements` tokens
- Crit gold emphasis ring, heal green prefix, reduced-motion instant snap
- `R.updateEffects(dt)` steps springs in place, `filterInPlace` removes expired
- `R.renderEffects(ctx)` draws floaters with element chip, crit ring, tint

**Integration surface for v12.0:**
- Extend particle variety within the same floater entry (no new buffer, no new allocation)
- Add new visual variants (trail, spark, ring) drawn in `R.renderEffects` using existing floater fields
- Gate all new motion on `R.reducedMotion()` (same pattern as DMG-05)

### 1.2 R.elementBurst Extension (v11.0 foundation)

**File:** `src/engine/renderer.js` (lines 662-720)

**What exists:**
- `R.elementBurstSlots` array of 60, `R.elementBurstCount`, `R.elementBurstWriteIdx`
- `R.elementBurst(x, y, element, crit)` — crit spawns 10 particles, normal spawns 6
- Circular buffer with `active` flag reuse (no new allocation on spawn)
- `R.updateElementBursts(dt)` — life decay, position integration
- `R.renderElementBursts(ctx)` — square particles with shake offset

**Integration surface for v12.0:**
- Add new particle shapes/patterns within the same slot struct (extend `size`, add `shape` field)
- Add new burst patterns (ring, cone, scatter) spawned from the same `R.elementBurst` entry point
- Respect existing 60-slot cap — no memory growth

### 1.3 R.colors.elements Token Map (v11.0 foundation)

**File:** `src/engine/renderer.js` (lines 46-53)

**What exists:**
```js
elements: {
  fire:      { primary: '#ff6020', secondary: '#ff9040' },
  ice:       { primary: '#a0e0ff', secondary: '#d0f0ff' },
  lightning: { primary: '#c0c0ff', secondary: '#ffffff' },
  dark:      { primary: '#8040ff', secondary: '#402060' },
  holy:      { primary: '#e8e0d0', secondary: '#f0c060' },
  default:   { primary: '#e8a030', secondary: '#f0c060' }
}
```

**Constraint:** No new element types. All v12.0 FX must use existing 6 keys.

### 1.4 combatScene.js Hit Sites (v11.0 wired)

**File:** `src/scenes/combatScene.js`

**Two hit sites already wired:**

1. **Player attack** (lines 664-671): `setTimeout` at 200ms calls `R.damageNumber(G.ctx, enemyX, enemyY - 20, result.dmg, ...)` with `{element: playerElement, crit: result.isCrit}` then `R.elementBurst(enemyX, enemyY - 20, playerElement, result.isCrit)`. Element mapped from `hero.ailment` (agni→fire, shila→ice, vayu→lightning, vajra→lightning, default→dark).

2. **Enemy reaction counter** (lines 593-599): same pattern at target position, element from `enemy.ailment`.

**Additional existing FX calls in combatScene:**
- `R.screenShake(intensity, duration)` — line 460 (Tempest AoE), line 682 (crit/normal hits)
- `R.deathBurstAt(entity, isHero)` — lines 545-557, called on enemy/hero death
- `CombatFX.update(dt)` and `CombatFX.render(ctx)` — lines 1032, 1312-1313

**Integration surface for v12.0:**
- Add new hit sites (e.g., signature combo impacts, beast skill hits, ally heal floaters) reusing the same damageNumber + elementBurst pattern
- Extend `R.screenShake` with new intensity presets (subtle/strong) without changing the API

### 1.5 zone_variants.js (v4.0 foundation)

**File:** `src/data/zone_variants.js`

**What exists:**
- 12 companion-gated variants (`lz_` prefix) across 6 zones
- Small zones: 1 variant, medium: 2, large: 3
- Each variant references a `baseId` standard encounter, `bondReq` gating
- Auto-registers into `ENCOUNTERS` at load (same pattern as bonds.js)
- No new zone IDs — only new encounter IDs

**Integration surface for v12.0:**
- Add new `lz_` variants to existing zones (deepening, not expanding geography)
- Each variant can trigger new combat FX on variant encounter start
- Reuses existing `bondReq`, `baseId`, `weight`, `lvlMin/Max` schema

### 1.6 Existing Zone Systems

| System | File | Role | v12.0 Integration |
|--------|------|------|-------------------|
| MapLayout | `src/data/map_layout.js` | 6 zone entries with positions/colors/connections | Read-only zone metadata for content placement |
| LivingZones | `src/systems/living_zones.js` | Companion-reactive zone depth, tease, resolve | Companion-gated content with bond notes |
| Landmarks | `src/systems/landmarks.js` | Zone landmark discovery + bond notes | New landmarks within existing zones |
| ZoneRewardSystem | `src/systems/zone_rewards.js` | Percentage + completion rewards | Progress rewards trigger combat FX on milestone |
| WorldEvents | (via MapHelpers) | Timed zone events | Event resolution can trigger screen shake |
| R.Backgrounds | `src/engine/backgrounds.js` | Zone/combat background slots with fallback gradients | New zone bg slot keys, authored image preload |

---

## 2. New Components Needed (vs Modifications to Existing)

### 2.1 Modifications to Existing (No New Files)

| Component | File | Change | Allocation Impact |
|-----------|------|--------|-------------------|
| `R.damageNumber` | `src/engine/renderer.js` | Add optional `trail`/`spark` opts fields; draw additional mini-particles in `R.renderEffects` using existing floater `x`,`y`,`life`,`scale` | Zero — reuses floater fields, no new objects |
| `R.renderEffects` | `src/engine/renderer.js` | Draw new particle variants (trail streaks, spark bursts) within existing `forEach` loop | Zero — same iteration, extra `ctx` calls only |
| `R.elementBurst` | `src/engine/renderer.js` | Add `shape` field to particle slot (`'square'` \| `'dot'` \| `'star'`); new pattern presets (ring, cone) called from same entry point | Zero — slot struct already allocated, `shape` is a string ref |
| `R.updateElementBursts` | `src/engine/renderer.js` | Shape-specific movement (radial for burst, linear for trail) | Zero — same loop, branch on `shape` |
| `R.renderElementBursts` | `src/engine/renderer.js` | Shape-specific drawing (arc for dot, line for trail, multi-rect for star) | Zero — same loop, extra `ctx` calls |
| `R.screenShake` | `src/engine/renderer.js` | Add preset constants (`SHAKE_SUBTLE`, `SHAKE_STRONG`) or optional `preset` param | Zero — constants are scalars |
| `combatScene.js` | `src/scenes/combatScene.js` | Add FX calls at new hit sites (signature combo impact, beast skill hit, ally heal floater) | Zero — reuses `R.damageNumber` + `R.elementBurst` |
| `zone_variants.js` | `src/data/zone_variants.js` | Add new `lz_` variants to existing zones | Zero — data entries, no runtime objects |

### 2.2 New Components Needed

| Component | File | Purpose | Allocation Strategy |
|-----------|------|---------|---------------------|
| `R.shakePresets` | `src/engine/renderer.js` | Named shake intensity/duration presets for consistent FX | Plain object constant, zero runtime allocation |
| `ZoneContentFX` (optional system) | `src/systems/zone_content_fx.js` | Coordinates combat FX triggers on zone milestone events (completion, landmark discovery) | Stateless namespace object, reads `G.state`, calls `R.*` |

**Recommendation:** Prefer modifications over new files. The `ZoneContentFX` system is optional — zone milestone FX can be wired directly into `ZoneRewardSystem._commitTo` callbacks or `combatScene.endBattle` without a new system file. Only create `ZoneContentFX` if coordination grows beyond 2-3 call sites.

---

## 3. Data Flow Changes

### 3.1 Existing Data Flow (unchanged)

```
Combat.performAttack()
  → CombatFX.spawn(element, x, y, crit)
    → R.elementBurst(x, y, element, crit)  [60-slot circular buffer]
  → combatScene setTimeout(200ms)
    → R.damageNumber(ctx, enemyX, enemyY-20, dmg, color, {element, crit})
      → R.damageNumbers.add(floater)  [50-slot circular buffer]
  → gLoopFrame: R.updateEffects(dt) → R.renderEffects(ctx)
  → gLoopFrame: R.updateElementBursts(dt) → R.renderElementBursts(ctx)
```

### 3.2 v12.0 Data Flow (additive)

```
New hit site (e.g., signature combo impact)
  → R.damageNumber(ctx, targetX, targetY, dmg, color, {element, crit, trail: true})
    → R.damageNumbers.add(floater with trail field)  [same 50-slot buffer]
  → R.elementBurst(x, y, element, crit, {pattern: 'ring'})  [same 60-slot buffer]
    → R.elementBurstSlots[i] = {..., shape: 'ring', pattern: 'ring'}
  → gLoopFrame: R.updateEffects(dt) [trail decay] → R.renderEffects(ctx) [trail draw]
  → gLoopFrame: R.updateElementBursts(dt) [shape movement] → R.renderElementBursts(ctx) [shape draw]

Zone milestone (completion/landmark)
  → ZoneRewardSystem._commitTo or Landmarks.tryDiscover callback
    → R.screenShake(intensity, duration)  [preset-based]
    → R.elementBurst(centerX, centerY, element, true)  [celebration burst]
```

### 3.3 Data Shape Changes

| Structure | Field | Type | Purpose |
|-----------|-------|------|---------|
| `R.damageNumbers` floater | `trail` | boolean | Draw trail streaks behind floater |
| `R.damageNumbers` floater | `spark` | boolean | Draw spark burst at floater position |
| `R.elementBurstSlots` particle | `shape` | string | `'square'` (default) \| `'dot'` \| `'star'` |
| `R.elementBurstSlots` particle | `pattern` | string | `'burst'` (default) \| `'ring'` \| `'cone'` |
| `R.shakePresets` | `subtle` / `strong` | `{intensity, duration}` | Named shake presets |

**No save-state changes.** All new fields are transient renderer state (recreated each frame, never persisted). Save compatibility is preserved automatically.

### 3.4 Element Key Constraint

No new element types. All FX use existing `R.colors.elements` keys: `fire`, `ice`, `lightning`, `dark`, `holy`, `default`. The ailment→element mapping in `combatScene.js` (lines 594, 665) is reused unchanged.

---

## 4. Suggested Build Order (Dependency-Aware)

### Phase 1: Renderer Primitives (Foundation)

**Goal:** Extend `R` with new particle variety and shake presets. No scene or system changes.

1. **Add `R.shakePresets` constant** — `subtle` (intensity 2, duration 0.15), `strong` (intensity 8, duration 0.4)
2. **Extend `R.elementBurst`** — add `shape` and `pattern` fields to particle slot; add ring/cone/star drawing in `R.renderElementBursts`; shape-based movement in `R.updateElementBursts`
3. **Extend `R.damageNumber`** — accept optional `trail`/`spark` opts; store on floater entry
4. **Extend `R.renderEffects`** — draw trail streaks and spark bursts within existing floater `forEach`, gated on `R.reducedMotion()`
5. **Tests:** `tests/damage_burst.test.js` (extend), `tests/damage_floater.test.js` (extend)

**Dependency:** None. Depends only on `R.colors.elements` (already exists).

### Phase 2: Combat FX Integration (Hit Sites)

**Goal:** Wire new FX into existing combat hit sites.

1. **combatScene.js player attack hit site** — add `trail: true` on crit, optional burst pattern variation
2. **combatScene.js enemy reaction hit site** — same treatment
3. **combatScene.js signature combo impact** — new hit site: `R.damageNumber` + `R.elementBurst` with ring pattern at combo target
4. **combatScene.js beast skill hits** — `Spirit Flame`, `Tempest`, `Rending Claw` get element bursts keyed to beast element
5. **Tests:** `tests/combat_fx_integration.test.js` (new)

**Dependency:** Phase 1 complete.

### Phase 3: Zone Content (Data-Only)

**Goal:** Add new `lz_` variants and landmarks to existing zones without new zone IDs.

1. **zone_variants.js** — add 2-3 new `lz_` variants across existing zones (deepening dandaka, patala, meru)
2. **MapLayout** — no changes (read-only zone metadata; new landmarks use existing zone entries)
3. **Landmarks** — add new landmark definitions to `LANDMARKS` data for existing zones (if landmark data file exists; otherwise add inline)
4. **LivingZones** — no changes (existing `companionFor`, `teaseFor`, `landmarkBondNote` work with new variants)
5. **Tests:** `tests/living_zones_variants.test.js` (extend)

**Dependency:** None for data. Phase 1 provides FX that variants can trigger.

### Phase 4: Zone Milestone FX (Integration)

**Goal:** Trigger combat FX on zone completion and landmark discovery.

1. **ZoneRewardSystem._commitTo** — on `completionClaimed` or percentage crossed, call `R.screenShake(R.shakePresets.strong)` + `R.elementBurst(centerX, centerY, 'holy', true)`
2. **Landmarks.tryDiscover** — on discovery, `R.screenShake(R.shakePresets.subtle)` + small `R.elementBurst`
3. **Tests:** `tests/zone_rewards.test.js` (extend, mock `R.screenShake`/`R.elementBurst`)

**Dependency:** Phase 1 (shake presets, element burst).

### Phase 5: HUD Screen/Scene Alignment Verification

**Goal:** Verify HUD alignment for screens not being adjusted in v12.0.

1. **Audit all 27 scenes** — confirm HUD (`UI.HUD()`) renders correctly on unaffected scenes (title, ashram, party, equipment, forge, alchemy, bazaar, farm, fishing, journey, questLog, achievements, spiritBeast, punarjanma, settings, tournament, trials, encounterScene, welcome, characterCreate, authScene, debug)
2. **Verify responsive rects** at 400×720, 540×900, 720×400, 1024×768, 1440×900 per AGENTS.md
3. **Verify `Scene.toastLane()` alignment** — toasts don't overlap HUD or scene content
4. **Tests:** `tests/layout_harness.test.js`, `tests/responsive_screen_matrix.test.js`

**Dependency:** All phases complete (ensures no regressions from FX changes).

---

## 5. Architecture Constraints to Preserve

| Constraint | Source | Enforcement |
|------------|--------|-------------|
| **Zero per-frame allocation** | Project philosophy, v11.0 DMG-01/02 | All new particle data uses existing circular buffers (`R.damageNumbers` cap 50, `R.elementBurstSlots` cap 60). No `push`, `new object`, or array creation in `update`/`render` paths. |
| **R.reducedMotion() gating** | v11.0 DMG-05, accessibility | Every new animation path checks `R.reducedMotion()` and falls back to static/instant. Applies to trails, sparks, shake, burst patterns. |
| **Save compatibility** | Project constraints | All new fields are transient renderer state. No new `G.state` keys. No save migration needed. |
| **No new element types** | v12.0 constraints | All FX use existing `R.colors.elements` keys (fire/ice/lightning/dark/holy/default). |
| **No WebGL** | v12.0 constraints | Canvas 2D only. All drawing via `R.rect`, `R.roundRect`, `ctx.arc`, `ctx.fillText`. |
| **Vanilla JS globals** | Project architecture | No ES modules, no bundler, no framework. Extend `R` object and existing scene files. |
| **Script-order dependencies** | `index.html` contract | New renderer code goes in `renderer.js` (loaded before scenes). New scene code follows existing load order. |
| **Logical 400×720 Canvas** | Game engine contract | All coordinates use `G.W`/`G.H` logical units. DPR handled by `fitGame()`. |
| **Scene lifecycle** | `Scene.create` pattern | New/modified scenes implement `enter`/`update`/`render`/`leave`. `leave()` must clean up timers and button arrays. |
| **Modal guard** | Scenes codemap | `if (UI.Modal.active) { UI.Modal.handleInput(); return; }` at top of `update()`. |
| **Toast/cap limits** | LAY-05 | `Notify.queue` capped at 3. Feedback toasts capped at 3/system. New FX toasts respect these caps. |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Circular buffer overflow (60 burst slots exhausted during intense combat) | Medium | Low | Buffer auto-recycles oldest slots via `active` flag reuse. Visual degradation only, no crash. |
| `R.damageNumbers` buffer overflow (50 floaters) | Low | Low | `filterInPlace` removes expired each frame. 50 capacity is generous for combat pace. |
| New particle drawing increases frame time | Medium | Medium | All new `ctx` calls are within existing loops. Profile with `?probe` before shipping. |
| Save compatibility regression | Low | High | Zero `G.state` changes — impossible to break saves. Verify with `tests/save_coherence.test.js`. |
| Reduced-motion regression | Medium | High | All new motion gated identically to existing FX. Test with `G.state.reduceMotion = true`. |

---

## 7. Files to Create / Modify

### Modify (no new files):

1. `src/engine/renderer.js` — `R.shakePresets`, `R.elementBurst` shape/pattern, `R.damageNumber` trail/spark, `R.renderEffects`, `R.renderElementBursts`, `R.updateElementBursts`
2. `src/scenes/combatScene.js` — new hit sites at signature combo, beast skills, ally heals
3. `src/data/zone_variants.js` — new `lz_` variants
4. `src/systems/zone_rewards.js` — milestone FX callbacks (optional)
5. `src/systems/landmarks.js` — discovery FX (optional)

### Create (optional, only if needed):

6. `src/systems/zone_content_fx.js` — zone milestone FX coordinator (only if >3 call sites)
7. `tests/combat_fx_integration.test.js` — new test file

### Verify (no changes):

8. `tests/damage_burst.test.js` — extend for shape/pattern
9. `tests/damage_floater.test.js` — extend for trail/spark
10. `tests/living_zones_variants.test.js` — extend for new variants
11. `tests/layout_harness.test.js` — HUD alignment verification

---

## 8. Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Stack | HIGH | All existing systems verified against source code (renderer.js, combatScene.js, zone_variants.js, etc.) |
| Features | HIGH | v12.0 target features map cleanly to existing integration points |
| Architecture | HIGH | Codemaps (root, scenes, systems, UI, engine) all read and consistent |
| Pitfalls | MEDIUM | Buffer overflow and frame-time risks identified but low probability |

---

## 9. Roadmap Implications

**Suggested phase structure:**

1. **Phase 1: Renderer Primitives** — `R.shakePresets`, burst shapes, damage floater trails/sparks. Foundation for all FX.
2. **Phase 2: Combat FX Hit Sites** — Wire new FX into combatScene player/enemy hits, signature combos, beast skills.
3. **Phase 3: Zone Content Data** — New `lz_` variants + landmarks in existing zones.
4. **Phase 4: Zone Milestone FX** — Screen shake + burst on zone completion and landmark discovery.
5. **Phase 5: HUD Alignment Verification** — Audit unaffected scenes at all viewport sizes.

**Phase ordering rationale:** Phase 1 has no dependencies and enables everything else. Phase 2 depends on Phase 1 primitives. Phase 3 is data-only and can run in parallel with Phase 1-2. Phase 4 depends on Phase 1 (shake presets). Phase 5 validates no regressions after all changes.

**Research flags:**
- Phase 2: Verify `setTimeout` runId guards prevent FX after scene transition (existing pattern, extend to new hit sites)
- Phase 4: Verify `R.screenShake`/`R.elementBurst` are mocked in zone_rewards tests to avoid renderer dependency
- Phase 5: All 27 scenes must be checked; combatScene and travelMap are most likely to regress from FX changes
