# Phase 20 — Final Acceptance Verification (v3.0 Full Loop)

**Date:** 2026-10-08
**Scope:** REQ-033, REQ-034; final sign-off for REQ-021 → REQ-034
**Matrix:** 2 clients (fresh, existing-worker) × 5 profiles = 10 combinations
**Journey per combination:** start/load → navigate (ashram→map→zone→combat) →
inspect (party, equipment, cultivation, map) → act (equip, meditate, attack,
resolve event) → outcome (reward, breakthrough, influence) → save → reload →
return to same context
**Acceptance per combination:** console clean (no unexpected errors),
`?probe` FPS ≥ 30 p95 / frame ≤ 33ms p95, dense states readable
(5 heroes, full equipment, max events/landmarks), reduced motion correct,
existing-worker cache activation verified.

## Automated evidence (Node, 2026-10-08)

- `node tests/diagnostics.test.js` — 9/9 pass (toggle, bounds 300/50/200/20,
  invariants, panel access, read-only, hooks).
- `node tests/diagnostics_integration.test.js` — 9/9 pass (script-group order,
  script registration, transition/input/persistence hooks, zero raw hex,
  probe independence, save/load round-trip, wrapper transparency).
- `node tests/final_acceptance_browser_matrix.test.js` — 8/8 pass (this file
  satisfies the "verification record exists" test).
- `node --test tests/*.test.js` — full suite (see 20-02-SUMMARY.md).
- `tools/check_ui_invariants.sh` — syntax + script-loading invariants.
- `node --check` on all changed/added JS files.

## Browser evidence (human gate)

Serve with `python3 -m http.server 3000`, then per combination follow the
journey in 20-03-PLAN.md task 2. Record viewport, client, console (filtered),
`?probe` summary, pass/fail. Status `pending` = not yet run in a browser.

### fresh client

| # | Profile | Viewport | Console | ?probe FPS p95 | Dense | Reduced motion | Status |
|---|---------|----------|---------|----------------|-------|----------------|--------|
| F1 | phone-portrait | 400x720 | pending | pending | pending | pending | pending |
| F2 | phone-tall | 540x900 | pending | pending | pending | pending | pending |
| F3 | landscape | 720x400 | pending | pending | pending | pending | pending |
| F4 | desktop-small | 1024x768 | pending | pending | pending | pending | pending |
| F5 | desktop-wide | 1440x900 | pending | pending | pending | pending | pending |

### existing-worker client (active SW, primed cache)

| # | Profile | Viewport | Console | ?probe FPS p95 | Dense | Reduced motion | Cache activation | Status |
|---|---------|----------|---------|----------------|-------|----------------|------------------|--------|
| W1 | phone-portrait | 400x720 | pending | pending | pending | pending | pending | pending |
| W2 | phone-tall | 540x900 | pending | pending | pending | pending | pending | pending |
| W3 | landscape | 720x400 | pending | pending | pending | pending | pending | pending |
| W4 | desktop-small | 1024x768 | pending | pending | pending | pending | pending | pending |
| W5 | desktop-wide | 1440x900 | pending | pending | pending | pending | pending | pending |

**Gate:** plan 20-03 task 2 is a blocking human-verify checkpoint. Automated
contracts above pass; browser rows remain `pending` until a human runs the
10-combination journey and marks each row pass/fail with console/probe captures.
