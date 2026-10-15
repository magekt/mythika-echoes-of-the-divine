# Combat Damage Floater — Sketch

**Target:** `src/scenes/combatScene.js` + `src/ui/feedback.js`
**Created:** 2026-10-15

## Variants

| File | Description | Status |
|------|-------------|--------|
| variant-a-minimal.html | Text-only floaters, no icons, simple CSS fade | Complete |
| variant-b-medium.html | Text + element icon chip, medium spring fade | Complete |
| variant-c-rich.html | Full spring physics + element burst particles | Complete |

## Evaluation Criteria

- Visual clarity at 400×720 mobile size
- Performance (per-frame allocation) — matches project constraint
- Consistency with `UI.Component` + mixin pattern
- Reduced motion support (`R.reducedMotion()`)

## Notes

All 3 variants demonstrate increasing complexity. The "zero per-frame allocation" constraint from CONCERNS.md applies to variant C — spring state must be pre-allocated per floater, not allocated each frame.
