# Phase 23 Verification: Choice-Driven Bonds & Dialogue

## Plan verifies
- 23-01: `node --check` (bond.js, encounter.js, encounters.js, encounterScene.js) + `node --test tests/choice_affinity.test.js tests/bond_affinity.test.js` — 14 pass.
- 23-02: `node --check` (bonds.js, bond.js, encounterScene.js, party.js) + `node --test tests/bond_affinity.test.js tests/choice_affinity.test.js tests/save_coherence.test.js` — green, `git diff --check` clean.
- 23-03: `node --test tests/bond_matrix.test.js tests/choice_affinity.test.js tests/bond_affinity.test.js tests/affinity_persistence.test.js` + `node --test tests/*.test.js` + `tools/check_ui_invariants.sh` — green.

## Final results (2026-10-09)
- `node --test tests/*.test.js`: 241 pass, 0 fail.
- `tools/check_ui_invariants.sh`: 93 files syntax-checked, 20 system scripts, all checks passed.

## Contract truths confirmed
- Active-party heroes gain exactly +2/+4 per annotated choice; absent/benched gain 0; no choice path decreases affinity; 99+4 clamps to 100.
- Recruit scene available after recruitment; crisis at Trusted; oath at Sworn; first completion grants full gain once; replays +1 up to 3 then hard cap with notice.
- Bond scenes reuse encounter UI builders; bond events never appear in ENCOUNTERS/zone/travel pools.
- Affinity, bond flags, and replay counters round-trip through save/load; legacy and malformed saves heal safely.
