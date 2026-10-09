---
phase: 17-canvas-backgrounds-asset-ready
plan: 01
subsystem: engine
tags: [canvas, rendering, assets, cache, lru]

requires:
  - phase: 13-responsive-screen-grammar-navigation
    provides: responsive screen grammar and layout contracts
  - phase: 15-character-party-surfaces
    provides: hero surface context for character moments
provides:
  - Global R.Backgrounds namespace with semantic slot registry, bounded LRU cache, procedural fallback generators, and async asset loader
  - Contract tests covering slot resolution, fallback generation, cache bounds, reduced motion, and authority boundaries
affects: [17-canvas-backgrounds-asset-ready, 18-modular-navigation-screen-seams, 19-lifecycle-safety-deprecated-cleanup, 20-settings-diagnostics-full-loop]

tech-stack:
  added: []
  patterns: [semantic slot keys, LRU cache with memory pressure, procedural canvas fallbacks, crossfade with reduced motion support]

key-files:
  created:
    - src/engine/backgrounds.js
    - tests/backgrounds.test.js
  modified:
    - index.html

key-decisions:
  - "Semantic slot keys follow pattern: realm:{id}, zone:{id}, combat:{enemyType}, cultivation:{realm}, ashram, map:{region}"
  - "Fallback generators produce deterministic OffscreenCanvas per slot type using gradients"
  - "LRU cache bounded at 20 entries / 5MB with automatic eviction"
  - "Asset loads use 2s timeout; crossfade at 300ms (0ms in reduced motion)"
  - "System is read-only presentation; never mutates G.state or calls gameplay systems"

patterns-established:
  - "Background system registered in index.html after renderer.js, before data/scripts"
  - "All background rendering uses destination-over composite operation"
  - "Contrast preservation via R.colors.surfaceGlass overlay in consuming scenes"

requirements-completed:
  - REQ-028
  - REQ-029

duration: 25min
completed: 2026-10-08
---

# Phase 17 Plan 1: Background System Foundation

**Global R.Backgrounds system with semantic slots, LRU-bounded cache, procedural fallbacks, and async asset loading with crossfade**

## Performance

- **Duration:** 25 min
- **Started:** 2026-10-08T19:45:00Z
- **Completed:** 2026-10-08T20:10:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `src/engine/backgrounds.js` with global `R.Backgrounds` namespace providing `registerSlot`, `get`, `preload`, `clear`, `getMemoryUsage`, `renderBackground`, `renderCharacterMoment`
- Implemented 6 semantic slot types with deterministic procedural fallbacks: realm, zone, combat, cultivation, ashram, map
- Built LRU cache (max 20 entries, 5MB) with automatic eviction and memory pressure clearing
- Added async asset loader with 2s timeout, crossfade transition (300ms, 0ms reduced motion)
- Created comprehensive contract tests (9 tests passing) covering all acceptance criteria
- Registered `backgrounds.js` in `index.html` after `renderer.js` in script dependency order

## Task Commits

1. **task 1: establish the background system contract** - `src/engine/backgrounds.js`, `tests/backgrounds.test.js` (feat)
2. **task 2: register the background system in dependency order** - `index.html` (feat)

## Files Created/Modified
- `src/engine/backgrounds.js` - Global background system with semantic slots, cache, fallbacks, load manager
- `tests/backgrounds.test.js` - Contract tests for slot resolution, fallback generation, cache bounds, reduced motion, authority boundaries
- `index.html` - Added script tag for backgrounds.js after renderer.js

## Decisions Made
- Semantic slot keys use colon-separated format for namespacing (e.g., `realm:arjuna`, `combat:rakshasa`)
- Fallback generators use canvas gradients for deterministic, zero-dependency rendering
- Cache eviction uses LRU with access-order tracking; memory pressure triggers full clear
- Crossfade implemented via alpha lerp in render helper; reduced motion = instant swap
- All gameplay state access is read-only; background system never mutates G.state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added createRadialGradient to mock canvas context for tests**
- **Found during:** task 1 (test execution)
- **Issue:** Cultivation fallback generator uses `createRadialGradient` which wasn't mocked
- **Fix:** Added `createRadialGradient` to mock context in test file
- **Files modified:** `tests/backgrounds.test.js`
- **Verification:** All 9 tests pass
- **Committed in:** task 1 commit

**2. [Rule 3 - Blocking] Added setTimeout/clearTimeout to test context for async asset loading**
- **Found during:** task 1 (test execution)
- **Issue:** Image.onload uses setTimeout which wasn't available in vm context
- **Fix:** Added setTimeout and clearTimeout to test context globals
- **Files modified:** `tests/backgrounds.test.js`
- **Verification:** Preload test passes with 2s timeout simulation
- **Committed in:** task 1 commit

**3. [Rule 1 - Bug] Fixed loading state tracking in get() and renderBackground()**
- **Found during:** code review (17-REVIEW.md)
- **Issue:** `entry.loading` was always false; crossfade could trigger during active loads
- **Fix:** Modified `get(key)` to return `loading: loading.has(key)` from internal Map
- **Files modified:** `src/engine/backgrounds.js`
- **Verification:** All 9 tests pass; loading state now accurate
- **Committed in:** task 1 commit (post-review fix)

**4. [Rule 1 - Bug] Fixed LRU eviction to handle _authored keys**
- **Found during:** code review (17-REVIEW.md)
- **Issue:** Evicted entries left `_authored` counterparts in cache/accessOrder
- **Fix:** `evictLRU()` now also removes `_authored` keys from cache and accessOrder
- **Files modified:** `src/engine/backgrounds.js`
- **Verification:** All 9 tests pass; cache consistency maintained
- **Committed in:** task 1 commit (post-review fix)

**5. [Rule 2 - Missing Critical] Fixed registerSlot to use per-key custom generators**
- **Found during:** code review (17-REVIEW.md)
- **Issue:** `registerSlot` replaced entire type generator instead of specific key
- **Fix:** Added `customGenerators` Map; `registerSlot` stores per-key; `generateFallback` checks custom first
- **Files modified:** `src/engine/backgrounds.js`, `tests/backgrounds.test.js` (updated test key)
- **Verification:** All 9 tests pass; per-key registration works correctly
- **Committed in:** task 1 commit (post-review fix)

---

**Total deviations:** 5 auto-fixed (2 missing critical, 2 bugs, 1 blocking)
**Impact on plan:** All fixes essential for correctness and cache consistency. No scope creep - all within plan boundaries.

## Issues Encountered
- Test mock context needed expansion for canvas gradient methods and timer functions
- VM context isolation required explicit global registration for setTimeout/clearTimeout
- Code review identified 3 warnings requiring fixes before Plan 17-02 integration

## Next Phase Readiness
- Background system ready for screen integration (Plan 17-02)
- All contract tests passing
- Script order verified in index.html

---
*Phase: 17-canvas-backgrounds-asset-ready*
*Completed: 2026-10-08*