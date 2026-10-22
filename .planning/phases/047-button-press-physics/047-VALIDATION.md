---
phase: 047
slug: button-press-physics
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-21
---

# Phase 047 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Reconstructed from PLAN.md/SUMMARY.md artifacts (no pre-existing VALIDATION.md).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner (`node:test` + `node:assert/strict`) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `node --test tests/button.test.js` |
| **Full suite command** | `node --test tests/*.test.js` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/button.test.js`
- **After every plan wave:** Run `node --test tests/*.test.js`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** < 10 seconds

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 047-01-01 | 01 | 1 | BTN-01 | T-047-02 / — | UI.Button uses centered spring scale (0.97 target); null-safe _visualScale/_scaleVel allocated once at construction | unit | `node --test tests/button.test.js` | ✅ present | ✅ green |
| 047-01-01 | 01 | 1 | BTN-02 | — / — | UI.MagneticBtn trailing icon always rendered when _trailingIcon set; wrapped in nested 24px circle with diagonal translate + scale on press driven by existing spring state | unit | `node --test tests/button.test.js` | ✅ present | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-21
