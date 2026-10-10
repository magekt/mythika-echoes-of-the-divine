# Recommended Stack: v3.0 Screen & Gameplay Revamp

**Project:** Mythika: Echoes of the Divine  
**Milestone:** v3.0 Screen & Gameplay Revamp  
**Researched:** 2026-09-20  
**Confidence:** HIGH for browser APIs and current repository constraints; MEDIUM for asset-production choices

## Recommendation

Keep the existing browser-native stack. Do **not** introduce a UI framework, game engine, bundler, or rendering library for this milestone. The shipped architecture already provides a logical 400×720 Canvas coordinate space, DPR-aware backing canvas, immediate-mode scenes, reusable UI factories, local persistence, PWA delivery, and a global reduced-motion policy. v3.0 should improve the screen composition and gameplay feedback inside those boundaries rather than create a second architecture.

Use Canvas 2D for interactive gameplay and dynamic overlays, CSS/HTML for the outer responsive shell and large static imagery, and small browser APIs for instrumentation. This split follows current Canvas guidance: static backgrounds should be placed behind the canvas with CSS or cached on an offscreen canvas, while only changing gameplay/UI layers should redraw every frame.

## Recommended Stack

### Core runtime

| Technology | Version guidance | Purpose | Recommendation |
|---|---|---|---|
| Vanilla JavaScript ES2022+ | Browser-native; no package pin needed | Scenes, systems, input, state, asset loading | Preserve script-tag order for v3.0. Introduce new globals only behind clearly named namespaces (for example `ScreenRevamp` or `DebugProbe`). |
| HTML5 Canvas 2D | Current browser implementation | Combat, map, animated gameplay, hit-testing, effects | Preserve logical coordinates and centralize transforms in the engine. Use `ctx.save()/restore()` around camera, clip, alpha, and composite changes. |
| CSS + HTML | Current browser implementation | Responsive container, static background imagery, safe-area layout, debug/status DOM | Keep the canvas as the game surface; use DOM layers only where they improve responsiveness, text input, or diagnostics. |
| Web Audio API | Current browser implementation | Existing procedural music and SFX | Reuse `Audio`; avoid adding an audio dependency. Keep gesture unlock, page visibility handling, and reduced-motion/accessibility behavior explicit. |
| localStorage + existing SaveSystem | Current browser implementation | Offline saves, migration, debug snapshots | Continue using canonical systems for writes. Any new revamp state must be versioned, sanitized, and included in `SaveSystem.migrate()`. |
| Service Worker / Web App Manifest | Existing PWA implementation | Offline shell and installability | Add image assets to the precache/versioning plan; use cache-busting revisions rather than silently serving stale art. |

### Asset and background imagery

Use `HTMLImageElement`/`ImageBitmap` loaded by a small `AssetCache` module. Store source images at an intentional maximum display resolution, decode them once, and cache common crop/scale variants on an offscreen canvas when repeated scaling is expensive. Do not call `new Image()` or create gradients inside `render()`.

Recommended background pipeline:

1. `AssetCache.load(url)` returns a shared promise and tracks `loading/ready/error`.
2. A scene chooses a semantic background key, not a raw path.
3. A static CSS background layer handles full-bleed atmospheric art where possible.
4. Canvas draws only the parallax/camera crop and gameplay elements.
5. The scene has a deterministic fallback palette/shape when an image has not loaded or fails.

Prefer a small number of compressed WebP/AVIF backgrounds with PNG only for transparency or pixel-critical art. Provide intrinsic dimensions and avoid runtime upscale beyond the source's intended maximum. Keep cultural/environmental imagery authored and reviewed as content, not generated ad hoc in render code.

### Responsive mobile/desktop strategy

Retain the current portrait-first logical stage, but make layout policy explicit:

- **Phone/coarse pointer:** one-column panels, 44–48 logical-pixel action controls, drag/scroll gestures, no hover-only information.
- **Wide desktop/fine pointer:** center the game stage with a capped readable width, use additional side information only when it does not duplicate required mobile content, and support hover as an enhancement rather than a prerequisite.
- Choose breakpoints from content pressure, not device brand or OS. The existing `G.W`, `G.H`, `G.CONTENT_TOP`, `fitGame()`, and scene metric caches should be the only sources of layout dimensions.
- Recompute layout on resize/orientation/DPR changes, but invalidate cached geometry only when the logical viewport or selected responsive mode changes.
- Preserve `viewport-fit=cover`; account for `env(safe-area-inset-*)` in the outer CSS shell and keep Canvas hit coordinates in logical units.

Do not fork gameplay rules for desktop. Responsive behavior belongs in layout/affordance helpers; combat, economy, progression, and rewards remain authoritative in existing systems.

### Instrumentation and debug stack

Use browser-native User Timing rather than a monitoring SDK for this offline milestone:

- `performance.mark()` / `performance.measure()` around frame update, scene render, asset decode, scene enter/leave, save/load, and combat resolution.
- A bounded rolling probe in `Debug`/`G.debug` reporting frame time p50/p95/p99, dropped-frame count, active effects/projectiles, loaded assets, scene transitions, and save duration.
- `console.groupCollapsed('[Mythika]', ...)` only behind the existing debug mode/query flag; avoid logging every frame in normal play.
- `PerformanceObserver` may consume `measure` entries, but disconnect it on teardown and cap retained samples.
- Use Chrome DevTools Performance and Memory panels for verification; treat `performance.memory` as optional/non-portable rather than a production contract.

Instrumentation must be observational: it must not mutate gameplay state, affect random outcomes, or retain scene/component references. Add explicit `clear()`/`leave()` cleanup for probes, observers, timers, and debug overlays.

## Modular implementation pattern

Preserve the current global namespace while tightening boundaries incrementally:

```text
src/data/                 immutable screen/asset/config definitions
src/engine/asset-cache.js shared image loading and fallback state
src/engine/layout.js      logical viewport, responsive mode, safe-area helpers
src/engine/debug-probe.js bounded User Timing/FPS instrumentation
src/ui/                   immediate-mode reusable controls and panels
src/scenes/               scene lifecycle + screen-specific composition
src/systems/              authoritative gameplay mutation and persistence
```

New scene code should follow `enter → update(dt) → render(ctx) → leave` and keep transient state in `scene.data`. Put reusable rendering primitives in `R`, reusable interaction in `UI`, and gameplay mutation in systems. A scene may request an action, but it should not directly award currency, XP, zone progress, or influence.

For each revamped screen, separate:

1. `buildLayout()` — derives rectangles from `G.W/G.H` and responsive mode.
2. `buildComponents()` — creates buttons/panels once per layout version.
3. `update(dt)` — input, timers, and calls to canonical systems.
4. `render(ctx)` — pure drawing from current scene/system state.
5. `leave()` — null component references, cancel timers, unregister observers, and clear transient effects.

Use data-driven screen definitions for labels, art keys, and layout variants. Avoid a generic abstraction layer until at least two screens share the exact behavior; the existing factory style is preferable to premature classes.

## Alternatives considered

| Category | Recommended | Alternative | Why not for v3.0 |
|---|---|---|---|
| Rendering | Canvas 2D | PixiJS/Phaser | Adds dependency, asset/runtime conventions, and a second scene model; not needed for the existing scale or milestone scope. |
| UI | Existing immediate-mode UI factories | React/Vue/DOM-first UI | Conflicts with Canvas hit-testing and script-order architecture; would require broad rewrite and duplicate state. |
| Modules/build | Existing ordered scripts | Vite + ES modules | Valuable long-term, but bundling/lazy loading is architecture debt work, not a screen revamp prerequisite. |
| State | `G.state` + canonical systems | Redux/Zustand/custom store | Would create parallel mutation paths and migration risk. Improve boundaries without migrating the state model in this milestone. |
| Telemetry | User Timing + bounded debug probe | Sentry/analytics/performance SDK | Offline-first constraints, privacy surface, and no need for remote reporting during local revamp validation. |
| Backgrounds | CSS layer/offscreen cache + Canvas crop | Redraw full-resolution art every frame | Increases bandwidth, draw cost, and mobile memory pressure. |

## Guardrails for implementation

- Cap DPR (the current max-3 policy is reasonable) and measure high-DPR devices separately.
- Cache gradients, noise, text measurements, image crops, and static map/background layers; do not allocate them in hot render paths.
- Bound particles, damage numbers, event records, and debug samples. Prefer object reuse where profiling shows GC pressure.
- Use `requestAnimationFrame` for visual updates; do not add animation loops or `setInterval` per scene.
- Keep touch targets at least the existing 44–48 logical-pixel convention and test touch, mouse, keyboard, landscape, narrow desktop, and reduced motion.
- Render loading/error/fallback states for imagery so a missing asset never blocks scene entry.
- Add a revamp-specific self-test route/query that exercises scene transitions, asset failures, resize, reduced motion, and save/load without changing normal gameplay.

## Sources

- MDN, Canvas performance tips (offscreen caching, layered canvases, CSS backgrounds, DPR scaling, integer coordinates, `requestAnimationFrame`): https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas — **HIGH confidence**.
- MDN, `Window.devicePixelRatio` and responsive Canvas sizing: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio — **HIGH confidence**.
- MDN, `CanvasRenderingContext2D.drawImage()` and supported image sources/cropping: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage — **HIGH confidence**.
- MDN, `Performance.measure()` / User Timing API: https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure — **HIGH confidence**.
- web.dev, Responsive web design basics (viewport, content-driven breakpoints, pointer capabilities, safe responsive layout principles): https://web.dev/articles/responsive-web-design-basics — **MEDIUM/HIGH confidence**.
- Repository evidence: `.planning/PROJECT.md`, `codemap.md`, and `src/{engine,scenes,systems,ui,data}/codemap.md` — **HIGH confidence for current project constraints and integration points**.

## Open validation questions

- Measure actual v3.0 background asset sizes and decode time on representative mid-range iOS and Android devices before selecting an art budget.
- Confirm whether the current service worker precache list includes new image directories and whether cache versioning is reliable across installed PWA clients.
- Profile the existing renderer before adding layered canvases; a cached single background may be sufficient and less risky than introducing multi-canvas input coordination.
- Validate desktop layout with keyboard navigation and browser zoom, not only viewport resizing.
