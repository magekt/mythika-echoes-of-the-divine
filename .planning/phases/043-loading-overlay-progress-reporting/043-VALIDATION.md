---
phase: 043
slug: loading-overlay-progress-reporting
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-17
---

# Phase 043 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Regenerated from RESEARCH.md "## Validation Architecture" (was missing prefixed file).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Native Node test (existing) |
| **Config file** | none — see Wave 0 |
| **Quick run command** | `node --test tests/world_state.test.js` |
| **Full suite command** | `node --test tests/*.test.js` |

---

## Sampling Rate

- **After every task commit:** Manual verification of loading overlay during development builds
- **After every plan wave:** Visual inspection of loading states in pre-release builds
- **Before `/gsd-verify-work`:** Manual verification checklist

---

## Per-task Verification Map

| task ID | Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|---------|-------------|----------|-----------|-------------------|-------------|--------|
| LOAD-01 | Visible loading overlay with live progress | Observe overlay during boot | manual/visual | — | ❌ Wave 0 | ⬜ pending |
| LOAD-02 | Overlay reports current stage as each group finishes | Verify group name changes | manual/visual | — | ❌ Wave 0 | ⬜ pending |
| LOAD-03 | Overlay dismisses when G.frameCount >= 1 AND Input._ready === true | Check boot completion conditions | integration | — | ❌ Wave 0 | ⬜ pending |
| LOAD-04 | Failed critical script shows visible error message | Simulate script 404, check overlay | manual/visual | — | ❌ Wave 0 | ⬜ pending |
| LOAD-05 | Failed-script handling sets Input._ready = true | Verify input not blocked after failure | integration | — | ❌ Wave 0 | ⬜ pending |
| INPUT-03 | Input._ready = true set in main.js after scene registration | Check flag state post-registration | integration | — | ❌ Wave 0 | ⬜ pending |
| INPUT-04 | Input._ready = true also set in failBoot path | Check flag state in failBoot | integration | — | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_loading_overlay.js` — covers REQ-LOAD-01 through REQ-LOAD-05
- [ ] `tests/test_input_ready.js` — covers REQ-INPUT-03 and REQ-INPUT-04
- [ ] Framework install: `none` — uses existing test infrastructure

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visible loading overlay | LOAD-01/02 | Visual/canvas render | Observe overlay during boot, watch group name change |
| Failed-script error display | LOAD-04 | Simulated 404 | Simulate a critical script 404, check overlay error message |
| Boot completion dismissal | LOAD-03 | Timed condition | Wait for G.frameCount >= 1 and Input._ready === true, confirm overlay dismisses |
