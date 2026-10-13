---
phase: 42
slug: adaptive-fill-viewport
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-13
---

# Phase 42 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test + assert/strict (zero deps, repo convention) |
| **Config file** | none — no config needed |
| **Quick run command** | `node --test tests/<area>*.test.js` (targeted, <5s) |
| **Full suite command** | `node --test tests/*.test.js` (~2s; baseline 450 tests, 449 pass, 1 skipped) |
| **Estimated runtime** | ~5 seconds (Node) + ~90s (invariants script) |

---

## Sampling Rate

- **After every task commit:** Run targeted `node --test tests/<area>*.test.js`
- **After every plan wave:** Run full suite + `tools/check_ui_invariants.sh`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds (Node gates; browser matrix only in plan 42-03)

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 42-01-01 | 01 | 1 | LAY-08 | T-42-01 / — | N/A (local viewport math, no untrusted input) | unit | `node --test tests/viewport_dims.test.js` | ❌ W0 | ⬜ pending |
| 42-01-02 | 01 | 1 | LAY-08 | T-42-01 | refit path keeps input mapping exact | unit | `node --test tests/viewport_dims.test.js tests/responsive_screen_matrix.test.js` | ✅ | ⬜ pending |
| 42-02-01 | 02 | 2 | LAY-08 | — | no fixed-position controls outside canvas | unit | `node --test tests/tournament_viewport.test.js` | ❌ W0 | ⬜ pending |
| 42-02-02 | 02 | 2 | LAY-08 | — | landscape rects stay inside short viewport | unit | `node --test tests/responsive_landscape.test.js` | ❌ W0 | ⬜ pending |
| 42-03-01 | 03 | 3 | LAY-08 | T-42-02 | harness page loopback-only, never committed | automated browser | `python3 tools/verify_matrix.py --budget 6000` | ✅ | ⬜ pending |
| 42-03-02 | 03 | 3 | LAY-08 | — | full regression | unit + invariants | `node --test tests/*.test.js && tools/check_ui_invariants.sh` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/viewport_dims.test.js` — stubs for `computeViewportDims` pure function + input-mapping pin (created in plan 42-01 task 1 BEFORE implementation)
- [ ] `tests/tournament_viewport.test.js` — stub asserting no `720` literal in tournament.js (plan 42-02 task 1)
- [ ] `tests/responsive_landscape.test.js` — stubs for landscape `Scene.responsive()` rects (plan 42-02 task 2)
- [ ] No framework installs — existing infrastructure covers all phase requirements.

*Wave 0 lives inside plan 42-01 (test stubs first, per Nyquist RED discipline for the pure function). Plans 42-02/42-03 create their stubs as their own first task.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Edge-to-edge fill with nothing cut at 390×844 / 844×390 | LAY-08 | Visual confirmation of "no dead bars, no clipping" needs human eyes on screenshots | Serve via `python3 -m http.server 3000`, screenshot both sizes in Chrome device emulation, confirm full-bleed + crisp text; `verify_matrix.py` shots in `tools/shots/` serve as the artifact |
| Rotation / browser-chrome refit without blur | LAY-08 | Timing-dependent device behavior | Rotate emulator + toggle device toolbar, confirm refit <200ms, text crisp, no console errors |

None — both rows above are covered by the automated browser gate (`verify_matrix.py` boot + layout sweep) plus shot artifacts; listed here only as the human-readable acceptance reading of those automated results.
