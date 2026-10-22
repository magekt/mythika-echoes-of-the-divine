---
phase: 055
slug: 055-element-burst-particles
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-22
---

# Phase 55 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node built-in `node:test` + `node:assert/strict` |
| **Config file** | none (no package.json / jest / vitest config; AGENTS.md governs test invocation) |
| **Quick run command** | `node --test tests/damage_burst.test.js` |
| **Full suite command** | `node --test tests/*.test.js` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/damage_burst.test.js`
- **After every plan wave:** Run `node --test tests/*.test.js`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~4 seconds

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 055-01-01 | 01 | 1 | DMG-06 | T-055-01 | `R.elementBurst` spawns 6-particle (normal) / 10-particle (crit) radial burst; pre-allocated 60-slot circular buffer; zero per-frame allocation | unit | `node --test tests/damage_burst.test.js` | ✅ | ✅ green |
| 055-01-02 | 01 | 1 | DMG-07 | T-055-02 | `R.reducedMotion()` suppresses burst animation — early return, no slot writes, particles appear and fade without motion | unit | `node --test tests/damage_burst.test.js` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. `tests/damage_burst.test.js` (15 tests) already verifies DMG-06 and DMG-07.

---

## Manual-Only Verifications

All phase behaviors have automated verification. No manual-only verifications required.

---

## Validation Sign-Off

- [x] All tasks have automated verify (`node --test tests/damage_burst.test.js`)
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 covers all requirements (no MISSING references)
- [x] No watch-mode flags
- [x] Feedback latency < 4s (damage burst test ~0.2s, full suite ~3.5s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-22

---
*Phase: 055-element-burst-particles · Validated: 2026-10-22 · Nyquist compliant*
