---
phase: 30-layout-harness-extension
plan: "02"
subsystem: testing
tags: [combat-sim, vm, determinism, BAL-01, BAL-02, LAY-00]

# Dependency graph
requires:
  - phase: 30-layout-harness-extension context
    provides: [vm-concat decision, seeded-RNG rule, BAL metric set, base-pacing scope]
provides:
  - [headless 200-fight simulator, BAL metric JSON, determinism + shape contract tests]
affects: [phase-35 balance tuning, 30-03 end-to-end sim check]

# Tech tracking
tech-stack:
  added: []
  patterns: [index.html-order vm concatenation, in-context seeded RNG, post-eval side-effect stubs, stdout-pure JSON reports]

key-files:
  created: [tools/combat_sim.js, tests/combat_sim.test.js]
  modified: []

key-decisions:
  - "Skip bond.js (BondSystem+BeastBond absent = base pacing), main.js (boot IIFE), firebase-config/auth (network) — everything else in index.html order"
  - "Mirror triggerEncounter RNG order exactly (pool pick, difficulty, 25% elite, pctGain) so progress numbers are honest"
  - "Fixed transparent policy: heroes basic-attack random target, enemies enemyAI, 200-action cap; stdout JSON only, audit to stderr"

patterns-established:
  - "Sim reads game sources read-only; combatants deep-cloned per fight; no boot/loop/save writes"
  - "Determinism proven by byte-identical repeat runs, locked by contract test"

requirements-completed: [LAY-00]

# Metrics
duration: 35min
completed: 2026-10-09
---

# Phase 30 Plan 02 Summary

**Headless 200-fight combat simulator driving the real Combat pipeline in a seeded vm context: deterministic BAL metric JSON with zero src/ changes.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-10-09
- **Completed:** 2026-10-09
- **Tasks:** 3/3
- **Files modified:** 2 created, 0 game-code touched (`git status` shows only the two new files plus 30-01 harness files)

## Accomplishments

- `tools/combat_sim.js`: parses index.html script order at runtime, concatenates 90 sources into one vm script (4 skips logged), mulberry32 replaces Math.random in-context pre-eval, post-eval no-op stubs (Audio.*, R.triggerComboFlash, Progression.perkValue→0, AURAS.getTotal→0), BondSystem/BeastBond verified absent. Campaign driver: Lv1 arjuna (equipped slots nulled) vs mirrored Aryavarta encounters, fixed policy, 200-action cap, per-fight HP-loss/deaths/turns/pctGain. Emits `{seed, fights, policy, partySize, metrics:{meanHpLossFirstFive, deathRate, fightsToClear, meanPctGain, perFight}, provenance}`.
- Baseline numbers (seed 1, 200 fights, 0.13s): meanHpLossFirstFive 0.3925, deathRate 0.07 (14 deaths), fightsToClear 8 (meanPctGain 13.69), capHits 0. Deterministic across runs (diff byte-identical).
- `tests/combat_sim.test.js`: 5 tests green — same-seed identical stdout, cross-seed finite metrics, BAL-metric shape, 30s speed guard, honesty guard (bondSystemsAbsent, no NaN/undefined, enemies from zone-1 table).

## Verification

- `node tools/combat_sim.js --seed 1 --fights 200` twice → `diff` identical (DETERMINISTIC), < 1s (budget 60s)
- `node --test tests/combat_sim.test.js`: 5/5 pass
- Full suite `node --test tests/*.test.js`: 402/402 pass; `tools/check_ui_invariants.sh` green
- No BAL-01 threshold asserts here by design (Phase 35 owns tuning asserts)

## Files changed

- created tools/combat_sim.js, tests/combat_sim.test.js
