---
phase: 15-character-party-surfaces
plan: 01
subsystem: ui
tags: [canvas, vanilla-javascript, hero-surface, view-model, tdd]

requires:
  - phase: 14-combat-gameplay-readability
    provides: responsive combat bands and readable result surfaces
provides:
  - Read-only HeroSurface selector with compact, detail, and result render variants
  - Defensive hero identity, health, progression, equipment, status, and next-action derivation
  - Dependency-free contract coverage and script-order registration
affects: [15-02, 15-03, character, party, combat, cultivation, equipment]

tech-stack:
  added: []
  patterns: [pure selector/view-model derivation, defensive legacy-state normalization, ordered classic scripts]

key-files:
  created: [src/ui/heroSurface.js, tests/hero_surface.test.js]
  modified: [index.html]

key-decisions:
  - "Keep HeroSurface under the existing global UI namespace and use canonical calcHeroStats and Progression.xpForLevel when available."
  - "Clamp and sanitize presentation values without mutating hero, inventory, save, or gameplay system state."

patterns-established:
  - "HeroSurface.getModel(hero, context) is the shared read-only contract for character-focused screens."
  - "Optional legacy fields degrade to bounded readable labels rather than blocking scene entry."

requirements-completed: [REQ-025]

duration: 1min
completed: 2026-09-20
---

# Phase 15 Plan 01: Canonical Hero Surface Summary

**A defensive, read-only HeroSurface view-model and Canvas renderer now provides consistent hero identity, progression, equipment, status, and next-action data across character-focused screens.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-09-20T19:58:00Z
- **Completed:** 2026-09-20T19:59:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added deterministic `UI.HeroSurface.getModel()` derivation with compact/detail/result rendering variants.
- Added malformed-state fallbacks, bounded display ratios/strings, and read-only authority boundaries.
- Confirmed the shared script loads once before party, equipment, cultivation, and combat consumers.

## Task Commits

1. **task 1: establish the canonical hero surface contract** - `a38f76c` (test), `c6c029a` (feat)
2. **task 2: register the shared surface in dependency order** - `29d8bc0` (feat; registration was included with the existing consumer integration commit)

## Files Created/Modified

- `src/ui/heroSurface.js` - Global read-only hero selector and Canvas render variants.
- `tests/hero_surface.test.js` - Contract coverage for complete, malformed, and null hero state.
- `index.html` - Ordered `heroSurface.js` registration before character scene consumers.

## Verification

- `node tests/hero_surface.test.js` — passed (`hero_surface.test.js: RED contract is active`).
- `node --check src/ui/heroSurface.js` — passed.
- `node --check src/ui/heroSurface.js && node tests/hero_surface.test.js` — passed.
- `git diff --check` — passed.
- Script-order inspection — passed; `heroSurface.js` occurs once before party, equipment, cultivation, and combat scripts.

## Decisions Made

- Preserved the vanilla Canvas/global-script architecture; no imports, exports, DOM screen rewrite, or parallel state store were introduced.
- Kept gameplay ownership in canonical systems and restricted the surface to read-only derivation.

## Deviations from Plan

None - plan executed exactly as written. Existing task commits were verified and retained; no unrelated working-tree changes were staged.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The shared contract is available before all character-focused scene scripts and is ready for subsequent surface integrations.

## Self-Check: PASSED

- `src/ui/heroSurface.js` exists.
- `tests/hero_surface.test.js` exists.
- `index.html` contains one ordered `heroSurface.js` entry.
- Commits `a38f76c`, `c6c029a`, and `29d8bc0` exist in git history.

---
*Phase: 15-character-party-surfaces*
*Completed: 2026-09-20*
