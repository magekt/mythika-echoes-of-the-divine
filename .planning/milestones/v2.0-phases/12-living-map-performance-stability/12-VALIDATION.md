# Phase 12 Validation Architecture

**Phase:** 12 — Living Map Performance & Stability
**Requirement:** REQ-020 — Smooth, Stable Map Rendering
**Date:** 2026-09-18

---

## Validation Dimensions

### Dimension 1: Automated Test Suite
- **Gate:** `node --test tests/*.test.js` passes 48/48 (growing with new tests)
- **Scope:** All implementation tasks carry automated verify steps
- **Owner:** Per-plan `<verify><automated>` blocks

### Dimension 2: Performance Probe
- **Gate:** `?probe` URL param shows stable FPS (>30fps sustained) on mid-range mobile profile
- **Scope:** Plan 12-02 adds `?probe&map` for map-specific FPS monitoring
- **Owner:** Manual verification checkpoint in 12-02

### Dimension 3: Scene Lifecycle Integrity
- **Gate:** Repeated enter/leave cycles do not accumulate buttons, effects, timers, or stale selections
- **Scope:** Plan 12-02 adds automated lifecycle cycle test
- **Owner:** Automated test in `tests/travel_map_lifecycle.test.js`

### Dimension 4: Reduced-Motion Compliance
- **Gate:** All animations respect `R.reducedMotion()` — no animated elements in reduced-motion mode
- **Scope:** Plan 12-02 fixes MagneticBtn spring and Fade transition to check reducedMotion
- **Owner:** Automated test + manual browser verification

---

## Plan-to-Dimension Mapping

| Plan | Dim 1 | Dim 2 | Dim 3 | Dim 4 |
|------|-------|-------|-------|-------|
| 12-01 (render optimization) | ✓ automated | — | — | — |
| 12-02 (lifecycle + motion) | ✓ automated | ✓ checkpoint | ✓ automated | ✓ automated + manual |

---

## Verification Commands

```bash
# Full suite (all plans)
node --test tests/*.test.js

# Map perf tests only (after 12-01)
node --test tests/travel_map_perf.test.js

# Map lifecycle tests only (after 12-02)
node --test tests/travel_map_lifecycle.test.js

# Performance probe (manual)
# Open: index.html?probe&map
# Navigate to map, pan/zoom, open details, resolve events
# Check console for FPS > 30 sustained
```

---

## Exit Criteria

Phase 12 is complete when:
1. All 2 plans executed and committed
2. Full test suite green (48+ tests, 0 failures)
3. `?probe&map` shows stable FPS on representative mobile profile
4. Reduced-motion mode verified (no animated elements, all state distinctions preserved)
5. Manual browser verification checkpoint passed (plan 12-02, autonomous: false)
