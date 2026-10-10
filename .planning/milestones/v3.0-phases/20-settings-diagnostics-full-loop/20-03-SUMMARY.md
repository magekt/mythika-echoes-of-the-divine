# 20-03 Summary — Final Acceptance Browser Matrix

**Plan:** 20-03-PLAN.md (wave 3, depends on 20-02) | **Requirements:** REQ-033, REQ-034 | **Date:** 2026-10-08

## What was built

- `tests/final_acceptance_browser_matrix.test.js` (new): 8 automated contract
  tests — matrix shape (2 clients × 5 profiles = 10 combinations, full 8-step
  journey each), journey ordering (save < reload < return), acceptance thresholds
  (FPS ≥ 30 p95, frame ≤ 33ms p95, touch ≥ 38px), scene/save/probe/reduced-motion
  source support, dense-state systems present, and `20-VERIFICATION.md` evidence
  slots for every profile/client.
- `.planning/phases/20-settings-diagnostics-full-loop/20-VERIFICATION.md` (new):
  automated evidence record + per-combination browser evidence tables (F1–F5
  fresh, W1–W5 existing-worker) with console/probe/dense/motion/cache columns.

## Verify results

- `node tests/final_acceptance_browser_matrix.test.js` — 8/8 pass.
- Full suite `node --test tests/*.test.js` — 201/201 pass.
- `tools/check_ui_invariants.sh` — all checks passed.

## Human gate (blocking, per plan)

- Plan task 2 (`checkpoint:human-verify`) is NOT complete: all 10 browser rows in
  `20-VERIFICATION.md` are `pending`. To close: serve via
  `python3 -m http.server 3000`, run the full journey per combination, record
  console/`?probe` captures, mark each row pass/fail. Milestone v3.0 sign-off
  (REQ-021 → REQ-034) depends on this gate.
