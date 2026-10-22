# Project Research Summary — Mythika v12.0

**Project:** Mythika: Echoes of the Divine  
**Domain:** Mobile-first cultivation RPG, vanilla JS + Canvas 2D + localStorage + PWA  
**Researched:** 2026-10-22  
**Milestone:** v12.0 — Visual Polish & Combat FX  
**Confidence:** HIGH  

## Executive Summary

Mythika v12.0 is a visual-polish milestone for an existing vanilla-JS Canvas 2D RPG. Experts build it by extending the v10.0 renderer foundations (`R` namespace, spring configs, `UI.Component` factory) and v11.0 combat FX (`R.damageNumber` spring floaters, `R.elementBurst` 60-slot circular buffer). All v12.0 additions are internal to the existing stack — zero external libraries, no bundler, no WebGL, no ES-module migration, no backend — following the established circular-buffer + `R.reducedMotion()` gating pattern. The recommended approach is a dependency-ordered build: renderer primitives first, then combat FX hit sites, then zone content data, then milestone FX, then HUD alignment verification.

Key risks: per-frame particle allocation breaking the zero-allocation contract, reduced-motion bypass on new shake/FX, screen shake translating the HUD, element-type proliferation beyond the six-token `R.colors.elements` map, zone state added without extending `SaveSystem.migrate()`, and desynchronized `R.damageNumber`/`R.elementBurst` wiring. Every one is preventable by reusing existing patterns rather than inventing new ones.

---

## Key Findings

### Recommended Stack

All v12.0 stack work is internal JavaScript — no `npm install`, no new `<script>` tags beyond possibly appending to `index.html` engine group, no build-step changes.

**Core technologies (all existing, reused):**

| Technology | Purpose | Why recommended |
|---|---|---|
| `R.spring` + `R.springConfigs` registry | Spring-driven particle motion, bounce floaters, shake decay profiles | Centralized, named, versioned; already in `renderer.js:232-275` |
| `createCircularBuffer(maxSize)` | All particle arrays (damage numbers, bursts, click FX, death bursts) | Zero per-frame allocation; established v10/v11 pattern |
| `R.colors.elements` token map | fire/ice/lightning/dark/holy/default primary/secondary pairs | No new element types needed; reuse for all FX tinting |
| `R.reducedMotion()` + `R.reducedMotion.watch` | Accessibility gate on all animation | Null-safe, works in Node tests and browsers |
| `R.screenShake` (basic) | Canvas translate applied in `gLoopFrame` | Existing shake state (`shakeX`, `shakeY`, `shakeTimer`, `shakeIntensity`) — enhance, don't replace |
| `R.damageNumber` + `R.elementBurst` | v11.0 floater + burst systems | Extend with variants; don't rewrite |
| `CombatFX` wrapper | `spawn`/`update`/`render` delegates to `R.elementBurst` | Already wired into combatScene update/render |

**Stack additions (internal only):**

- `R.elementBurst` shape variants (arc, circle, line, spark) for element-specific burst visuals
- `R.ambientParticles` per-zone emitter for zone environmental FX
- `R.damageNumber` variants (heal bounce, crit rotate/scale overshoot, element glyph chips)
- `R.comboParticles` gold burst on `R.triggerComboFlash`
- `R.screenShake` directional bias + exponential decay + per-axis control
- `R.shakeDecay` config in `R.springConfigs`
- Combat FX integration: heal floaters + bursts, buff/debuff application FX, block/parry/counter FX, element-tinted death bursts, projectile impact bursts
- Zone content data: landmarks, zone background variants, zone variant encounter FX

**What must NOT be added:** frontend frameworks, bundlers, ES modules, backend/cloud sync, WebGL, new element types, new zone IDs, per-frame object allocation, parallel state stores, unbounded particle counts.

### Expected Features

**Table stakes (must ship for v12.0 to feel complete):**

- Particle variety on combat FX — `R.elementBurst` spawns visually distinct particles per element type (fire embers, ice shards, lightning bolts, dark orbs, holy sparkles), all gated on `R.reducedMotion()`
- Screen shake intensity/duration/decay — higher intensity = wider jitter + longer duration; crit hits shake harder; reduced motion suppresses shake
- Expanded combat FX integration — every damage event triggers element-aware floater + burst + shake; dual cast, counter, heal floaters covered at existing hit sites
- HUD screen/scene alignment verification — all unaffected scenes keep correct HUD alignment at 400×720, 540×900, 720×400, 1024×768, 1440×900

**Should have (differentiators):**

- Element-specific particle behaviors (arcs/trails/forks/pulses per element) within the 60-slot buffer
- Crit-emphasis burst variation (more particles, larger size, longer life, gold emphasis ring)
- Realm/zone landmarks within existing zones (no new zone IDs)
- Narrative echoes with companion witness
- Death burst element variety

**Defer to v2+:**

- Companion-gated encounter echoes (cheap data; do after core FX is solid)
- Death burst element variety (minor visual payoff; can ride on existing `deathBurst`)
- New landmarks beyond 1-2 per zone

### Architecture Approach

The architecture is additive with zero breaking changes. All v12.0 features flow through 5 existing integration points.

**Major components:**

1. `src/engine/renderer.js` — `R` namespace core FX primitives (`damageNumber`, `elementBurst`, `screenShake`, `deathBurst`, `colors.elements`, `reducedMotion`, `springConfigs`)
2. `src/engine/game.js` — rAF loop, `G.ctx.translate(R.shakeX, R.shakeY)` at line 459, `R.updateEffects`/`R.renderEffects` call sites
3. `src/scenes/combatScene.js` — hit sites wired to `R.damageNumber` + `R.elementBurst` + `R.screenShake`; ailment→element mapping
4. `src/systems/combatFx.js` — thin delegate to `R.elementBurst`; spawn/update/render pass-through
5. `src/data/` (zones, landmarks, narrative_echoes, zone_variants) — declarative zone content within existing 6 zone IDs

**Key patterns:** circular buffers with slot reuse, `R.reducedMotion()` gating, shake scoped to `game.js` lines 459–462 (HUD/Notify/Fade render after `ctx.restore()`), FX never mutating gameplay state, all persistence through `src/systems/save.js`.

### Critical Pitfalls

| Pitfall | Prevention strategy |
|---|---|
| **Per-frame allocation from new particle systems** — `push()` fresh objects in `update()`/`render()` breaks the zero-allocation contract | All new particle systems use `createCircularBuffer(maxSize)` or pre-allocated slot arrays; allocate state once at spawn, step in place |
| **Reduced-motion bypass** — new shake/FX omitting `R.reducedMotion()` check | Every new shake/FX entry point calls `R.reducedMotion()` first; prefer reusing `R.screenShake()` which already gates |
| **Screen shake translating HUD / affecting unaffected screens** — `ctx.translate` inside `UI.HUD()` or non-combat scenes | Keep shake scoped to `game.js` lines 459–462 only; HUD/Notify/Fade render after `ctx.restore()` |
| **Element type proliferation** — adding keys to `R.colors.elements` | Reuse the existing 6 tokens; vary particle count/speed/life instead |
| **WebGL temptation** — switching particle rendering to WebGL | Reject at design; stay Canvas 2D; increase buffer caps instead |
| **Zone state without save-migration extension** — new `G.state.world`/`G.state.flags` fields without `SaveSystem.migrate()` heal blocks | Every new persistent field gets a `normalize()` block in `SaveSystem.migrate()`; default to safe empty values |
| **`R.damageNumber`/`R.elementBurst` desynchronization** — calling only one, or at different coords/timing | Single FX helper spawning both at same coordinates with same element key and crit flag |

---

## Implications for Roadmap

The research strongly supports a 5-phase build order with strict dependencies. Phase 1 is foundational and enables everything else; Phase 3 (zone content data) can run in parallel with Phases 1–2.

### Phase 1: Renderer Primitives (Foundation)
**Rationale:** No dependencies; enables every other phase. Provides shake presets, burst shapes/patterns, and damage floater trails/sparks.
**Delivers:** `R.shakePresets` (subtle/strong), `R.elementBurst` shape/pattern fields + ring/cone/star drawing, `R.damageNumber` trail/spark opts, extended `R.updateElementBursts`/`R.renderElementBursts`/`R.renderEffects`
**Addresses:** Particle variety table stake; screen shake decay table stake
**Avoids:** Per-frame allocation (Pitfall 1.1), WebGL temptation (Pitfall 1.5), reduced-motion bypass (Pitfall 1.2)

### Phase 2: Combat FX Integration (Hit Sites)
**Rationale:** Depends on Phase 1 primitives. Wires new FX into existing combat hit sites (player attack, enemy reaction, signature combo, beast skills).
**Delivers:** New/extended hit sites in `combatScene.js` with floater + burst + shake at same coordinates; heal floaters; combo emphasis bursts
**Uses:** `R.screenShake`, `R.damageNumber`, `R.elementBurst`, `CombatFX` from STACK.md
**Implements:** CombatScene hit-site integration point from ARCHITECTURE.md
**Avoids:** Damage number/burst desynchronization (Pitfall 2.1), element-type proliferation (Pitfall 1.4)
**Research flag:** Verify `setTimeout` runId guards prevent FX after scene transition — extend existing pattern to new hit sites.

### Phase 3: Zone Content Data (Data-Only)
**Rationale:** Data-only; can run in parallel with Phases 1–2. No new zone IDs per constraint — deepens existing zones.
**Delivers:** New `lz_` variants across existing zones (dandaka, patala, meru), new landmark definitions, zone background variant data
**Implements:** zone_variants.js, landmarks, MapLayout integration points from ARCHITECTURE.md
**Avoids:** New zone IDs, zone-system runtime mutation (Pitfall 2.2)
**Research flag: None — well-documented declarative data pattern; skip deeper research.**

### Phase 4: Zone Milestone FX (Integration)
**Rationale:** Depends on Phase 1 (shake presets, element burst). Triggers combat FX on zone completion and landmark discovery.
**Delivers:** `ZoneRewardSystem._commitTo` completion FX (`screenShake(strong)` + `elementBurst` celebration), `Landmarks.tryDiscover` discovery FX (`screenShake(subtle)` + small burst)
**Uses:** `R.shakePresets`, `R.elementBurst` from Phase 1
**Avoids:** Zone state without save-migration extension (Pitfall 1.6), save migration version/order issues (Pitfall 2.3)
**Research flag:** Verify `R.screenShake`/`R.elementBurst` are mocked in zone_rewards tests to avoid renderer dependency.

### Phase 5: HUD Alignment Verification (Regression Gate)
**Rationale:** Validates no regressions after all FX changes. Depends on all prior phases being complete.
**Delivers:** Audit of all scenes for HUD alignment at 400×720, 540×900, 720×400, 1024×768, 1440×900; `Scene.toastLane()` alignment check; layout harness tests
**Addresses:** HUD screen/scene alignment verification table stake
**Avoids:** HUD layout drift (Pitfall 2.4), screen shake translating HUD (Pitfall 1.3)
**Research flag:** All ~27 scenes must be checked; combatScene and travelMap most likely to regress from FX changes.

### Phase Ordering Rationale

- Phase 1 has zero dependencies and its outputs (shake presets, burst shapes, floater variants) are consumed by Phases 2 and 4.
- Phase 2 depends on Phase 1 primitives and must precede Phase 4 (milestone FX reuses combat FX patterns).
- Phase 3 is data-only and can proceed in parallel with Phases 1–2; it only needs Phase 1 if variants trigger FX at completion.
- Phase 4 depends on Phase 1 (shake presets + element burst must exist first).
- Phase 5 is the final regression gate and depends on everything else being done.

### Research Flags

**Phases likely needing deeper research during planning:**
- Phase 2 — complex integration across multiple hit sites; verify runId guards and defensive `typeof R.elementBurst === 'function'` gating at each new call site
- Phase 4 — test mocking strategy for `R.screenShake`/`R.elementBurst` in zone_rewards tests needs confirmation

**Phases with standard patterns (skip research-phase):**
- Phase 1 — well-documented circular buffer + spring patterns from v10/v11; skip deeper research
- Phase 3 — declarative data pattern from v4.0; skip deeper research
- Phase 5 — established verification tools (`verify_matrix.py`, `check_ui_invariants.sh`); skip deeper research

---

## Integration Points

Where v12.0 connects to existing systems:

| System | File | Role in v12.0 | Integration detail |
|---|---|---|---|
| Game loop | `src/engine/game.js` | rAF loop, shake application, effect updates | `R.updateEffects(G.dt)` + `R.renderEffects(G.ctx)`; `G.ctx.translate(R.shakeX, R.shakeY)` at line 459; shake already excludes HUD/Notify/Fade via `ctx.restore()` |
| Renderer | `src/engine/renderer.js` | Core `R` FX primitives | Extend `R.elementBurst` (shape/pattern), `R.damageNumber` (trail/spark), `R.screenShake` (directional/decay), add `R.shakePresets`, `R.comboParticles`, `R.ambientParticles` |
| Combat scene | `src/scenes/combatScene.js` | Hit sites wired to FX | Player attack (~664-671), enemy counter (~593-599), add signature combo impact, beast skill hits, ally heal floaters; all via `R.damageNumber` + `R.elementBurst` + `R.screenShake` |
| Combat system | `src/systems/combat.js` | Status/attack logic | `Combat.applyBuff`/`Combat.applyAilment` — hook FX spawn on status application; `Combat.performAttack` — hook impact burst on hit |
| Combat FX wrapper | `src/systems/combatFx.js` | Delegate to `R.elementBurst` | `spawn`/`update`/`render` pass-through; consider single FX helper spawning floater + burst together |
| Zones | `src/data/zones.js` | 6 existing zone IDs | Read-only metadata; no new zone IDs; landmarks/variants deepen existing zones |
| Zone variants | `src/data/zone_variants.js` | Companion-gated `lz_` variants | Add new variants; optional `fx` key for completion burst |
| Landmarks | `src/data/landmarks.js` + `src/systems/landmarks.js` | Zone landmark discovery | Add landmark definitions; `tryDiscover` can trigger subtle shake + small burst |
| Narrative echoes | `src/data/narrative_echoes.js` + `src/systems/narrative_echoes.js` | Echo markers on travel map | New echo entries mapping encounter flags to region markers; `LivingZones.echoWitness` companion string |
| Living zones | `src/systems/living_zones.js` | Companion-reactive zone depth | `resolveFor`/`teaseFor` can trigger zone-appropriate ambient FX when companion present |
| Zone rewards | `src/systems/zone_rewards.js` | Percentage + completion rewards | `_commitTo` milestone FX callbacks on completion claim |
| Backgrounds | `src/engine/backgrounds.js` | Zone/combat background slots | `registerSlot` for custom per-zone ambient generators; ambient particles overlay fallback canvas |
| Save system | `src/systems/save.js` | Persistence/migration | All new persistent zone/landmark state flows through `G.state.zoneProgress`/`G.state.flags`/`G.state.encounters`; extend `migrate()` heal blocks; `version: 1` kept for additive changes |
| PWA / Firebase | `index.html`, `sw.js`, `manifest.json` | Optional auth, offline default | Firebase v12.18.0 pinned, gated behind `?probe`, auth-only, does not block offline play |

---

## Confidence Assessment

| Area | Confidence | Notes |
|---|---|---|
| Stack | HIGH | All existing systems verified against source code (renderer.js, combatScene.js, zone_variants.js, save.js); no external library versions to add |
| Features | HIGH | v12.0 target features map cleanly to existing integration points; MVP prioritization documented |
| Architecture | HIGH | Codemaps (root, scenes, systems, UI, engine) all read and consistent; zero breaking changes required |
| Pitfalls | HIGH | All pitfalls verified against source; prevention strategies are direct applications of existing patterns |

**Overall confidence:** HIGH

### Gaps to Address

| Gap | How to handle during planning/execution |
|---|---|
| `setTimeout` runId guard verification for new hit sites | Add to Phase 2 research flag; extend existing pattern from combatScene.js |
| Test mocking strategy for `R.screenShake`/`R.elementBurst` in zone_rewards tests | Confirm mock approach in Phase 4 planning |
| Exact `lz_` variant count and landmark descriptions per zone | Data authoring in Phase 3; complexity is mythological authoring, not code |
| Frame-time profiling of new particle drawing | Use `?probe` before shipping; all new `ctx` calls are within existing loops |

---

## Sources

### Primary (HIGH confidence)

- `src/engine/renderer.js` — `R.colors.elements`, `R.damageNumber`, `R.elementBurst`, `R.screenShake`, `R.spring`, `R.springConfigs`, `createCircularBuffer`, `R.deathBurst`, `R.clickFx`, `R.projectiles`, `R.reducedMotion()`
- `src/scenes/combatScene.js` — combat FX hit sites, screen shake calls, ailment→element mapping
- `src/engine/game.js` — screen shake translate application, effect update/render call sites
- `src/systems/combatFx.js` — CombatFX delegate to `R.elementBurst`
- `src/systems/save.js` — `SaveSystem.migrate()` heal chain, `version: 1`, `WorldState.normalize()`/`ZoneRewardSystem.normalize()` calls
- `src/data/zones.js`, `src/data/landmarks.js`, `src/data/narrative_echoes.js`, `src/data/zone_variants.js` — zone content foundation
- `src/systems/landmarks.js`, `src/systems/living_zones.js`, `src/systems/narrative_echoes.js`, `src/systems/zone_rewards.js` — zone content systems
- `.planning/PROJECT.md` — v12.0 constraints (no new element types, no WebGL, no new zones, respect `R.reducedMotion()`, vanilla JS immediate-mode Canvas, save-compatible)
- `.planning/v11.0-MILESTONE-AUDIT.md` — v11.0 requirements and phase chain

### Secondary (MEDIUM confidence)

- `tests/damage_fx.test.js`, `tests/damage_burst.test.js` — existing FX test patterns to extend
- Context7 `/firebase/firebase-js-sdk` — Firebase JS SDK v12.x confirmed current (optional, auth-only)
- `.planning/research/PITFALLS.md` — pitfall findings verified against source

### Tertiary (LOW confidence)

- None identified — all research verified against source code at HIGH confidence

---
*Research completed: 2026-10-22*
*Ready for roadmap: yes*
