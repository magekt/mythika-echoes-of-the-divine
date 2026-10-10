# Phase 34: Fit & Finish Bundle — Context

## Objective
Navigation, title, map cards, Ashram, and modals look finished at both orientations.

## Requirement
**LAY-06**: Fit-finish bundle — nav More slot labeled with consistent icon; title wordmark legible, footer centered, hero sprite not a bare square; map lock icons, card heights fit content; Ashram single border + currency gold icon; Confirm Creation modal height fits content.

## Depends On
- Phase 30 (Layout Harness Extension — text-bounds proof)
- Phase 31 (Toast Lifecycle Scoping — LAY-05 complete)
- Phase 32 (Combat Layout — LAY-01, LAY-02, LAY-07)
- Phase 33 (Bazaar & Zone Exploration — LAY-03, LAY-04)

## Success Criteria
1. Nav More slot shows a consistent icon+label
2. Title wordmark is legible with centered footer; hero sprite renders through asset pipeline (never a bare square)
3. Map lock icons read correctly; card heights fit content
4. Ashram shows single border with gold coin icon
5. Confirm Creation modal height fits content with buttons following body at fixed gap
6. Shared text-bounds criterion passes for all touched screens at 390x844 and 844x390

## Screens in Scope
- Title (name entry + hero sprite)
- Navigation (More menu + label + icon)
- Travel Map (lock icons, card heights)
- Ashram (border, currency icon)
- Confirm Creation modal (height, buttons)

## Known Issues & Audit Trail
- Title scene: hero sprite renders as bare square (asset pipeline issue)
- Nav More: missing label and inconsistent icon
- Travel Map: lock icons unclear; card heights overflow
- Ashram: border rendering inconsistent; currency icon missing/unclear
- Confirm Creation: modal height doesn't fit content; buttons overlap

## Out of Scope
- New systems or zones
- Combat-rule rewrites
- Framework/renderer changes
- Online/multiplayer

## Technical Context
- All layout fixes validated against text-bounds harness (Phase 30)
- Toast lifecycle stable (Phase 31)
- Combat layout proven at both orientations (Phase 32)
- Bazaar/zone exploration text wrapping proven (Phase 33)
- Use R.text/R.textCenter for all measured text
- Use R.colors, R.fonts, R.radius for styling
- Verify at 390x844 (portrait) and 844x390 (landscape)
