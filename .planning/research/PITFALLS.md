# Domain Pitfalls — v12.0 Visual Polish & Combat FX

**Domain:** Mythika RPG — adding particle variety, screen shake, combat FX, and zone content to an existing vanilla-JS / Canvas 2D / localStorage / PWA game.
**Researched:** 2026-10-22
**Confidence:** HIGH — all findings verified against `src/engine/renderer.js`, `src/systems/save.js`, `src/engine/game.js`, `src/systems/combatFx.js`, `src/scenes/combatScene.js`, `src/ui/button.js` (UI.HUD), and `.planning/PROJECT.md`.

---

## Executive Summary

Mythika v12.0 adds visual polish (particle variety, screen shake), expanded combat FX integration, and new realm/zone content on top of the v10.0 (shared UI/renderer foundations) and v11.0 (Combat Damage FX) milestones. The codebase already enforces **zero per-frame object allocation** (pre-allocated circular buffers for damage numbers, death bursts, element bursts, click FX) and gates all animation on `R.reducedMotion()`. Screen shake is applied via a single `G.ctx.translate(R.shakeX, R.shakeY)` in the game loop that covers background + scene content but explicitly excludes HUD, toasts, notify, and fade (they render after `ctx.restore()`). Save migration lives in `SaveSystem.migrate()` and heals per-domain state (inventory, party, affinity, beastBond, combo, gifts, linger) via system-specific `normalize()` functions.

The highest-risk v12.0 mistakes are: (1) allocating particles per frame inside the hot render/update path, breaking the v10/v11 performance contract; (2) bypassing `R.reducedMotion()` on new shake or particle effects, breaking the accessibility contract; (3) adding new zone/landmark state without extending the save migration chain, corrupting existing saves; (4) proliferating new element types beyond the six-token `R.colors.elements` map; (5) reaching for WebGL/Canvas/WebGL for particle rendering; and (6) shifting HUD or unaffected screens during shake/layout changes, causing misalignment.

---

## 1. Pitfalls Specific to v12.0 Features

### Pitfall 1.1 — Per-frame allocation from new particle systems

**What goes wrong:** A new particle variety (e.g., realm-specific ambient embers, combat hit sparks, zone entrance sparkles) implemented by `push()`-ing fresh `{x, y, vx, vy, life, color}` objects into an array every frame inside `update()` or `render()`. The v10.0 codemap (`src/engine/codemap.md` line 77) already flags this pattern: `R.damageNumbers`, `R.deathBursts`, `R.levelUpParticles`, `R.clickFx` use bounded circular buffers, but "push() unbounded in hot paths" is a known memory-leak risk. Adding another unbounded array recreates the GC pressure the v10/v11 foundations were built to eliminate, risking frame drops on mid-range phones (the project's stated performance constraint).

**Why it happens:** Developers reach for the simplest particle implementation (`array.push({...})`) because it reads cleanly, and the existing `createCircularBuffer` helper is not obviously reusable for non-circular use cases.

**Consequences:** GC pauses → dropped frames → jank on mid-range mobile devices; memory growth over long play sessions; eventual OOM on low-end devices. Violates the v10.0 "zero per-frame allocation" constraint and the v11.0 damage-floater precedent.

**Prevention:** All new particle systems must use `createCircularBuffer(maxSize)` or the existing pre-allocated slot pattern (`R.elementBurstSlots = new Array(60)` with a write index), allocating particle state once at spawn and stepping it in place during `update()`. Never `push()` new objects in `update()`/`render()`. If a new particle type needs its own buffer, create it once at module load (like `R.damageNumbers = createCircularBuffer(50)` at line 484) and reuse slots.

**Phase:** Phase 1 (foundations / particle system scaffolding) — before any particle variety is added.

**Warning signs:** `new {` or `{ x, y, ... }` object literals inside any `update(dt)` or `render(ctx)` function; `Array.push` inside a loop over particles; increasing memory in Chrome DevTools Performance tab during extended combat/zone traversal.

---

### Pitfall 1.2 — Reduced-motion bypass in screen shake or FX

**What goes wrong:** A new screen-shake call or particle burst that does not check `R.reducedMotion()` before animating. Existing code gates consistently: `R.screenShake()` (renderer.js:536) returns early if `R.reducedMotion()`; `R.elementBurst()` (line 666) returns early; `R.damageNumber` stores a per-floater `_reduced` flag (line 532) and skips spring bounce when set; `R.deathBurst` (line 548) returns early; `R.validTick` (line 730) returns early. A v12 addition that omits the gate exposes vestibular users to motion they cannot disable, violating the accessibility constraint ("Respect `R.reducedMotion()`") and the established contract.

**Why it happens:** New shake call sites (e.g., in `combatScene.js` or a new zone-transition scene) are added by copying an existing shake call but omitting the `if (R.reducedMotion()) return;` guard, or by implementing a custom shake that manipulates `R.shakeX/Y` directly without consulting `R.screenShake`.

**Consequences:** Accessibility regression; users with motion sensitivity forced to disable motion via OS settings but still affected in-game; potential app-store/review rejection on accessibility grounds.

**Prevention:** Every new shake or animated FX entry point must call `R.reducedMotion()` first and return/no-op when true. Prefer reusing `R.screenShake(intensity, duration)` (which already gates) rather than writing custom shake logic. For per-particle reduced-motion variants, follow the `R.damageNumber` `_reduced` pattern: capture `const reduced = R.reducedMotion()` at spawn, store it on the particle, and skip spring/easing in `update()`.

**Phase:** Phase 2 (screen shake integration) — shake gating must be part of the first shake implementation, not retrofitted.

**Warning signs:** Any `R.shakeX =` / `R.shakeY =` / `R.shakeTimer =` assignment outside `R.screenShake()`; any particle `update()` that modifies position/scale/alpha without first reading a `_reduced` flag; shake triggering on realm transitions or zone entry without a reduced-motion check.

---

### Pitfall 1.3 — Screen shake translating the HUD or affecting unaffected screens

**What goes wrong:** Screen shake is applied in `game.js:459` via `G.ctx.translate(R.shakeX, R.shakeY)`, wrapping `drawBackground()` + `Scene.render()`, then `ctx.restore()` at line 462. HUD (`UI.HUD()`), `Notify`, `Fade`, and `Feedback.toasts` render *after* the restore, so they are intentionally shake-free. A v12 pitfall is moving HUD rendering *inside* the translate block, or applying shake to scenes that should remain stable (title, settings, ashram), causing the HUD to drift relative to scene content or unrelated screens to wobble.

**Why it happens:** A developer sees `R.shakeX/Y` available globally and applies `ctx.translate(R.shakeX, R.shakeY)` at the top of a scene's `render()` or inside `UI.HUD().render()`, double-translating or shaking UI that should be rock-steady.

**Consequences:** HUD misalignment (resource counters drift from their anchors); affected/unaffected screen inconsistency; motion sickness even for users who tolerate shake in combat but not in menus; failed "HUD screen/scene alignment verification for unaffected screens" milestone goal.

**Prevention:** Keep shake scoped to `game.js` line 459–462 (background + current scene only). Never call `ctx.translate(R.shakeX, R.shakeY)` inside `UI.HUD()`, inside a scene's render that is not gameplay/combat, or inside any modal/toast/notify renderer. If a specific non-combat screen needs subtle shake, gate it behind `R.reducedMotion()` and apply it only to that screen's canvas layer, never to the HUD. Verify HUD alignment on all unaffected screens after any shake change (title, settings, ashram, bazaar, forge, farm, party, achievements, quest log, alchemy, trials).

**Phase:** Phase 2 (screen shake) and Phase 5 (HUD alignment verification).

**Warning signs:** HUD text/gold/prana counters appearing to shake; any scene other than combat/zone traversal exhibiting screen shake; `ctx.translate` calls appearing in `src/ui/` or `src/scenes/` files outside combat.

---

### Pitfall 1.4 — Element type proliferation beyond the six-token map

**What goes wrong:** v12.0 adds new combat FX (e.g., a new "void" or "arcane" element burst) by adding a new key to `R.colors.elements` or hard-coding a new color string, rather than reusing the existing six tokens (`fire`, `ice`, `lightning`, `dark`, `holy`, `default`). PROJECT.md explicitly constrains v12: "no new element types." Adding a seventh element breaks the token map, requires updating every element-aware renderer (`R.damageNumber` chip/tint at renderer.js:598–610, `R.elementBurst` color at line 676), and risks inconsistent FX coloring.

**Why it happens:** Design requests a new visual element for a new zone or enemy type; the implementer adds it to `R.colors.elements` thinking it's "just one more key."

**Consequences:** Broken constraint (v12.0 explicitly forbids new element types); inconsistent FX colors across damage floaters, bursts, and crit rings; increased surface area for future bugs; violates "cultural respect for Indian mythology" if new elements are tacked on without lore grounding.

**Prevention:** Reuse the existing six `R.colors.elements` tokens for all v12 FX. If a new zone needs distinct visual flavor, vary particle count/speed/life or use the existing `dark`/`holy` tokens rather than adding a new element key. Any proposal to add an element type must be treated as out-of-scope for v12 and escalated to the roadmap.

**Phase:** Phase 3 (combat FX integration) — enforced at code review.

**Warning signs:** New keys added to `R.colors.elements`; hard-coded color strings (e.g., `'#9b59b6'`) in FX code paths; new element strings passed to `R.damageNumber({element: ...})` or `R.elementBurst(x, y, element, crit)`.

---

### Pitfall 1.5 — WebGL temptation for particle rendering

**What goes wrong:** As particle variety grows, a developer proposes switching particle rendering from Canvas 2D (`R.rect`, `ctx.arc`, `ctx.fillText`) to WebGL for "better performance" or "more particles." PROJECT.md and v10/v11 constraints explicitly forbid WebGL: the project is "immediate-mode Canvas 2D" with "no WebGL." A WebGL renderer would break the global `R` API contract, require a second rendering pipeline, and break PWA/offline assumptions.

**Why it happens:** Particle counts increase (more variety = more particles), and Canvas 2D fill/fillText calls feel slow; WebGL is the obvious answer from general gamedev knowledge.

**Consequences:** Massive architectural breach; two rendering pipelines to maintain; breaks `index.html` script-order/global convention; breaks PWA delivery; invalidates all existing `R.*` renderer assumptions; likely fails the v12 "no WebGL" constraint and requires a full rewrite of the renderer.

**Prevention:** Stay within Canvas 2D. Use the existing bounded circular buffers and slot reuse to keep particle counts manageable (damage numbers cap 50, element bursts cap 60, click FX cap 16, death bursts cap 30). If more on-screen particles are needed, increase buffer caps and use view culling (skip off-screen particles) rather than switching APIs. Do not introduce WebGL under any circumstance for v12.

**Phase:** Phase 1 (foundations) — WebGL must be rejected at the design stage.

**Warning signs:** Any `WebGLRenderingContext`, `getContext('webgl')`, `getContext('experimental-webgl')`, shader code, or buffer/WebGL imports in `src/`; proposals to render particles via anything other than `R.rect`/`ctx.arc`/`ctx.fillText`.

---

### Pitfall 1.6 — Zone content added without save-migration chain extension

**What goes wrong:** New realm/zone content (landmarks, encounters, zone variants within existing zone IDs — v12 permits deepening existing zones, not new zone IDs) adds new fields to `G.state.world` or `G.state.flags` (e.g., `zoneLandmarksVisited`, `realmEchoFlags`, `landmarkBondReferences`) without extending `SaveSystem.migrate()` to heal/normalize those fields. Existing player saves load fine (new fields are `undefined`), but the new code assumes the fields exist and initialized, causing `undefined` property access, silent feature gating failures, or corrupted state on save.

**Why it happens:** Zone content is implemented as data-driven flags in `G.state` without corresponding `normalize()` logic in `SaveSystem.migrate()`, which currently heals inventory, party, affinity, beastBond, combo, gifts, linger, and numeric fields (save.js:42–154).

**Consequences:** Existing saves break or behave inconsistently after v12; new zone content silently unavailable to returning players; `NaN` or `undefined` values propagate into combat/zone logic; violates the persistence constraint ("malformed or legacy state must fail safe").

**Prevention:** Every new persistent zone/realm field added in v12 must get a corresponding heal/normalize block in `SaveSystem.migrate()` following the existing pattern (e.g., `BondSystem.normalizeLinger`, `BondSystem.normalizeCombo`, `BondSystem.normalizeGifts`). New fields should default to safe empty objects/arrays and be validated (finite numbers, non-prototype keys). Follow the existing `createDefaultState()` + migrate chain rather than adding ad-hoc defaults in scenes.

**Phase:** Phase 4 (zone content) — migration blocks must accompany any new persistent zone state.

**Warning signs:** New `G.state.world.*` or `G.state.flags.*` writes with no `migrate()` counterpart; `G.state.world` accessed without checking for `undefined`; existing save files loading with missing zone features; `TypeError: Cannot read property` on zone state during load.

---

## 2. Integration Pitfalls (with Existing Systems)

### Pitfall 2.1 — `R.damageNumber` and `R.elementBurst` wired inconsistently

**What goes wrong:** v11.0 established that combat damage events wire *both* `R.damageNumber(...)` (floater text) and `R.elementBurst(...)` (particles) at the same hit site (combatScene.js:597–598, 668–669), with ailment-derived element keys. A v12 pitfall is adding new combat FX call sites that call only one of the two, or calling them at different coordinates/timing, so the particle burst and damage number desynchronize visually (burst appears where the number isn't, or vice versa).

**Why it happens:** New attack/skill code in `combatScene.js` or a new skill system calls `R.elementBurst` but forgets `R.damageNumber`, or vice versa; or uses different `x,y` for each.

**Consequences:** Inconsistent combat feedback; element tint/burst mismatch; crit floaters without crit burst emphasis (or burst without number); reduced-motion users see numbers but no particles (expected) but the mismatch looks like a bug to all users.

**Prevention:** Create a single combat-FX helper (extend `src/systems/combatFx.js` or add a wrapper) that spawns both the damage floater and element burst at the same coordinates with the same element key and crit flag, and gate the whole call on `R.reducedMotion()` at the helper level. All v12 combat call sites must route through this helper rather than calling `R.damageNumber`/`R.elementBurst` directly.

**Phase:** Phase 3 (combat FX integration).

**Warning signs:** `R.elementBurst(` or `R.damageNumber(` calls in `src/scenes/combatScene.js` not adjacent to each other; different `x,y` arguments between the two; new skill/attack code calling only one.

---

### Pitfall 2.2 — Zone systems (MapLayout / MapHelpers) mutated directly instead of normalized

**What goes wrong:** New zone content (landmarks, encounters, echoes within existing zone IDs) is added by mutating `MapLayout.ENTRIES` or `MapHelpers` data structures at runtime, or by adding new zone IDs to zone-state maps without going through `ZoneRewardSystem.normalize()` / `WorldState.normalize()` (both called in `SaveSystem.migrate()` at save.js:81–88). This breaks save compatibility because `migrate()` resets `G.state.world` via `WorldState.normalize()` and zone data via `ZoneRewardSystem.normalize()`.

**Why it happens:** Developers add zone content directly to `src/data/` zone files or mutate `MapLayout` in scene init, bypassing the normalize chain that existing saves rely on.

**Consequences:** `SaveSystem.migrate()` overwrites or drops custom zone state on load; new landmarks/encounters disappear after reload; exactly-once encounter ledger (an authoritative gameplay system) gets out of sync with zone progress.

**Prevention:** Add new zone content as declarative data entries within existing zone IDs (no new zone IDs), and ensure any per-player zone progress flows through `G.state.world` / `ZoneRewardSystem` with `normalize()` handlers in `SaveSystem.migrate()`. Do not mutate `MapLayout.ENTRIES` at runtime. Follow the v4.0 precedent: "no new zone IDs; deepen existing zones only."

**Phase:** Phase 4 (zone content).

**Warning signs:** Direct mutation of `MapLayout.ENTRIES` or `MapHelpers` objects; new zone IDs appearing in zone-state maps; `G.state.world` writes outside `WorldState.normalize()`; zone progress lost after save/reload.

---

### Pitfall 2.3 — Save migration version not bumped / chain order broken

**What goes wrong:** v12 adds new persistent state but `SaveSystem.save()` writes `version: 1` (unchanged) and `SaveSystem.migrate()` appends new heal blocks at the end without accounting for ordering dependencies (e.g., a new field depends on `affinity` being normalized first, which happens earlier in the chain). Or, `SaveSystem.load()` rejects the save because `data.version !== 1` while the migrate logic assumes version 1.

**Why it happens:** The version field is treated as static; new migrate blocks are appended without considering that `migrate()` runs after `hydrate()` copies raw save state over defaults, so order matters (later blocks can depend on earlier blocks having healed the data).

**Consequences:** New v12 fields lost on load; `migrate()` reads unhealed (raw) values and produces `NaN`/`undefined`; saves created in v12 fail to load in v12 if version logic is inconsistent.

**Prevention:** Keep `version: 1` for backward-compatible additive changes (the existing pattern heals within version 1). Add new migrate blocks at the end of `SaveSystem.migrate()` but ensure they only read fields that earlier blocks have already healed, or are fully self-healing (default to safe empty values). Never reorder existing blocks. Test with a v11 save fixture (per the v4.0 "save-fixture hydration before deletion" precedent).

**Phase:** Phase 4 (zone content) — any new persistent state.

**Warning signs:** `version` changed away from `1`; migrate blocks referencing `G.state` fields that a later block overwrites; new fields missing after load; `data.version !== 1` rejections.

---

### Pitfall 2.4 — HUD (`UI.HUD`) layout assumptions broken by zone/HUD changes

**What goes wrong:** `UI.HUD()` (button.js:367) draws fixed-position resource counters at `x = margin + 80/180/280/380` with `margin = 12`, assuming a 400px-wide logical canvas. v12 zone content or visual polish changes (e.g., wider zone banners, new realm indicators, adjusted logical dims for new content) can push HUD text off-screen or overlap zone UI. HUD is rendered by ~10 scenes (alchemy, debug, farm, achievements, bazaar, forge, trials, questLog, party, combat) so a layout change ripples widely.

**Why it happens:** HUD positions are hard-coded literals rather than derived from `G.W`, `R.radius`, or a layout helper; v12 changes one scene's layout without checking the shared HUD.

**Consequences:** HUD text clipped at screen edges; overlap with new zone/realm indicators; inconsistent HUD across screens; fails the "HUD screen/scene alignment verification for unaffected screens" milestone goal.

**Prevention:** Do not change `UI.HUD()` coordinates for v12 unless all 10+ call-site scenes are re-verified. If new zone HUD indicators are needed, add them as separate render layers positioned relative to `G.W`/`margin`, not by shifting existing HUD coordinates. Verify HUD on portrait (400×720, 400×866), landscape (720×400, 866×400), and desktop card (400×720) per the v7.0 adaptive-viewport matrix.

**Phase:** Phase 5 (HUD alignment verification).

**Warning signs:** HUD text touching screen edges; overlap with new zone banners; HUD layout differing between scenes; literal coordinates (`x + 380`) exceeding `G.W` on smaller screens.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Particle variety scaffolding | Per-frame `push()` allocation; unbounded particle arrays | Use `createCircularBuffer` or pre-allocated slot arrays; allocate once at spawn |
| Screen shake integration | `R.reducedMotion()` bypass; HUD/shake double-translation | Reuse `R.screenShake()`; keep `ctx.translate` scoped to game.js lines 459–462 |
| Combat FX integration | `R.damageNumber`/`R.elementBurst` desynchronization; new element types | Single FX helper spawning both at same coords; reuse six `R.colors.elements` tokens |
| Zone content | New persistent state without `migrate()` heal blocks; new zone IDs | Add `normalize()` blocks in `SaveSystem.migrate()`; no new zone IDs |
| WebGL temptation | WebGL renderer proposed for particles | Reject at design; stay Canvas 2D; increase buffer caps instead |
| HUD alignment | `UI.HUD()` coordinate drift; overlap on affected/unaffected screens | Hard-code HUD coordinates; verify on 7-size matrix; add new indicators as separate layers |

---

## Sources

- `src/engine/renderer.js` — `R.damageNumber` (line 505), `R.screenShake` (line 536), `R.elementBurst` (line 666), `R.deathBurst` (line 548), `R.reducedMotion()` (line 108), `createCircularBuffer` (line 429), particle buffers (lines 484–487, 546, 662–664, 727)
- `src/systems/combatFx.js` — CombatFX delegate to `R.elementBurst` (full file, 25 lines)
- `src/scenes/combatScene.js` — dual `R.damageNumber` + `R.elementBurst` wiring (lines 597–598, 668–669), `R.screenShake` call sites (lines 460, 602, 682)
- `src/engine/game.js` — shake translate scope (line 459), `ctx.restore()` (line 462), HUD/Notify/Fade render after restore (lines 463–477)
- `src/systems/save.js` — `SaveSystem.migrate()` heal chain (lines 42–154), `version: 1` (line 18), `WorldState.normalize()`/`ZoneRewardSystem.normalize()` calls (lines 81–88)
- `src/ui/button.js` — `UI.HUD()` fixed coordinates (lines 367–388)
- `.planning/PROJECT.md` — v12.0 target features, constraints (no new element types, no WebGL, vanilla JS/Canvas/localStorage/PWA), save-compatibility requirement, reduced-motion constraint
- `src/engine/codemap.md` — memory leak risk #1: particle arrays `push()` unbounded in hot paths (line 77)
