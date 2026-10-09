# Phase 17 Verification Record

**Phase:** 17-canvas-backgrounds-asset-ready
**Requirement:** REQ-028, REQ-029
**Status:** Automated contracts complete; human browser evidence deferred

---

## Automated Verification (Complete)

### Contract Tests
- ✅ `tests/backgrounds.test.js` — 9/9 tests pass (slot resolution, fallbacks, cache bounds, reduced motion, authority)
- ✅ `tests/backgrounds_integration.test.js` — 13/13 tests pass (cross-scene slots, contrast, reduced motion, allocations, no mutations)
- ✅ `tests/backgrounds_browser_matrix.test.js` — 11/11 tests pass (viewports, inputs, scenes, slots, moments, responsive, reduced motion, contrast, allocation bounds, prior phase preservation)

### Syntax & Static Checks
- ✅ `node --check src/engine/backgrounds.js` — passes
- ✅ `node --check src/scenes/ashram.js` — passes
- ✅ `node --check src/scenes/travelMap.js` — passes
- ✅ `node --check src/scenes/zoneExploration.js` — passes
- ✅ `node --check src/scenes/combatScene.js` — passes
- ✅ `node --check src/scenes/party.js` — passes
- ✅ `node --check src/scenes/equipment.js` — passes
- ✅ `node --check src/scenes/cultivationScene.js` — passes
- ✅ `bash tools/check_ui_invariants.sh` — passes

### Full Test Suite
- ✅ `node --test tests/*.test.js` — 127/127 tests pass

---

## Human Browser Verification (Deferred)

### Required Evidence (per 17-03-PLAN.md Task 2)

**Browser Matrix: 7 scenes × 5 viewports × 3 input modes = 105 combinations**

| Scene | 400×720 | 540×900 | 720×400 | 1024×768 | 1440×900 |
|-------|---------|---------|---------|----------|----------|
| Ashram | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Travel Map | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Zone Exploration | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Combat | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Party | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Equipment | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Cultivation | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

**Verification Steps per Combination:**
1. Background renders with fallback/authored imagery
2. Character moments visible in designated safe zones
3. Text/controls readable (contrast ≥ 4.5:1)
4. No overlap with Phase 14/15/16 action bands
5. Touch/mouse/keyboard parity
6. Reduced motion: instant crossfade, no parallax/drift
7. `?probe` shows stable memory, no allocation growth
8. Console clean (no unexpected errors)

### Reduced Motion Verification
- [ ] Enable reduced motion in Settings
- [ ] Verify crossfade instant (0ms)
- [ ] Verify no parallax/drift on any background
- [ ] Verify character moments static
- [ ] Verify particles/static fallbacks only

### Save/Reload Verification
- [ ] Fresh save → load → backgrounds render correctly
- [ ] Legacy save → load → backgrounds render correctly
- [ ] Direct boot (no SW) → backgrounds render correctly
- [ ] Cached boot (active SW) → backgrounds render correctly

### Deferred Items
- Human browser evidence collection
- Console/probe captures for all 105 combinations
- Final sign-off on REQ-028/REQ-029

---

## Deferred to Phase 20
Final browser acceptance matrix (including Phase 17) will be executed in Phase 20 Plan 3 (20-03-PLAN.md) as part of the full-loop acceptance for all 10 client/profile combinations.