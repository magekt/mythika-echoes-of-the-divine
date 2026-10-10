# v5.0 Defect-Class Patterns

**Scope:** 11 filed defects (2026-10-09 play report). **Stack:** vanilla JS, immediate-mode Canvas 2D, logical 400x720, `R.*` tokens, `Scene.*` lifecycle, `UI.Feedback`.

## A. Reserved-slot vertical bands (combat header, zone title, Bazaar rows, Ashram)

**Defects:** combat-header overlap, zone name/subtitle + progress-bar overlap, Bazaar row + HUD/title collisions.
**Technique:** fixed y-slot table per screen — each row owns `{y, h}` (e.g. name 12px / HP 10px / MP 10px + 6px gutters); content clips or wraps inside its slot, never borrows the next slot. Buttons live inside their parent panel rect (target button inside enemy panel, not absolute top-right). HUD moves to a dedicated band below titles. Complexity: Low-Med. Reuse: `Scene.*` scroll-band helpers (`getContentTop`), `R.fonts`/`R.textCenter`, existing Phase 14 band contracts in `combatScene.js` (~L190).
**Verify:** 400x720 portrait + 430x800; headless click tools must add scroll-panel offset (stored y=38 vs rendered +286px).

## B. Uniform action grid + toast-safe zone (combat actions, zone buttons)

**Defects:** half-width Melee / offset Guard / tutorial toast covering Gandiva + Rain of Arrows; Attack/Skill touching, firing in no-encounter state.
**Technique:** single action-bar grid — all buttons same width (full-width stack or 2-col grid), ≥8px gaps (keep 44px touch targets), and a reserved toast band (top-center) that action hit-boxes never enter. Gate Attack/Skill/Flee on `encounter != null`. Complexity: Low. Reuse: `UI.Button`, `UI.Feedback.renderToasts` band; never render live controls in the result/outcome band (combatScene ~L190-192 contract).
**Anti-feature:** no per-button ad-hoc widths or absolute positioning.

## C. Toast lifecycle scoping per scene

**Defect:** "Locked zones" toast surviving across Party/Cultivation.
**Technique:** `UI.Feedback.Toast.clear()` already exists (feedback.js L125) — call it in `Scene.leave`/`enter` (or `gScene` transition in `game.js`), so toasts die with their scene. Optional: tag toasts `{scope: sceneId}` and purge non-matching on transition; keep max 3 / 2.5s defaults. Complexity: Low. Reuse: `UI.Feedback.Toast.clear`, `G.dt`-driven `updateToasts`, `R.reducedMotion()` entrance (150ms slide+fade).
**Anti-feature:** no global persistent queue drained without a transition hook; no cross-scene toasts except explicit Victory/defeat confirmations.

## D. Nav + icon semantics (More slot, lock vs bolt, coin vs bolt)

**Defects:** unlabeled hamburger; bolt used for lock AND gold; Ashram doubled border.
**Technique:** More slot gets icon+label via the same FluidNav helper as the other four slots. Reserve glyphs: 🔒 lock, 🪙/coin gold, ⚡ energy/prana only. Single-stroke panels — card strokes OR panel strokes, never both (Ashram: keep panel stroke, drop card stroke). Complexity: Low. Reuse: `Scene.*` nav helper (`scene-helpers.js`), `R.colors`/`R.radius`.

## E. Content-fitted modal + title/hero-sprite repair

**Defects:** Confirm Creation gap; MYTHIKA wordmark unreadable, off-center footer, green-square hero.
**Technique:** modal height = measured body height + standard padding (fix `UI.Modal` content-height calc; buttons follow body with fixed 12-16px gap). Title: letter-spaced `R.fonts` wordmark via `R.textCenter(G.W/2)`, centered footer, sprite drawn through the asset pipeline (missing-asset fallback, never a raw fillRect). Complexity: Low. Reuse: `UI.Modal`, `R.textCenter`, `R.reducedMotion()`.

## F. Early-game pacing ramp (combat triviality, 16%/battle clears)

**Defect:** Lv1 two-taps Cobra, full HP over 27 fights; zone clears in ~7 fights.
**Technique:** standard RPG ramp — enemy HP ×1.5-2 and damage +30-50% in zone 1, scaling per zone; progress-per-battle 16% → 6-8% (12-16 fights/zone); keep first 2 fights tutorial-easy, then ramp. Tune in data (`src/data/`), not scene code. Complexity: Med (needs 15-min playtest). Reuse: `Combat`/`Progression` systems (`src/systems/combat.js`, `progression.js`); route rewards through canonical reward/quest paths (exactly-once).
**Anti-feature:** no scene-local damage hacks; no breaking combat-band/feedback contracts.

## G. Backfill empty lower halves (Party, Alchemy, Spirit Beasts, Quest Log)

**Defect:** bottom half empty at game start.
**Technique:** fill with live content, don't stretch rows — next-action hint (`UI.Feedback.InlineHint`, cf. party.js L188), progression preview (next unlock/XP-to-go), contextual tip. Pattern already proven in party scene. Complexity: Low-Med. Reuse: `UI.Feedback.InlineHint` + `ContextualBadge`, `R.colors.accent` bar.
**Anti-feature:** no row stretching, no dead filler art.

## H. Map-card density + level-relative threat

**Defect:** empty card interiors; "Intense (100%)" at Lv1.
**Technique:** compact stat rows + landmark/event dots to fill interiors; displayed threat = f(zoneLevel − partyLevel), not absolute. Complexity: Low. Reuse: `map_helpers.js`, `R.fonts.md`.
