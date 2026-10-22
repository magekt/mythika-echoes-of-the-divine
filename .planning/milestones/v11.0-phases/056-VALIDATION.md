---
phase: 056
slug: 056-combat-integration-tests
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-22
---

# Phase 56 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node built-in `node:test` + `node:assert/strict` |
| **Config file** | none (no package.json / jest / vitest config; AGENTS.md governs test invocation) |
| **Quick run command** | `node --test tests/damage_fx.test.js` |
| **Full suite command** | `node --test tests/*.test.js` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/damage_fx.test.js`
- **After every plan wave:** Run `node --test tests/*.test.js`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~4 seconds

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 056-01-01 | 01 | 1 | DMG-08 | T-056-01 | `combatScene.js` player attack hit site calls `R.elementBurst` with hero ailment element + `isCrit`; reaction/enemy hit site calls `R.elementBurst` with enemy ailment element + `isCrit` | unit | `node --test tests/damage_fx.test.js` | ✅ | ✅ green |
| 056-01-02 | 01 | 1 | DMG-09 | T-056-02 | `damageFlash` screen shake preserved; gated behind reduced-motion; log band + `UI.Feedback.Toast` flow unchanged | unit | `node --test tests/damage_fx.test.js` | ✅ | ✅ green |
| 056-01-03 | 01 | 1 | DMG-10 | T-056-03 | Dedicated test file (`tests/damage_fx.test.js`) covers elementBurst + damageNumber; full suite green | unit | `node --test tests/damage_fx.test.js` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. `tests/damage_fx.test.js` (11 tests) already verifies DMG-08 through DMG-10.

---

## Manual-Only Verifications

All phase behaviors have automated verification. No manual-only verifications required.

---

## Validation Sign-Off

- [x] All tasks have automated verify (`node --test tests/damage_fx.test.js`)
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 covers all requirements (no MISSING references)
- [x] No watch-mode flags
- [x] Feedback latency < 4s (damage fx test ~0.2s, full suite ~3.5s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-22

---
*Phase: 056-combat-integration-tests · Validated: 2026-10-22 · Nyquist compliant*
