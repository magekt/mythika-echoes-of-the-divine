# Phase 12 — UI Review

**Audited:** 2026-09-20  
**Baseline:** Abstract six-pillar standards, `TRAVEL_MAP_DESIGN.md`, `STYLE_GUIDE.md`, and Phase 12 plans/validation  
**Screenshots:** Not captured — no dev server was available on ports 3000, 5173, or 8080

## Pillar Scores

| Pillar | Score | Key Finding |
|---|---:|---|
| 1. Copywriting | 3/4 | Map instructions and state labels are clear, but several controls/details use generic or truncated copy. |
| 2. Visuals | 3/4 | Strong map hierarchy, selection panel, indicators, and motion fallback; dense indicators and icon-only close affordance remain review risks. |
| 3. Color | 3/4 | Semantic tokens and status colors are used consistently, but direct colors and accent-heavy borders reduce confidence in the intended balance. |
| 4. Typography | 2/4 | Tokenized ladder is consistent, but the 8px `xs` face and compact canvas labels are below comfortable mobile readability. |
| 5. Spacing | 2/4 | Logical 400×720 geometry is deliberate, but many hard-coded offsets and tight indicator/detail-panel packing make responsive readability uncertain. |
| 6. Experience Design | 2/4 | Loading/error/reduced-motion paths exist, but human performance and dense-state interaction were not verified; lifecycle cleanup still leaves fragile component ownership. |

**Overall: 15/24**

## Strengths

- The map has an explicit interaction model: “Tap to inspect • Drag to pan” and a 15px drag threshold (`travelMap.js:40-44`, `323-388`).
- Render optimization is meaningful and test-backed: cached metrics/rects, offscreen grid, and viewport culling (`travelMap.js:159-183`, `390-471`); the targeted suite passed 12/12 tests.
- Reduced-motion coverage is present for grid drift, event pulsing, button springs, and scene fades (`travelMap.js:466-470`, `561-590`; `button.js:393-410`; `game.js:125-151`).
- The project uses shared color/font/radius tokens in the map and renderer (`renderer.js:1-50`; `travelMap.js:496-533`).

## Top 3 Priority Fixes

1. **BLOCKER — Verify the complete map task flow in a real browser.** The archived plan explicitly requires FPS, panning, dense indicator readability, event resolution, reduced motion, and repeated scene cycling, but this audit could not capture screenshots or run the browser checkpoint (`12-02-SUMMARY.md:49-56`; `12-VALIDATION.md:62-69`). Run `index.html?probe&map` on desktop and a mobile profile, record FPS/console output, and capture map/detail/reduced-motion states.
2. **WARNING — Increase minimum map/detail text size and reflow dense content.** `R.fonts.xs` is 8px (`renderer.js:46-50`), while map status, progress, relevance, remaining-time, and indicator labels use `xs` (`travelMap.js:518-520`, `675-680`, `750-755`). Raise functional labels to `sm` or apply the existing font scale, and test long zone/event names at 375px.
3. **WARNING — Make lifecycle ownership explicit and clear the grid cache on reset.** `resetState()` clears selection/rect/text caches but does not clear `_gridCanvas` or `_gridCanvasKey` (`travelMap.js:51-74`), despite the plan stating the grid should be cleared on reset (`12-01-PLAN.md:325-331`). Add explicit teardown or document intentional reuse; add a regression test for scene leave/re-enter and resize.

## Detailed Findings

### Pillar 1: Copywriting (3/4)

- **WARNING:** The primary map copy is specific and useful (`travelMap.js:40-44`, `415-418`), and “Enter Zone”, “Resolve”, “LOCKED”, and “Exploration” communicate actions/states (`travelMap.js:84-112`, `513-520`, `805-835`).
- **WARNING:** The fallback zone description “A region waiting to be explored.” is generic (`travelMap.js:805-808`), and event fallback “Event expired” is generic (`travelMap.js:745-755`). Prefer contextual next-step copy where data is missing.
- **WARNING:** Description strings are truncated by character count rather than measured layout (`travelMap.js:805-808`, `823-824`), risking awkward truncation and loss of important requirements on narrow screens.

### Pillar 2: Visuals (3/4)

- **PASS with caveat:** Region cards establish hierarchy through name, state, progress bar, and selected border (`travelMap.js:496-530`). Detail panels provide a clear second-level inspection surface (`travelMap.js:777-843`).
- **WARNING:** Multiple landmarks, echoes, and events share the lower card band with fixed 16/24px gaps (`travelMap.js:536-614`), so dense zones may collide or become visually illegible; this requires browser evidence.
- **WARNING:** The close control is the icon-only `×` button (`travelMap.js:114-126`) with no visible tooltip or accessible label in the canvas UI. Provide a discoverable “Close” treatment or a consistent hint.
- **WARNING:** The event resolve control is drawn manually (`travelMap.js:758-771`) while interaction is routed through the reusable enter button (`travelMap.js:84-112`); visual and hit-target geometry should be verified together.

### Pillar 3: Color (3/4)

- **PASS with caveat:** Map rendering mostly uses semantic tokens for background, surfaces, statuses, borders, and text (`travelMap.js:391-417`, `504-527`; `renderer.js:14-35`).
- **WARNING:** Accent/gold is used for selected borders, landmark discovery, headings, labels, buttons, and event/detail accents (`travelMap.js:509-520`, `652-675`, `724-755`), which may flatten emphasis instead of preserving a 60/30/10 hierarchy.
- **WARNING:** The renderer still contains raw hex/rgba colors in shared primitives (`renderer.js:190-198`, `511-523`) and `game.js` uses `#000` plus raw timer colors (`game.js:155-160`, `400-401`). This is outside the map’s immediate contract but weakens token consistency.

### Pillar 4: Typography (2/4)

- **WARNING:** The font ladder is centralized and scalable (`renderer.js:41-65`), and the map uses it for most labels (`travelMap.js:416-417`, `515-520`, `657-680`).
- **BLOCKER:** Functional map metadata is rendered at `R.fonts.xs` (8px base) in several places (`travelMap.js:518-520`, `611-613`, `675-680`, `750-755`, `813-814`). On a 375px viewport, this is a likely readability failure for status, landmark, timer, and progress information. Confirm with screenshots and raise the minimum for actionable/state copy.
- **WARNING:** Zone descriptions are drawn as a single line and then character-sliced (`travelMap.js:805-808`), rather than using the existing measured wrapping helper; this can produce uneven visual rhythm and inaccessible hidden copy.

### Pillar 5: Spacing (2/4)

- **WARNING:** The logical canvas and viewport are explicit (`game.js:212-215`; `travelMap.js:150-156`), and panel margins are consistent at 12/18px (`travelMap.js:637-680`, `787-843`).
- **WARNING:** The map uses many one-off pixel offsets (`travelMap.js:218-225`, `249-260`, `284-296`, `638-649`, `759-768`) rather than a named spacing scale. This is particularly risky where indicators and labels share a card.
- **WARNING:** The detail panel is fixed to `G.H - 252` with 244px height (`travelMap.js:634-640`, `707-713`, `777-790`), leaving no demonstrated adaptation for font scaling or long copy. Validate at 1.15/1.3 font scales and 375px width.
- **WARNING:** `G.CONTENT_TOP + 56` plus a fixed bottom panel creates a narrow map band on the logical 720px surface (`travelMap.js:150-156`, `423-428`); panning/clamping behavior needs visual verification in selected and unselected states.

### Pillar 6: Experience Design (2/4)

- **PASS with caveat:** The loop has watchdog recovery and a user-facing recovery toast (`game.js:340-359`), reduced-motion support (`game.js:125-151`), and a performance probe (`game.js:254-255`, `328-333`, `414-437`).
- **WARNING:** The Phase 12 human checkpoint remains unverified by the archived evidence (`12-02-SUMMARY.md:49-56`); automated tests prove state/cache behavior, not actual FPS, touch feel, visual density, or zero console errors.
- **WARNING:** `leave()` resets the button array but does not call a component destroy contract (`travelMap.js:47-74`; `button.js:232-243` only defines destroy for native inputs). The pattern is probably GC-safe today, but it is fragile for future retained listeners/closures.
- **WARNING:** `render()` recreates `_cachedRects` every frame and the data declaration contains duplicate cache keys (`travelMap.js:30-37`, `393-404`). This is not necessarily a user-visible defect, but it complicates stability reasoning and should be cleaned up before claiming robust lifecycle ownership.
- **WARNING:** `UI.FluidNav.handleTap()` contains a self-comparison (`Math.abs(y - y) < 30`) that always passes (`button.js:655-669`). It is not invoked by the map scene shown here, but it is a shared navigation interaction defect visible in the same application and should be fixed separately.

## Human-Review Limitations

- No browser screenshots were captured because no server responded on localhost ports 3000, 5173, or 8080. Visual scores are code-informed, not screenshot-confirmed.
- No real-device or throttled-browser FPS, memory, GC, resize, DPR, touch-drag, or console-error session was available.
- Automated evidence was limited to `node --test tests/travel_map_perf.test.js tests/travel_map_lifecycle.test.js`: **12/12 passed**. These tests do not establish the Phase 12 manual gates of sustained FPS, dense-state readability, or reduced-motion browser behavior.

## Files Audited

- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-01-PLAN.md`
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-01-SUMMARY.md`
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-02-PLAN.md`
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-02-SUMMARY.md`
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-VALIDATION.md`
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-PATTERNS.md`
- `.planning/milestones/v2.0-phases/12-living-map-performance-stability/12-RESEARCH.md`
- `TRAVEL_MAP_DESIGN.md`
- `STYLE_GUIDE.md`
- `src/scenes/travelMap.js`
- `src/ui/button.js`
- `src/engine/game.js`
- `src/engine/renderer.js`
- `src/engine/codemap.md`
- `src/scenes/codemap.md`
- `src/ui/codemap.md`
- `tests/travel_map_perf.test.js`
- `tests/travel_map_lifecycle.test.js`
