---
phase: 044
slug: input-guarding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-17
---

# Phase 044 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Regenerated from RESEARCH.md "## Validation Architecture" (was missing prefixed file).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js test runner (built-in) |
| **Config file** | none — see Wave 0 |
| **Quick run command** | `node --test tests/engine/input.test.js` |
| **Full suite command** | `node --test tests/*.test.js` |

---

## Sampling Rate

- **After every task commit:** `node --test tests/engine/input.test.js`
- **After every plan wave:** `node --test tests/*.test.js`
- **Before `/gsd-verify-work`:** Full suite green

---

## Per-task Verification Map

| task ID | Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|---------|-------------|----------|-----------|-------------------|-------------|--------|
| INPUT-01 | No user input processed while `Input._ready` is `false` | unit | `node --test tests/engine/input.test.js::testInputGuardedDuringBoot -x` | ❌ Wave 0 | ⬜ pending |
| INPUT-05 | `Input._ready` checked at UI consumer side | unit | `node --test tests/ui/button.test.js::testHandleButtonsRespectsReady -x` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/engine/input.test.js` — covers INPUT-01 (input guarding during boot)
- [ ] `tests/ui/button.test.js` — covers INPUT-05 (UI consumer readiness checks)
- [ ] Framework install: `none — Node test runner built-in` — if none detected

---

## Manual-Only Verifications

None — all phase requirements are unit-testable.
