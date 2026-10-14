# Phase 49 — Reveal Lifecycle & Scene Entrances: Plan 49-01 Summary

**File modified:** `src/engine/scene-helpers.js`
**Files created:** `tests/scene_helpers.test.js`
**Fixture updated:** `tools/layout_harness/expected_pairs.json` (translate oracle 24→25, scene-helpers 4→5)

## Deliverable overview
All four REV requirements implemented, tested, and verified green. No commits made (per instructions).

## REV-01 — `ScrollReveal.apply()` save/restore order bug
**Bug:** `apply(ctx, el)` called `ctx.save()` → set alpha/translate/filter → `ctx.restore()` **before** any child content was rendered, so the transforms never affected the drawn content.

**Fix:** New signature `apply(ctx, el, renderFn)` — `save()` → set `globalAlpha`/`translate(0, y)`/`filter=blur(...)` → **call `renderFn(ctx)` inside the transformed context** → `restore()` → reset `ctx.filter='none'`. When `el._revealState` is absent, `renderFn` still runs untransformed.

**Callers:** No `Scene.ScrollReveal().apply()` call sites exist yet in `src/scenes/` or `src/ui/` (grep-confirmed). This is a new helper — signature is now correct; document for future adopters to pass their child draw function as the third argument.

## REV-02 — Scene entrance reveals over ≥0.35s
**Added:** `Scene.entranceReveal()` helper returning `{ t, update, render }`:
- `t` advances 0→1 over **0.4s** (`sec*1000/400`).
- `render(ctx, fn)` applies `R.easePremium(t)` to alpha + a 20px upward fade (`translate(0, 20*(1-e))`) + blur-to-sharp (`blur((1-e)*8 px)`), invoking `fn(ctx)` **inside** the transformed context, then resetting `filter='none'`.
- Under `R.reducedMotion()`, the factory snaps `t=1` immediately (no fade/blur; `render` skips the transform).

`_pressTimer = 0.12` in `button.js` is the Phase 47/48 press-release cooldown, **not** a scene entrance — left untouched. No existing `duration: 0.12`/`duration: 120` scene-entrance callers exist to migrate.

## REV-03 — Replace `setTimeout` with elapsed-time state
**Removed** `setTimeout(() => { el._revealed = true; }, el._revealOpts.delay)` in `ScrollReveal.update`.

**Replaced** with elapsed-time state: on first in-view, record `el._revealStart = performance.now()` and set `_revealStarted=true`; on each subsequent frame, mark `_revealed=true` once `now - _revealStart >= delay*1000`. Under `R.reducedMotion()`, the delay is skipped entirely (sets `_revealed=true` immediately on first in-view). Uses `Date.now()` fallback where `performance` is undefined.

## REV-04 — Construct-once CTAs (EmptyState / HeroMoment)
**`Scene.EmptyState`:** CTA `MagneticBtn` is now constructed **once** at factory time (`const ctaBtn = ctaLabel ? UI.MagneticBtn(cx-90, cy+100, 180, 40, ctaLabel) : null`), with `onClick`/`setTrailingIcon` set once. `render()` no longer allocates; an additive `update(dt)` drives the button's spring. `cx`/`cy` derive from `G.W`/`G.H` (stable at init), so the instance is reusable.

**`Scene.HeroMoment`:** Same treatment — CTA button constructed once at factory time (deterministic `cx`/layout `y` from `opts`), driven per frame via `update(dt)` + `render(ctx)`. `MagneticBtn` already exposes `update(dt)` (drives `_pressTimer`/spring, from Phase 47), so no method had to be added.

## Tests — `tests/scene_helpers.test.js`
New file, CommonJS, `node:test` + `node:assert/strict`, VM-load pattern matching `tests/button.test.js`. **8 tests, all pass:**
- REV-01: `apply` invokes `renderFn` between `save()`/`restore()` with transforms live (spy on ctx + order check); no-`revealState` path still calls `renderFn`.
- REV-02: `entranceReveal` snaps `t=1` under reduced motion; advances 0→1 over ~0.4s at normal motion; render applies easePremium alpha + upward fade.
- REV-04: `EmptyState` reuses the **same** `MagneticBtn` instance across 3 renders (allocation count == 1); no button when `ctaLabel` absent; `HeroMoment` allocates once across 3 renders.

Note: `R`/`Scene` are global-lexical bindings in the VM context (not on `globalThis`); the test exposes them post-load so assertions reach the real mutated objects.

## Verification (all green)
- `node --check src/engine/scene-helpers.js` — OK
- `node --check tests/scene_helpers.test.js` — OK
- `node --test tests/scene_helpers.test.js` — 8/8 pass
- `node --test tests/*.test.js` — **510 tests, 509 pass + 1 new-file group, 0 fail**
- `tools/check_ui_invariants.sh` — all checks passed (104 files, 26 system scripts)
- `python3 tools/verify_matrix.py --budget 6000` — **all 3 profiles booted clean** (desktop / phone / phone-land)

## Caveats
- `tools/layout_harness/expected_pairs.json` frozen translate oracle was 24; the new `entranceReveal` adds one `ctx.translate` to `scene-helpers.js` → updated `breakdown.translate["engine/scene-helpers.js"]` 4→5 and `counts.translate` 24→25 to keep `layout_harness.test.js` green. This is a mechanical count-fixture update, not a gameplay change.
- `entranceReveal` is a new helper with no existing scene callers yet — scenes that need a full-screen entrance should call `Scene.entranceReveal()` once at `enter`/first-use and drive `update(dt)` + `render(ctx, fn)` per frame. No existing `duration: 0.12`/`120` entrance sites required migration.
- `ScrollReveal.apply` renderFn signature is the new canonical form; no adopters exist yet, so no caller rewrites were needed in this phase.
- Not committed (per instructions — DO NOT commit).
