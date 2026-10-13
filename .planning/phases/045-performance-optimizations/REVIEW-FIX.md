# Phase 45 REVIEW-FIX Summary

**Date:** 2026-10-13
**Source:** `REVIEW.md` (6 findings: 2 CRITICAL, 3 WARNING, 3 INFO)

## Fixed

| Finding | Severity | Fix | Commit |
|---------|----------|-----|--------|
| CR-01 | CRITICAL | `#status-bar[role="alert"]` now has position + color styling so `failBoot` message is visible | `a761c3a` |
| CR-02 | CRITICAL | `markError` class renamed `load-error` → `error` (matches CSS `#game-container.loading.error`); window capture error listener added to call `markError()` on script failure | `1432bb7` |
| WR-01 | WARNING | `updateOverlay` now uses previous group's `cumDone` for pct and current group name for stage label — no more off-by-one | `5f38a4b` |
| WR-02 | WARNING | `Input.clear()` resets `_lastTapAt` to `-Infinity` so first tap after `gScene` transition is not dropped | `208fc7e` |
| WR-03 | WARNING | `Input._ready = true` removed from `failBoot` — `initInput()` never ran on that path so the flag was meaningless; success path (`bootGame`) still sets it correctly | `1432bb7` |
| IN-02 | INFO | `keydown`/`keyup` document listeners gated on `Input._ready` | `208fc7e` |
| IN-03 | INFO | Test added: `clear()` resets `_lastTapAt` to `-Infinity` | `c069ffb` |

## Not Fixed

| Finding | Reason |
|---------|--------|
| IN-01 | Resolved automatically by CR-02 fix: `markError()` is now called by the window error listener, and the class name is correct — the API surface is now wired end-to-end |

## Verification

- `node --test tests/*.test.js` — **484 pass / 0 fail / 1 skipped**
- `tools/check_ui_invariants.sh` — all checks passed
- `tools/verify_matrix.py --budget 6000` — **3/3 profiles clean** (desktop, phone, phone-land)
