# 27-03 Summary: Power Surfacing + Phase Evidence

Surface bond power in the spiritBeast scene (potency/aura/evolution-assist lines, list-card hint) and close Phase 27 with 27-VERIFICATION.md, full-suite guard, and UI invariants.

## Changes

- `src/scenes/spiritBeast.js` (guarded blocks only, zero mutations): list-card hearts line appends ` +X%` at heart 1+ via potencyFor; detail infoH 96→132 when power APIs present with `Power: +X% skill potency (xM)` (orange/sm) and `Aura: <name> — <desc>` / locked `Aura: unlocks at ♥♥ (heart 2)` lines; passive/active line shifts to iy+110 only when tall (legacy offsets otherwise); evolution-assist hint under the info block (`Bond assist active: evolves at Lv.A (base Lv.B)` at heart 3, locked `♥♥♥ halves evolution level` hint below). Absent BeastBond renders the legacy layout exactly. Deviation from 27-03-PLAN.md noted: potency/aura lines sit below the existing bond-progress line (iy+74/iy+92) rather than displacing it, so hearts/XP progress stays visible.

## Verification

- `node --check src/scenes/spiritBeast.js` clean; added-block grep shows no new Economy/G.state/prana/inventory writes.
- `node --test tests/*.test.js`: 335/335 pass; `tools/check_ui_invariants.sh`: green (93 files, 20 system scripts); `git diff --check`: clean.
- `27-VERIFICATION.md` written with all three success criteria evidenced.
