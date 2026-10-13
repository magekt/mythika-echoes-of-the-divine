# Phase 42: Adaptive Fill Viewport — Research

**Researched:** 2026-10-13
**Status:** Ready for planning
**Requirement:** LAY-08 (single-requirement milestone v7.0)
**Baseline:** `node --test tests/*.test.js` → 450 tests, 449 pass, 1 skipped, 0 fail (~2s)

## 1. Problem Statement

`fitGame()` (`src/engine/game.js:245`) letterboxes the fixed 400×720 logical stage with a CSS `transform: scale(min(vw/404, vh/724, 1))` capped at 1. On a 390×844 phone the scale is 0.965 → dead bars; on 844×390 landscape the 400×720 stage (aspect 0.556) inside a 2.16-aspect viewport scales to 0.54 → massive side bars plus the "rotate your device" nudge. DPR backing is set once at boot (`gInit`, game.js:265) and never re-inited, so any resize/orientation/browser-chrome change leaves stale backing (blur) or wrong mapping. Goal: edge-to-edge fill, nothing cut, portrait + landscape, desktop unchanged.

## 2. Why Scale-to-Fill Cannot Work (decision record)

- `scale = max(...)` (cover) would crop content — violates "nothing cut".
- `scale = min(...)` (contain, current) letterboxes — violates "fills edge-to-edge".
- Aspect ratios: stage 400/720 = 0.556; 390×844 = 0.462; 844×390 = 2.164. No single uniform scale fills both without cropping.
- **Therefore: the logical viewport must become adaptive.** Keep width at 400 logical px on phones and expand/contract logical height to match the real aspect (`G.H = round(400 × vh/vw)` clamped to a sane band, e.g. 400–1000); landscape phones get `G.W > G.H` (e.g. width = round(720 × vw/vh) capped, height 400-ish band). Desktop ≥1024 wide keeps 400×720 centered, scale capped at 1 (success criterion 1 explicitly preserves this).
- The codebase already supports this direction: **no code assigns `G.W`/`G.H` after init** (grep confirms zero assignments), and ~all layout reads `G.W`/`G.H` dynamically. Only 2 hardcoded `720` literals exist, both in `src/scenes/tournament.js` (lines 59 comment, 292 comment+`y=666` control position) — must be converted to `G.H`-relative.

## 3. Current fitting pipeline (exact sites to change)

| Site | File:line | Current | Needed |
|------|-----------|---------|--------|
| `fitGame()` | `src/engine/game.js:245-258` | CSS-transform scale, cap 1, `transformOrigin center`, sets `G.viewportProfile`, rotate nudge | Safe-area-aware sizing: read `window.visualViewport` (fallback `innerWidth/innerHeight`), subtract `env(safe-area-inset-*)` via computed style, compute adaptive `G.W`/`G.H`, size container in CSS px, call DPR re-init |
| DPR backing | `src/engine/game.js:265-270` (inside `gInit`, runs once) | `canvas.width = G.W*dpr` once | Extract to `initDprBacking()` (or `refitCanvas()`), call on every refit; `G.ctx.setTransform(dpr,0,0,dpr,0,0)` each time |
| Resize triggers | `src/engine/game.js:533-536` | `resize` + `orientationchange` → `fitGame` only | Add `visualViewport.resize` + `visualViewport.scroll` listeners (browser-chrome show/hide), debounce ~100ms; keep existing listeners as fallback |
| Container CSS | `styles/game.css` `#game-container` | `width:400px; height:720px; box-sizing:content-box; transform-origin` set inline by JS; 3px gold border; `max-width/max-height` safe-area calc; `@media (max-width:420px)` borderless; landscape `@media (orientation:landscape) and (max-height:520px)` | Container becomes fill-sized (`width/height` set from JS in CSS px; `box-sizing:border-box` so border doesn't overflow); canvas CSS `width/height:100%`; keep borderless ≤420px rule; landscape media query retained |
| Input mapping | `src/engine/input.js:36-78` | `(clientX-rect.left) × (G.W/rect.width)` via `getBoundingClientRect()` | **Already transform-proof** — rect reflects real rendered size, and ratio uses live `G.W`/`G.H`. No change needed PROVIDED canvas backing matches CSS size on every refit (key link). Regression test must pin this. |
| `G.viewportProfile` | `game.js:251` | Set but **zero consumers** outside game.js (grep) | Reuse for profile computation or replace with adaptive dims; keep `landscape` value for rotate-hint logic |

## 4. `Scene.responsive()` landscape gap (exact site)

`src/engine/scene-helpers.js:86-91`: accepts `viewport` but **ignores it for rects** — `safe/header/primary/back` are hardcoded to `G.W−28`, `G.H−92`, `G.H−40`. On an adaptive stage these auto-follow `G.H` (good for portrait-tall), but landscape needs distinct values per roadmap plan 42-02: compact header height, primary/back stacked tighter (short viewport ~390 logical px tall can't afford y=298/350 with 48+32px buttons — actually it can, but header 72px + content top 116/134 leaves little; landscape values must shrink header to ~56 and content-top accordingly). Consumers: `contextHeader`, `primaryAction` (rect override supported), 5 scenes call `Scene.responsive()` directly (ashram, settings, title, travelMap, zoneExploration).

## 5. Scroll / cull / HUD anchoring (auto-adaptive, verify don't rebuild)

- `ashram.js:36,55`: `getContentHeight() = G.H − top − navBarHeight`, `navY = G.H − navBarHeight` — adaptive automatically.
- `Scene.cullButtons(buttons, scrollY, viewportH)` + `Scene.clipContent(ctx, scene)` use scene-provided heights — adaptive automatically. Callers pass `getContentHeight()` (ashram, equipment, journeyScene, zoneExploration, party) — consistent.
- `Scene.toastLane()` (scene-helpers.js:438): `y = G.H − 120` — adaptive automatically.
- `Scene.FluidNav.collapsedLayout()` (scene-helpers.js:232): `pillY = G.H − pillH − 12` — adaptive automatically.
- `src/ui/button.js:659`: `x > G.W−60 && y > G.H−60` corner — adaptive automatically.
- `Scene.ScrollReveal.update` (scene-helpers.js:192): `el.y < G.H + 100` — adaptive automatically.
- `drawBackground()` (game.js:467): gradient over `(0,0,G.W,G.H)` + `clearRect(0,0,G.W,G.H)` — adaptive automatically.
- **LAY-07 slot contract holds by construction:** `R.Backgrounds.paint` (`backgrounds.js:261,269`) does `drawImage(img, 0, 0, G.W, G.H)` stretch-to-fill, so extended areas are painted (mild stretch on authored art is acceptable; fallback generators bake 400×720 but are also stretched at paint time — no change needed, note as accepted).
- Tournament controls at literal `y=666` (tournament.js:292 + comment line 59 referencing "720px canvas height") are the only fixed-position breakage found — convert to `G.H`-relative.

## 6. Safe-area + visualViewport API notes

- `index.html:6` already has `viewport-fit=cover`; `game.css` body already pads `env(safe-area-inset-*)` and uses `100dvh`. JS must read the real insets: `getComputedStyle(document.body)` won't expose env() directly — standard trick is a 4-side probe via `env()` in a hidden element or `window.visualViewport` offsets; simplest robust approach: `visualViewport.width/height/offsetLeft/offsetTop` for the visual size + CSS `env()` on the container for notch padding (already handled by body padding + container max-width/max-height calc — keep and extend).
- `visualViewport` support: Chrome/Edge/Safari/Firefox-mobile all support `visualViewport.resize`; guard with `if (window.visualViewport)` and keep `resize`/`orientationchange` fallback.
- Debounce refits (~100ms trailing) — rotation fires bursts; refit does canvas realloc (expensive, clears frame) so must not run per-event.
- Canvas backing realloc mid-frame is safe (next frame repaints fully every frame — full `clearRect` + repaint, no dirty-rect state).

## 7. Verification assets already in repo (reuse, don't rebuild)

- `tools/verify_matrix.py`: boot profiles `desktop 1280×1400`, `phone 390×844 DPR3`, `phone-land 844×390 DPR3` + layout sweep on the two phone profiles across ~26 scenes with box/clip asserts (`tools/layout_harness/{inject,driver,assert}.js`, `expected_pairs.json`). Success criterion 4's "boot profiles clean" = these three.
- Node tests: `tests/responsive_screen_matrix.test.js` (5-profile checklist incl. `getBoundingClientRect` pin), `tests/layout_harness.test.js`, `tests/layout_sweep_drift.test.js`, `tests/combat_layout_{bands,proof}.test.js`, `tests/backgrounds_browser_matrix.test.js`, `tests/final_acceptance_browser_matrix.test.js`. New tests follow the `node:test + assert/strict, zero dependencies` convention.
- `tools/check_ui_invariants.sh`: all-`src/**/*.js` `node --check` + spring-scale pattern ban + exactly-once system script loading. New/edited files are covered automatically.
- Responsive set for plan 42-03 (from LAY-08): 390×844, 844×390, 400×720, 540×900, 720×400, 1024×768, 1440×900.

## 8. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Dynamic `G.H` breaks scenes with implicit 720 assumptions (tournament y=666 is the known one; others may hide behind `G.H` math that assumed 720, e.g. `recoverableState` y=330, `EmptyState` cy=G.H/2−40 — both fine) | Plan 42-02 audits every `G.H`-derived constant for sanity at H≈390 (landscape) and H≈867 (390×844 tall); layout-sweep harness catches visual regressions |
| Canvas realloc on every resize event → jank | Trailing debounce ~100ms; realloc only when size actually changed (guard) |
| DPR change on zoom/monitor move (desktop) | Read `devicePixelRatio` fresh inside refit; cap 3 (existing convention) |
| `transform: scale()` removal changes auth overlay positioning (`.auth-input-overlay` absolute inside container) | Overlay uses container-relative absolute positioning — unaffected by removing transform; verify authScene at phone profiles |
| Desktop regression (must stay centered 400×720, scale ≤1) | Explicit branch: `vw >= 1024` (or landscape + `vh >= 700`?) → legacy path unchanged; desktop profile in verify_matrix guards it. NOTE: 1024×768 "narrow desktop" from responsive set falls in desktop branch per success criterion ("desktop 1440×900 behavior unchanged") — 1024×768 keeps centered card. Decide exact breakpoint in plan 42-01 (`vw >= 800 && vw <= vh`? no — simplest: phone branch when `vw < 600` OR landscape-short `vh < 500`; else legacy). Planner must lock one rule. |
| Service worker caches old game.js/css | `sw.js` precache unchanged by default; version bump if needed (plan 42-03 verifies fresh-worker boot) |

## 9. Don't hand-roll / reuse

- Input coordinate mapping (already correct — do not "fix").
- Background slot paint path (`drawImage(...,G.W,G.H)` — already stretch-fills).
- `visualViewport` + `resize`/`orientationchange` + debounce — standard pattern, no library.
- Node test conventions (`node:test`, `assert/strict`, zero deps) and `verify_matrix.py` stdlib-only harness.

## 10. Common pitfalls (from repo history)

- `box-sizing: content-box` + 3px border overflows max-width calc — switch to `border-box` when JS sizes the container (roadmap plan 42-01 already flags this).
- `transformOrigin center` + body flex centering leaves alignment gaps after removing scale — set explicit `transform:none` and rely on flex centering.
- Forgetting `G.ctx.setTransform` after canvas realloc → everything renders at 1/dpr scale (tiny). Every realloc path must set transform (extract single function).
- `?probe` FPS + `?probe&selftest` + `?probe&map` boot paths must keep working (harness depends on them; `responsive_screen_matrix` checklist).
- Console silence (SHP-04 precedent): no new warnings on boot.

## 11. Validation Architecture

Per-task verification uses the existing gates (no new infra — Wave 0 installs nothing):

- **Quick gate (after every task commit):** `node --test tests/<touched-area>*.test.js` — targeted files run in <5s. New tests for refit math must be pure-logic (extract `computeViewportDims(vw, vh, dpr, safe)` as a testable pure function in game.js or a `src/engine/viewport.js` classic-global module — no DOM needed, Node-testable).
- **Full gate (after every plan wave):** `node --test tests/*.test.js` (~2s, 449/450 baseline) + `tools/check_ui_invariants.sh`.
- **Browser gate (plan 42-03 only):** `python3 tools/verify_matrix.py --budget 6000` (requires Chrome/Chromium/Edge; `MYTHIKA_CHROME` selects binary). Boot profiles + layout sweep on phone/phone-land.
- **validate_plan hard rule:** every `<verify>` needs an `<automated>` command; refit/DPR tests are Node-runnable; only visual "fills edge-to-edge, nothing cut" needs the browser matrix (plan 42-03), which still has an automated command (`verify_matrix.py`).

## 12. Plan shape (recommended, matches ROADMAP outline)

1. **42-01 Fitting core** — pure `computeViewportDims` + safe-area-aware `fitGame` rewrite, `visualViewport` refit triggers w/ debounce, container `box-sizing`/origin fix, extracted per-refit DPR backing (`initDprBacking`), breakpoint rule lock, Node tests for the pure function + input-mapping regression pin.
2. **42-02 Fill** — tournament `y=666`→`G.H`-relative, `Scene.responsive()` landscape values (compact header/primary/back), content-top audit at short H, background-extension confirmation test, scroll/cull height consistency test.
3. **42-03 Verification** — responsive-set sweep (7 sizes: 390×844, 844×390, 400×720, 540×900, 720×400, 1024×768, 1440×900), fresh-worker boot, full suite + invariants green, `verify_matrix.py` boot profiles clean.
