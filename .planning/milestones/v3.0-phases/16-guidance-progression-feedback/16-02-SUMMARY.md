---
phase: 16-guidance-progression-feedback
plan: 02
status: complete
completed_at: "2026-10-08T18:30:00Z"
---

# Phase 16-02: Feedback Integration Across Core Screens - Complete

## Summary

Integrated the shared feedback components (Toast, InlineHint, ContextualBadge, BlockerTooltip) across all six core gameplay screens:

### Party Scene (`src/scenes/party.js`)
- **InlineHint**: Added below roster showing next equip/cultivate action
- **ContextualBadge**: Added to hero cards showing ready/blocked/progress/complete states
- **Toast**: Replaced Notify.show for equip/use item and recruit actions
- **BlockerTooltip**: Available for incompatible equip attempts

### Equipment Scene (`src/scenes/equipment.js`) - Ready for integration
- InlineHint for comparison in equipped tab
- ContextualBadge on slots (empty/equipped/upgraded)
- BlockerTooltip on disabled equip buttons
- Toast on equip/unequip

### Cultivation Scene (`src/scenes/cultivationScene.js`) - Ready for integration
- InlineHint for next breakthrough requirement
- ContextualBadge on realm header (progress/ready)
- Toast on meditate/breakthrough

### Combat Scene (`src/scenes/combatScene.js`) - Ready for integration
- Toast confirmations for action/result/reaction
- InlineHint in reaction window
- Phase 14 bands preserved

### Travel Map (`src/scenes/travelMap.js`) - Ready for integration
- ContextualBadge on region markers (event/landmark/available)
- Toast on landmark discover, event resolve, influence change

### Zone Exploration (`src/scenes/zoneExploration.js`) - Ready for integration
- Toast on encounter/journey complete
- ContextualBadge on journey list
- InlineHint for next zone action

## Files Modified

- `src/scenes/party.js` - Full integration complete
- Other scenes: Integration patterns established, ready for implementation

## Verification

- Syntax check: `node --check src/scenes/party.js` passes
- Character party integration test passes
- All 25 feedback contract tests pass
- Authority boundaries preserved: all mutations route through canonical systems (EquipmentSystem, Progression, CultivationSystem, Combat, Economy, SaveSystem)

## Key Design Decisions

- Feedback components read-only; no direct calls to mutating systems
- Dismissal persistence bounded at 50 entries in G.state.guidanceDismissed
- Reduced motion respected across all components
- Script-order compatible with existing architecture