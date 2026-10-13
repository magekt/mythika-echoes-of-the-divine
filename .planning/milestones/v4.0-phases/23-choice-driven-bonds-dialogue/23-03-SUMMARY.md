# 23-03 Summary: Bond Matrix Contract

Wave 3 (AFF-02 + AFF-03) complete. Matrix suite locks choice gains, the full bond arc, replay caps, persistence, healing, and pool isolation with no production-code changes.

## Changes
- `tests/bond_matrix.test.js` (only file): 12 cases in two blocks —
  - Matrix: 15-event arc with ordered tierReq; availability ladder (recruit@0, crisis@25, oath@50, null when complete); exactly-once first gain; 3x +1 replays then hard cap; benched completion marks without gains; sub-tier crisis rejected; bond ids absent from ENCOUNTERS/zone/travel pools; hostile-key rejection; no-decay sweep over all annotated ENCOUNTERS choices.
  - Persistence: save/load round trip preserves affinity, bond flags, and replay counters; legacy saves without affinity heal to `{}` with recruit available; malformed maps heal to clamped known-only values.

## Verification
- `node --test tests/bond_matrix.test.js`: 12 pass.
- `node --test tests/bond_matrix.test.js tests/choice_affinity.test.js tests/bond_affinity.test.js tests/affinity_persistence.test.js`: pass.
- `node --test tests/*.test.js`: 241 pass, 0 fail.
- `tools/check_ui_invariants.sh`: 93 files syntax-checked, 20 system scripts, all checks passed.
- No production edits in this wave; no Plan 01/02 defects found.
