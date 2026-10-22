# Feature Landscape: v12.0 Visual Polish & Combat FX

**Domain:** Canvas-based mobile-first cultivation RPG (Mythika: Echoes of the Divine)
**Researched:** 2026-10-22
**Confidence:** HIGH (codebase read directly: renderer.js, combatScene.js, zones.js, landmarks.js, narrative_echoes.js, zone_variants.js, living_zones.js)

## Executive Summary

v12.0 builds on v10.0 (shared UI/renderer foundations) and v11.0 (spring-driven damage floaters + element bursts). The existing renderer already provides `R.screenShake`, `R.damageNumber` (element-aware, crit, heal), `R.elementBurst` (60-slot circular buffer), `R.colors.elements` tokens (fire/ice/lightning/dark/holy/default), and `R.reducedMotion()` gating. CombatScene is already wired to hit sites for both player→enemy and enemy→hero damage. Zone content infrastructure (landmarks, narrative echoes, companion-gated variants) exists from v4.0 within six existing zone IDs. v12.0 must expand particle variety, deepen screen shake, broaden combat FX integration, and add realm/zone content — all within existing zone IDs, no new element types, no WebGL, zero per-frame allocation.

---

## 1. Feature Categories

### Table Stakes (must ship for v12.0 to feel complete)

| Feature | Expected behavior (user-centric, testable) | Complexity | Dependencies |
|---------|--------------------------------------------|------------|--------------|
| **Particle variety on combat FX** | `R.elementBurst` spawns visually distinct particles per element type (fire: trailing embers, ice: crystalline shards, lightning: jagged bolts, dark: pulsing orbs, holy: golden sparkles). Each particle type has distinct lifespan, size, color tint, and motion arc. Element-aware tint from `R.colors.elements`. Crit bursts visibly larger/longer than normal. Reduced motion → no particles (existing behavior preserved). | Med | `R.elementBurst` (60-slot circular buffer), `R.colors.elements`, `R.reducedMotion()`, `R.updateElementBursts`/`R.renderElementBursts` |
| **Screen shake intensity/duration/decay** | `R.screenShake(intensity, duration)` applies a canvas translate decay that ramps down over duration. High intensity = wider jitter + longer duration. Crit hits shake harder/longer than normal hits. Reduced motion → shake suppressed (damage numbers/log still show). Shake decays smoothly, not abruptly. | Low-Med | `R.screenShake` (exists), `R.shakeX/Y/timer/intensity` (exists), `game.js` line 459 `G.ctx.translate(R.shakeX, R.shakeY)` |
| **Expanded combat FX integration** | Every damage event in combat triggers element-aware floater + burst + shake. Crit emphasis: gold ring, larger scale, longer life. Heal events show green `+` prefix floater. Integration points already exist in combatScene.js (lines 597-598, 602, 668-669, 682). All FX respect `R.reducedMotion()`. | Med | `R.damageNumber`, `R.elementBurst`, `R.screenShake`, combatScene.js hit sites, `Combat.performAttack` ailment→element mapping |
| **HUD screen/scene alignment verification** | All screens/scenes NOT being adjusted in v12.0 keep correct HUD alignment, safe-area anchors, and button-toast-lane clearance at 390×844, 844×390, 400×720, 540×900, 720×400, 1024×768, 1440×900. No regression from FX additions. | Med | `R.Backgrounds`, `Scene.responsive` landscape rects, `Notify` toast lane, `UI.Modal` |

### Differentiators (polish that sets v12.0 apart)

| Feature | Value proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Element-specific particle behaviors** | Fire particles arc upward with ember trails; ice particles shatter outward; lightning forks jagged; dark pulses slowly; holy sparkles radially. Makes each element feel distinct beyond color alone. | Med-High | Requires per-element update/render logic in `R.elementBurst` or new particle-type enum; must stay within 60-slot circular buffer (zero allocation) |
| **Crit-emphasis burst variation** | Crit bursts spawn more particles (already 10 vs 6), larger size, longer life, gold emphasis ring on floater. Distinguishes crit hits visually from normal hits at a glance. | Low | Already partially implemented; extend size/life/color variance |
| **Realm/zone landmarks within existing zones** | New landmarks added to `LANDMARKS` data within existing zone IDs (no new zones). Each has icon, description, discovery condition (zonePercentage/zoneComplete/flag), optional action. Surfaces on travel map when discovered. | Low | `src/data/landmarks.js`, `src/systems/landmarks.js`, `WorldState.recordLandmarkDiscovery` |
| **Narrative echoes with companion witness** | New echo entries in `NARRATIVE_ECHOES` mapping encounter flags to region markers. Echo markers render on travel map with `markerColor`. Oath-bound companion witness string appended (from `LivingZones.echoWitness`). No new zone IDs. | Low | `src/data/narrative_echoes.js`, `src/systems/narrative_echoes.js`, `LivingZones.echoWitness` |
| **Companion-gated encounter echoes** | Echo markers that only appear when a specific hero/beast bond threshold is met in a zone. Reinforces that the companion "was here." | Low | `LivingZones.companionFor`, `bondReq`, existing encounter flags |
| **Death burst element variety** | `R.deathBurst` renders expanding ring + outward sparks tinted by the killing element (fire=orange, ice=blue, etc.) instead of always red. | Low | `R.deathBursts` (exists), `R.colors.elements` |

### Anti-Features (explicitly avoid per v12.0 constraints)

| Anti-Feature | Why avoid | Instead |
|--------------|-----------|---------|
| **New element types** | Explicitly forbidden by v12.0 constraints ("No new element types"). Would require new `R.colors.elements` tokens, ailment mapping, and FX logic across all hit sites. | Reuse existing 6 elements (fire, ice, lightning, dark, holy, default) with per-element particle behavior variance |
| **WebGL / Canvas context migration** | Explicitly forbidden ("no WebGL"). Would break the immediate-mode Canvas 2D contract, all `R.*` primitives, and the zero-allocation particle buffers. | Stay in Canvas 2D immediate mode; expand particle variety via `R.rect`/`ctx.arc` per element type |
| **New zones or realms** | Explicitly forbidden ("no new geography"). Would require new `ZONES` entries, zone access gates, progression, rewards, and travel-map integration. | Add landmarks/encounters/echoes within existing 6 zone IDs |
| **Unbounded per-frame particle allocation** | Violates the v10.0/v11.0 zero-per-frame-allocation constraint. Would cause GC spikes on mid-range phones during sustained combat. | Keep circular buffers (`R.elementBurstSlots` 60 slots, `R.damageNumbers` 50 slot, `R.clickFx` 16 slots); never `push()` unbounded in hot paths |
| **Screen shake without reduced-motion gate** | Violates accessibility constraint ("Respect R.reducedMotion()"). Would trigger vestibular discomfort for affected players. | Gate all shake behind `R.reducedMotion()` check (existing `R.screenShake` already does this) |
| **FX that mutate gameplay state** | Render-time code must never mutate `G.state` or trigger rewards. Would break "authoritative gameplay systems remain mutation owners" and exactly-once behavior. | FX are presentation-only; rewards flow through `Combat`, `Economy`, `Progression` canonical systems |
| **Parallel save/state stores** | Violates save-compatibility constraint ("Preserve unrelated save state"; "no parallel stores"). | Any new persistence flows through `src/systems/save.js` migrations; landmarks/echoes use existing `WorldState` branches |

---

## 2. Feature Dependencies

```
R.colors.elements (element tokens)
  └─→ R.elementBurst per-element particle behavior
  └─→ R.damageNumber element tint + icon chip
  └─→ R.deathBurst element-colored ring

R.screenShake (intensity, duration, decay)
  └─→ combatScene.js hit sites (crit vs normal intensity/duration)
  └─→ game.js line 459 G.ctx.translate(R.shakeX, R.shakeY)

R.damageNumber + R.elementBurst (existing combat FX)
  └─→ combatScene.js player→enemy + enemy→hero hit sites (already wired)
  └─→ ailment→element mapping (agni→fire, shila→ice, vayu→lightning, vajra→lightning, default→dark)

Landmarks (LANDMARKS data + Landmarks system)
  └─→ WorldState.recordLandmarkDiscovery
  └─→ travelMap.js rendering (Landmarks.getAll)

Narrative Echoes (NARRATIVE_ECHOES data + NarrativeEchoes system)
  └─→ LivingZones.echoWitness (companion witness string)
  └─→ MapHelpers.getNarrativeEchoes (travelMap rendering)

All FX → R.reducedMotion() gate
All save → src/systems/save.js migration (no parallel stores)
```

---

## 3. Complexity Notes Per Feature

### Particle variety (Med-High)
The existing `R.elementBurst` spawns uniform square particles (`R.rect`) colored by element primary/secondary. To get per-element *behavior* variety (arcs, trails, forks, pulses), the update/render loop needs per-element logic. Options ranked:

1. **Recommended:** Add a per-element particle "style" property to each burst slot (e.g. `style: 'ember' | 'shard' | 'bolt' | 'orb' | 'sparkle'`), derived from element. In `R.updateElementBursts`, apply element-specific motion (gravity for embers, oscillation for shards, etc.). In `R.renderElementBursts`, draw different shapes per style (arc vs rect vs line). Stays within 60-slot buffer, zero allocation.
2. **Acceptable:** Keep uniform particles but vary size/speed/life/color per element in spawn params. Less visual distinctiveness, lower code change.
3. **Not recommended:** Separate particle arrays per element. Breaks the single 60-slot circular buffer pattern and risks unbounded memory if not carefully bounded.

### Screen shake (Low-Med)
`R.screenShake` already exists and is applied at 3 combat hit sites. v12.0 expansion: tune intensity/duration pairs per hit type (normal hit 3/0.15, crit 8/0.4, dodge/miss 6/0.3 already present). Add exponential decay so shake ramps down smoothly (`R.shakeTimer / 0.3` linear decay already exists; could ease it). No new architecture needed — tune constants and add reduced-motion verification test.

### Expanded combat FX integration (Med)
CombatScene is already wired at 4 hit sites (lines 597-598, 602, 668-669, 682). v12.0 should ensure:
- All damage paths (including dual cast follow-up at line 675-681, counter at line 585-588) trigger floater + burst + shake.
- Heal path (line 637-647) shows green `+` floater via `R.damageNumber` with `{heal: true}`.
- Signature combos trigger a distinct burst (larger, longer) to emphasize the duo-skill payoff.
- Each addition gated by `typeof R.elementBurst === 'function'` (defensive, matches existing pattern).

### HUD alignment verification (Med)
Not a code feature per se — a verification gate. All 7 responsive viewports must be checked for scenes not being adjusted. The `verify_matrix.py` browser boot matrix and `tools/check_ui_invariants.sh` are the validation tools. Risk: adding FX particles that overflow logical bounds or shift HUD anchors. Mitigation: keep FX within combat layout bands; test all 7 sizes.

### Landmarks / echoes within existing zones (Low)
Pure data addition to `src/data/landmarks.js` and `src/data/narrative_echoes.js`. No new zone IDs. Discovery conditions reuse existing types (`zonePercentage`, `zoneComplete`, `flag`). Rendering already exists via `Landmarks.getAll` and `MapHelpers.getNarrativeEchoes` in travelMap.js. Complexity is in authoring mythologically-respectful descriptions, not code.

---

## 4. Dependencies on Existing Systems

| System | Role in v12.0 | Already exists? |
|--------|---------------|-----------------|
| `src/engine/renderer.js` (`R`) | Core FX primitives: damageNumber, elementBurst, screenShake, deathBurst, colors.elements, reducedMotion, springConfigs | ✅ Yes (v10/v11) |
| `src/engine/game.js` | rAF loop, `G.ctx.translate(R.shakeX, R.shakeY)` at line 459, `R.updateEffects`/`R.renderEffects` call sites | ✅ Yes |
| `src/scenes/combatScene.js` | Hit sites wired to R.damageNumber + R.elementBurst + R.screenShake; ailment→element mapping | ✅ Yes (partial — needs dual cast/counter/heal coverage) |
| `src/systems/combatFx.js` | Thin delegate to R.elementBurst; spawn/update/render pass-through | ✅ Yes |
| `src/data/zones.js` | 6 existing zone IDs (aryavarta, dandaka, meru, patala, svarga, tapobhumi) — no new zones | ✅ Yes |
| `src/data/landmarks.js` | LANDMARKS data + ZONE_LANDMARKS index + LandmarkDefs.getByZone | ✅ Yes |
| `src/data/narrative_echoes.js` | NARRATIVE_ECHOES array mapping flags → region markers with colors | ✅ Yes |
| `src/data/encounters.js` | ENCOUNTERS registry with flags, affinity, rewards | ✅ Yes |
| `src/data/zone_variants.js` | Companion-gated encounter variants (lz_*) registered into ENCOUNTERS | ✅ Yes |
| `src/systems/landmarks.js` | Landmark discovery checks, persistence via WorldState | ✅ Yes |
| `src/systems/living_zones.js` | Companion resolution, echo witness, variant tease | ✅ Yes |
| `src/systems/narrative_echoes.js` | NarrativeEchoes.getForRegion/getActive with companion witness | ✅ Yes |
| `src/scenes/map_helpers.js` | MapHelpers.getNarrativeEchoes/getNarrativeEchoColor for travel map rendering | ✅ Yes |
| `src/scenes/travelMap.js` | Renders landmarks + echoes on zone entry | ✅ Yes |
| `src/systems/save.js` | Save persistence/migration — any new landmark/echo state must flow here | ✅ Yes |

---

## 5. MVP Recommendation

**Prioritize (table stakes first):**
1. Particle variety on `R.elementBurst` (per-element motion + shape styles within 60-slot buffer)
2. Screen shake tuning (intensity/duration pairs per hit type, decay verification, reduced-motion gate test)
3. Expanded combat FX integration (dual cast, counter, heal floater, combo emphasis at existing hit sites)
4. HUD alignment verification across all 7 viewports (regression gate for unaffected screens)

**Defer:**
- Companion-gated encounter echoes (cheap data, do after core FX is solid)
- Death burst element variety (minor visual payoff; can ride on existing deathBurst)
- New landmarks beyond 1-2 per zone (data authoring; no code change needed)

**Sources:**
- `src/engine/renderer.js` — R.screenShake, R.damageNumber, R.elementBurst, R.colors.elements, R.reducedMotion, circular buffer pattern (HIGH — read directly)
- `src/scenes/combatScene.js` — combat FX hit sites, screen shake calls, ailment→element mapping (HIGH — read directly)
- `src/engine/game.js` — screen shake translate application, effect update/render call sites (HIGH — read directly)
- `src/data/zones.js`, `src/data/landmarks.js`, `src/data/narrative_echoes.js`, `src/data/zone_variants.js` — zone content foundation (HIGH — read directly)
- `src/systems/landmarks.js`, `src/systems/living_zones.js`, `src/systems/narrative_echoes.js`, `src/scenes/map_helpers.js` — zone content systems (HIGH — read directly)
- `.planning/PROJECT.md` — v12.0 constraints: no new element types, no WebGL, no new zones, respect R.reducedMotion(), vanilla JS immediate-mode Canvas (HIGH — project source)
- `.planning/research/PITFALLS.md` — unbounded effects, debug leakage, gameplay-flow-breaks pitfalls relevant to FX (MEDIUM-HIGH — repository source)
- `tests/damage_fx.test.js`, `tests/damage_burst.test.js` — existing FX test patterns (HIGH — read directly)
- `.planning/v11.0-MILESTONE-AUDIT.md` — v11.0 DMG-01..10 requirements and phase chain 54→55→56 (HIGH — audit record)
