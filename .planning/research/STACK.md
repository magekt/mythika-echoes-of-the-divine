# Technology Stack — v12.0 Visual Polish & Combat FX

**Project:** Mythika: Echoes of the Divine  
**Researched:** 2026-10-22  
**Milestone:** v12.0 — Visual Polish, Combat FX Expansion, Zone Content  
**Mode:** Ecosystem (internal stack additions, no external libraries)

---

## Executive Summary

v12.0 builds on the v10.0 (`R` renderer primitives + `UI.Component` factory + `R.springConfigs`) and v11.0 (`R.damageNumber` spring floaters + `R.elementBurst` 60-slot circular buffer) foundations. All v12.0 additions are **internal to the existing vanilla JS / Canvas 2D architecture** — zero external libraries, zero bundlers, zero frameworks, zero WebGL, no ES-module migration, no backend, no new element types, no new zone IDs. Everything is added to the `R` namespace in `src/engine/renderer.js` and to data files under `src/data/`, following the existing circular-buffer + zero-per-frame-allocation pattern established in v11.0.

Firebase JavaScript SDK v12.x (12.18.0 pinned in `index.html`) is confirmed current via Context7 (`/firebase/firebase-js-sdk`, v12.0.0 is the latest major line). Firebase remains optional auth-only, gated behind `?probe`, and does not block offline play.

---

## Recommended Stack Additions

All additions are internal code — no npm installs, no `<script>` tags beyond the existing set, no build-step changes.

### 1. Particle Variety Additions (renderer.js — `R` namespace)

| Addition | Purpose | Reuses | Rationale |
|----------|---------|--------|-----------|
| `R.elementBurst` shape variants (arc, circle, line, spark) | Element-specific burst visuals per element (fire = sparks/arcs, ice = crystalline lines, lightning = jagged lines, dark = expanding rings, holy = soft circles) | `createCircularBuffer`, `R.colors.elements`, `R.reducedMotion()` | v11.0 `R.elementBurst` only spawns squares via `R.rect`. Shape variety makes element bursts visually distinct without new allocation patterns. |
| `R.ambientParticles` per-zone emitter | Zone environmental FX (falling petals in aryavarta, dust motes in dandaka, fireflies in meru, embers in patala, light motes in svarga) | `createCircularBuffer`, `R.colors.elements`, `R.reducedMotion()` | Zone content needs living ambience. Bounded circular buffer keeps memory fixed; per-zone data drives density/color. |
| `R.damageNumber` variants (bounce, rotate, element glyph) | Heal floaters (green, upward bounce), crit floaters (rotation + scale overshoot), element glyph chips | `R.spring`, `R.springConfigs`, `R.colors.elements` | Extends v11.0 floater system without changing its core contract. Spring registry already has named configs; new configs can be added for bounce/rotate. |
| `R.comboParticles` | Combo milestone burst when `R.triggerComboFlash` fires | `createCircularBuffer`, `R.colors.gold` | Combo feedback currently only flashes the screen. A small gold particle burst at combo center reinforces the reward. |

### 2. Screen Shake Utility Enhancement (renderer.js — `R` namespace)

| Addition | Purpose | Reuses | Rationale |
|----------|---------|--------|-----------|
| `R.screenShake` directional + decay | Existing shake is uniform random jitter with linear decay. Add: directional bias (hit direction), exponential decay falloff, per-axis (x/y) control, magnitude scaling by impact intensity | `R.shakeX`, `R.shakeY`, `R.shakeTimer`, `R.shakeIntensity` (already exist), `R.reducedMotion()` | v11.0 shake works but is basic. Combat hits from different directions should shake differently; exponential decay feels more physical than linear. |
| `R.shakeDecay` config in `R.springConfigs` | Named shake decay profile | `R.springConfigs` registry | Centralizes shake tuning like spring configs centralize UI spring tuning. |

### 3. Combat FX Integration Expansion (combatFx.js + combatScene.js)

| Integration Point | Purpose | Reuses | Rationale |
|-------------------|---------|--------|-----------|
| Heal floaters + bursts on healing events | `R.damageNumber(..., {heal: true})` + `R.elementBurst(..., 'holy')` | `R.damageNumber`, `R.elementBurst`, `R.colors.elements.holy` | v11.0 covers damage-only. Heals, buffs, and blocks have no FX yet. |
| Buff/debuff application FX | Small element-tinted burst at target when `Combat.applyBuff`/`applyAilment` fires | `R.elementBurst`, `Combat.applyBuff`/`applyAilment` | Makes status changes visible, not just log text. |
| Block/parry/counter FX | Stone-hit style micro-FX (`R.clickFx` glass pattern) or small ring at defender | `R.clickFx`, `R.screenShake` (low intensity) | Reaction window outcomes (parry/guard/interrupt) currently have no visual confirmation. |
| Death burst element-tinted | `R.deathBurst` currently uses fixed red/blue. Tint by enemy/hero element | `R.deathBurst`, `R.colors.elements` | Consistency with element-aware damage floaters (v11.0). |
| Projectile impact burst | `R.elementBurst` at projectile target on hit | `R.fireProjectile`/`R.updateProjectiles`, `R.elementBurst` | Projectiles currently arrive with no impact visual. |

### 4. Zone Content Data Structures (src/data/)

| Addition | Purpose | Reuses | Rationale |
|----------|---------|--------|-----------|
| Zone landmarks (within existing zone IDs) | Discoverable points of interest inside each zone (shrines, groves, ruins) | `ZONES` table, `LivingZones`, `ZoneAccess`, `landmarks.js` | Constraint: no new zone IDs. Landmarks deepen existing zones without expanding geography. |
| Zone background variants | Per-zone ambient particle definitions (density, color, element key) | `ZONES[zoneId].bgColor`, `R.drawZoneBackground`, `R.colors.elements` | Zone ambience needs per-zone data. No new element types — reuse existing element keys for color. |
| Zone variant encounter FX | Bond-gated variants (`lz_*` entries) can trigger zone-appropriate burst on completion | `ZONE_VARIANTS`, `CombatFX.spawn`, `LivingZones` | Variant completion is a meaningful moment worthy of FX. |

---

## What Can Be Reused from Existing Stack

| Existing Asset | Location | How v12.0 Reuses It |
|----------------|----------|---------------------|
| `R.spring` + `R.springConfigs` registry | `src/engine/renderer.js:232-275` | Spring-driven particle motion, bounce floaters, shake decay profiles. Centralized, named, versioned. |
| `createCircularBuffer(maxSize)` | `src/engine/renderer.js:429-481` | All particle arrays (damage numbers, element bursts, click FX, death bursts, level-up particles) use this. Zero per-frame allocation. |
| `R.colors.elements` token map | `src/engine/renderer.js:46-53` | fire, ice, lightning, dark, holy, default — primary/secondary pairs. No new element types needed. |
| `R.reducedMotion()` + `R.reducedMotion.watch` | `src/engine/renderer.js:108-134` | All new FX gated on reduced motion. Null-safe, works in Node tests and browsers. |
| `R.strokeRoundRect`, `R.doubleBezel`, `R.easePremium` | `src/engine/renderer.js:162-229` | Renderer primitives for FX containers, chips, rings. |
| `R.spring.step` | `src/engine/renderer.js:248-256` | In-place spring stepping — mutate existing state, no new objects. |
| `Backgrounds` system | `src/engine/backgrounds.js` | Zone backdrop rendering with fallback canvas generators. Custom generators via `registerSlot`. |
| `CombatFX` wrapper | `src/systems/combatFx.js` | `spawn`/`update`/`render` delegates to `R.elementBurst`. Already wired into combatScene update/render. |
| `R.screenShake` (basic) | `src/engine/renderer.js:536-543` | Existing shake state (`shakeX`, `shakeY`, `shakeTimer`, `shakeIntensity`) applied via `G.ctx.translate` in `gLoopFrame`. Enhance, don't replace. |
| `R.damageNumber` + `R.elementBurst` | `src/engine/renderer.js:505-720` | v11.0 floater + burst systems. Extend with variants, don't rewrite. |
| Test pattern: `damage_fx.test.js` | `tests/damage_fx.test.js` | VM sandbox loads `renderer.js`, mocks `G`/`Audio`/`ZONES`/`document`/`window`. Follow for new FX tests. |

---

## What Must NOT Be Added (Anti-Features)

Per v12.0 constraints from PROJECT.md:

| Anti-Feature | Why Excluded | What to Do Instead |
|--------------|--------------|-------------------|
| Frontend framework (React, Vue, Svelte, etc.) | Architecture constraint: vanilla JS, global namespace, script-order dependencies, immediate-mode Canvas. | Add functions to `R` namespace and data files. |
| Bundler (webpack, vite, esbuild, rollup) | `index.html` loads classic `<script>` tags in dependency order. No build step exists. | Keep classic scripts; add new `.js` files to `index.html` in dependency order. |
| ES-module migration (`type="module"`, `import`/`export`) | Script-order global runtime is a contract. Only Firebase bridge uses modules (isolated). | Keep `const R = {...}`, `const CombatFX = (...)`, global `G`. |
| Backend / cloud sync / Firebase game state | Firebase is optional auth-only, gated behind `?probe`. Local `localStorage` is the default. | All world state stays local and save-compatible via `src/systems/save.js`. |
| WebGL / Canvas 2D replacement | Constraint: no WebGL. Immediate-mode Canvas 2D is the renderer. | Add Canvas 2D drawing calls (`arc`, `lineTo`, `quadraticCurveTo`, `rotate`, `save`/`restore`). |
| New element types | Constraint: no new element types. Existing: fire, ice, lightning, dark, holy, default. | Reuse `R.colors.elements` keys for all new FX tinting. |
| New zone IDs | Constraint: deepen existing zones only (aryavarta, dandaka, meru, patala, svarga, tapobhumi). | Add landmarks, variants, and ambient particles within existing zone IDs. |
| Per-frame object allocation | v11.0 established zero-per-frame-allocation constraint for FX. | Use `createCircularBuffer` + `filterInPlace` + mutate-in-place. |
| Parallel state stores | `SaveSystem` owns save/migration; no scene-local or system-local parallel stores. | Zone content data flows through `G.state.zoneProgress`, `G.state.flags`, `G.state.encounters`. |
| Unbounded particle counts | Performance constraint: smooth on mid-range phones. | Fixed-size circular buffers (50 damage numbers, 60 bursts, 30 death bursts, etc.). |

---

## Integration Points with Existing Systems

### Game Loop (`src/engine/game.js` — `gLoopFrame`)
- `R.updateEffects(G.dt)` — add new particle update calls here (ambient particles, combo particles)
- `R.renderEffects(G.ctx)` — add new particle render calls here (after damage numbers/bursts)
- `G.ctx.translate(R.shakeX, R.shakeY)` — shake already applied to the whole frame; enhanced shake uses same state

### Combat Scene (`src/scenes/combatScene.js`)
- Player attack hit (line ~666-671): `R.damageNumber` + `R.elementBurst` — add heal/buff variants
- Reaction resolution (line ~595-600): `R.damageNumber` + `R.elementBurst` — add block/parry FX
- Beast skill `Tempest` (line 460): `R.screenShake(6, 0.3)` — enhanced directional shake
- Death bursts (`deathBurstAt`, line 545-557): `R.deathBurst` — element-tint by entity
- `CombatFX.update(dt)` / `CombatFX.render(ctx)` already called in update/render

### Combat System (`src/systems/combat.js`)
- `Combat.applyBuff` / `Combat.applyAilment` — hook FX spawn on status application
- `Combat.performAttack` — hook impact burst on hit

### Save System (`src/systems/save.js`)
- Zone landmarks, variant completion flags, and zone progress all flow through `G.state.zoneProgress`, `G.state.flags`, `G.state.encounters` — no save migration needed for additive data
- Save compatibility preserved: new fields default to `undefined`/empty, `SaveSystem.migrate` handles legacy state

### Living Zones (`src/systems/living_zones.js`)
- `LivingZones.resolveFor(zoneId)` / `teaseFor(zoneId)` — can trigger zone-appropriate ambient FX when a companion is present
- `ZONE_VARIANTS` entries can carry an `fx` key (element type) for completion burst

### Backgrounds (`src/engine/backgrounds.js`)
- `Backgrounds.registerSlot(key, generator)` — custom per-zone ambient generators can be registered
- Fallback canvas generators already exist per zone; ambient particles overlay on top

---

## Version Verification Notes

| Dependency | Version in Codebase | Verified Current? | Source | Confidence |
|------------|-------------------|-------------------|--------|------------|
| Firebase JavaScript SDK | `12.18.0` (in `index.html` line 234-235) | YES — v12.x is the latest major line; v12.0.0 breaking changes documented | Context7 `/firebase/firebase-js-sdk` CHANGELOG | HIGH |
| Canvas 2D API | Native browser API | N/A (web standard) | MDN / WHATWG | HIGH |
| Web Audio API | Native browser API | N/A (web standard) | MDN / WHATWG | HIGH |
| localStorage | Native browser API | N/A (web standard) | MDN / WHATWG | HIGH |
| PWA (service worker + manifest) | `sw.js`, `manifest.json` | N/A (web standard) | W3C | HIGH |

**No external library versions need to be added** — all v12.0 additions are internal JavaScript. The only pinned external version (Firebase 12.x) is confirmed current and is optional/auth-only, not part of the game FX stack.

---

## Installation

No `npm install` or `package.json` changes. Add new `.js` source files under `src/engine/` or `src/data/`, then add `<script src="...">` tags to `index.html` in the correct dependency group (engine before data before systems before ui before scenes).

Example ordering for new renderer additions:
```html
<!-- engine group: after renderer.js, before backgrounds.js -->
<script src="src/engine/renderer.js"></script>
<script src="src/engine/particles.js"></script>   <!-- new: particle variety -->
<script src="src/engine/screenShake.js"></script>  <!-- new: shake enhancement (or inline in renderer.js) -->
<script src="src/engine/backgrounds.js"></script>
```

Or, following the project's convention of keeping renderer primitives in `renderer.js`, additions can be appended to that file directly (no new `<script>` tag needed).

---

## Sources

- `PROJECT.md` — v12.0 milestone scope, constraints, target features
- `src/engine/renderer.js` — `R` namespace: `R.colors.elements`, `R.damageNumber`, `R.elementBurst`, `R.screenShake`, `R.spring`, `R.springConfigs`, `createCircularBuffer`, `R.deathBurst`, `R.clickFx`, `R.projectiles`
- `src/systems/combatFx.js` — `CombatFX` wrapper delegating to `R.elementBurst`
- `src/scenes/combatScene.js` — combat FX wiring (damage numbers, bursts, screen shake on hits)
- `src/data/zones.js` — `ZONES` table (6 zones, no new IDs per constraint)
- `src/data/zone_variants.js` — `ZONE_VARIANTS` bond-gated encounter variants within existing zones
- `src/systems/living_zones.js` — `LivingZones` companion-reactive zone resolution
- `src/engine/backgrounds.js` — `Backgrounds` system with fallback canvas generators per zone
- `src/engine/game.js` — `gLoopFrame` calling `R.updateEffects`/`R.renderEffects`, shake translation
- `tests/damage_fx.test.js` — VM sandbox test pattern for renderer FX
- Context7 `/firebase/firebase-js-sdk` — Firebase JS SDK v12.x confirmed current (v12.0.0 changelog)