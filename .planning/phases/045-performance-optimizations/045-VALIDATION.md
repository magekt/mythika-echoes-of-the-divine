---
phase: 045
slug: performance-optimizations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-17
---

# Phase 045 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Regenerated from RESEARCH.md "## Validation Architecture" (was missing prefixed file).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Native JavaScript assertions |
| **Config file** | none — see Wave 0 |
| **Quick run command** | `node --test tests/world_state.test.js` |
| **Full suite command** | `node --test tests/*.test.js` |

---

## Sampling Rate

- **After every task commit:** Visual inspection of changed files
- **After every plan wave:** Manual verification via curl and local server testing
- **Before `/gsd-verify-work`:** Full verification matrix pass

---

## Per-task Verification Map

| task ID | Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|---------|-------------|----------|-----------|-------------------|-------------|--------|
| PERF-01 | JS assets served with Brotli/Gzip encoding | integration | Manual verification via `curl -I` on deployed URL | ❌ Wave 0 | ⬜ pending |
| PERF-02 | Preconnect tag present in HTML head | unit | `grep '<link rel="preconnect" href="https://www.gstatic.com">' index.html` | ❌ Wave 0 | ⬜ pending |
| PERF-03 | Firebase module script moved to end of body | unit | `grep -n '<script type="module">' index.html \| tail -1` | ❌ Wave 0 | ⬜ pending |
| PERF-04 | ?probe logs total boot duration | integration | `python3 tools/verify_matrix.py --budget 6000` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_perf_compression.js` — covers PERF-01
- [ ] `tests/test_perf_preconnect.js` — covers PERF-02
- [ ] `tests/test_perf_script_location.js` — covers PERF-03
- [ ] `tests/test_perf_boot_timing.js` — covers PERF-04
- [ ] Framework install: `none — using native test runner` — if none detected

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| JS Brotli/Gzip compression | PERF-01 | Deployment-dependent headers | `curl -I` on deployed URL, check Content-Encoding |
| Boot duration logging | PERF-04 | Runtime timing | Run `python3 tools/verify_matrix.py --budget 6000`, check boot-total log |
