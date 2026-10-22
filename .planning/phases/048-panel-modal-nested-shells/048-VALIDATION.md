---
phase: 048
slug: 048-panel-modal-nested-shells
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-22
---

# Phase 048 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node built-in `node:test` + `node:assert/strict` |
| **Config file** | none (no package.json / jest / vitest config; AGENTS.md governs test invocation) |
| **Quick run command** | `node --test tests/panels.test.js` |
| **Full suite command** | `node --test tests/*.test.js` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/panels.test.js`
- **After every plan wave:** Run `node --test tests/*.test.js`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 048-01-01 | 01 | 1 | PAN-01 | T-048-01 | Panel renders through R.doubleBezel nested shell (shell + core + top highlight); enterProgress reaches 1 under reduced motion; children render at full alpha | unit | `node --test tests/panels.test.js` | ✅ | ✅ green |
| 048-01-02 | 01 | 1 | PAN-02 | T-048-02 | Modal overlay backdrop alpha interpolates via R.easePremium(_overlayProgress) over 250ms ramp; instant (=1) under reduced motion | unit | `node --test tests/panels.test.js` | ✅ | ✅ green |
| 048-01-03 | 01 | 1 | PAN-03 | T-048-02 | Modal buttons enter with 40ms stagger cascade; button[i] starts 250ms + 40ms*i; ramps over 400ms window; all complete by cascade end | unit | `node --test tests/panels.test.js` | ✅ | ✅ green |
| 048-01-04 | 01 | 1 | PAN-04 | T-048-03 | Reduced motion is media-aware via R.reducedMotion() (G.state.reduceMotion AND matchMedia prefers-reduced-motion); instant progress under reduced motion | unit | `node --test tests/panels.test.js` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files, fixtures, or framework installs needed; `tests/panels.test.js` (5 tests) already verifies PAN-01 through PAN-04.

---

## Manual-Only Verifications

All phase behaviors have automated verification. No manual-only verifications required.

---

## Validation Sign-Off

- [x] All tasks have automated verify (`node --test tests/panels.test.js`)
- [x] Sampling continuity: every task has automated verify (no 3 consecutive tasks without)
- [x] Wave 0 covers all requirements (no MISSING references)
- [x] No watch-mode flags
- [x] Feedback latency < 5s (full suite ~5s, panels test ~0.2s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-22

---
*Phase: 048-panel-modal-nested-shells · Validated: 2026-10-22 · Nyquist compliant*
