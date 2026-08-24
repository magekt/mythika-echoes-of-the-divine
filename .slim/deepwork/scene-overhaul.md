# Scene Overhaul — Deepwork Plan

## Goal
Apply the design system standards from DESIGN-SYSTEM.md across the highest-impact scenes, matching the quality bar established in ashram.js.

## Context
- Ashram scene is the reference implementation (3-column section grid, 86px cards, viewport culling, proper clip handling)
- Design system documented in .slim/deepwork/DESIGN-SYSTEM.md
- Verification playbook in .slim/deepwork/verification-playbook.md
- Boot matrix: 3 profiles (desktop, phone, phone-landscape) all must PASS

## Phases

### Phase 1: Combat Scene (combatScene.js) — HIGHEST PRIORITY
- Combat is the core gameplay loop, visible every fight
- Expected issues: stat bars, action buttons, enemy display, damage numbers
- Gate: @oracle review after implementation
- Validation: node --check + verify_matrix.py 3/3 PASS

### Phase 2: Travel Map (travelMap.js)
- Navigation hub used constantly
- Expected issues: zone cards, progress indicators, path drawing
- Gate: @oracle review after implementation
- Validation: node --check + verify_matrix.py 3/3 PASS

### Phase 3: Bazaar/Shop (bazaar.js)
- Monetization-adjacent, needs clean purchase flow
- Expected issues: item cards, buy/sell buttons, gold display
- Gate: @oracle review after implementation
- Validation: node --check + verify_matrix.py 3/3 PASS

## Status
- Phase 1: ✅ COMPLETED — combatScene.js overhauled (PremiumShell panels, ProgressBar HP/MP, 38px+ buttons, viewport culling)
- Phase 2: ✅ COMPLETED — travelMap.js overhauled (zone cards, realm grouping, locked zone dims, ProgressBar progress)
- Phase 3: ✅ COMPLETED — bazaar.js overhauled (3-column category grid, buy/sell tabs, affordable/unaffordable dims)

## Verification
All 3 scenes: syntax OK + boot matrix 3/3 PASS

## Oracle Gate
Pending — reviewing all three overhauls for design system compliance and architectural consistency.
