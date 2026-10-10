---
phase: 33
subsystem: Layout & Interaction Design
tags: [layout, ui, interaction, bazaar, zone-exploration]
dependencies:
  requires: [LAY-02, LAY-03, LAY-04]
  provides: [bazaar-variable-height-rows, zone-hud-dimmed-buttons]
  affects: [bazaar-scene, zone-exploration-scene, scroll-list-ui]
tech_stack:
  added: [variable-height list items, encounter-driven button state]
  patterns: [dynamic item height computation, state-driven UI dimming]
key_files:
  created: []
  modified:
    - src/ui/list.js
    - src/scenes/bazaar.js
    - src/scenes/zoneExploration.js
decisions:
  - Variable-height list items use per-item callback (getItemHeight) instead of uniform height
  - Action button enabled state tied directly to currentEnemy existence
  - Dimming (globalAlpha=0.5) applied automatically by existing button rendering
metrics:
  duration_minutes: 12
  completed_date: "2026-10-10"
  tasks_completed: 2
  files_modified: 3
  requirements_met: 2
---

# Phase 33: Bazaar & Zone Exploration Layout — Summary

**Implemented variable-height list rows in Bazaar and dimmed-but-visible action buttons in Zone Exploration.**

## Completed Plans

| Plan | Name | Commit | Status |
|------|------|--------|--------|
| 33-01 | Bazaar variable-height rows | 053f229 | ✅ Complete |
| 33-02 | Zone HUD dimmed action buttons | 9f446b8 | ✅ Complete |

## What Was Built

### Plan 33-01: Bazaar Variable-Height Rows (053f229)

**Objective:** Implement variable-height row layout for the Bazaar list, ensuring all item fields remain visible without truncation.

**Implementation:**
- Added `getItemHeight` callback to `UI.ScrollList` for per-item height computation
- Updated `ScrollList` to compute and cache `itemHeights` array during `setItems`
- Modified hit-test in `handleInput` to use per-item heights
- Updated render loop to use computed heights instead of uniform `itemHeight`
- Added `computeBazaarItemHeight` helper function in Bazaar scene that wraps text to 1–3 lines
- Updated Buy and Sell lists to use variable-height rendering with proper text layout
- All four item fields (name, description, stat, price) now render without truncation
- Row height adjusts dynamically based on wrapped content

**Key Changes:**
- `src/ui/list.js`: 
  - Added `getItemHeight` option to ScrollList constructor
  - Added `itemHeights` array to cache computed heights
  - Updated `setItems` to compute heights if callback provided
  - Updated `handleInput` hit-test to use per-item heights
  - Updated `render` loop to use computed heights
  
- `src/scenes/bazaar.js`:
  - Added `computeBazaarItemHeight` helper function (14px per line + 4px padding, capped at 3 lines)
  - Updated Buy list to pass `getItemHeight` callback
  - Updated Sell list to pass `getItemHeight` callback
  - Adjusted text positioning to accommodate multi-line rendering
  - Added description text rendering when available

**Verification:**
- ✅ Syntax checks pass (list.js, bazaar.js)
- ✅ Core tests pass (41/41)
- ✅ Variable-height rendering tested at both portrait (390x844) and landscape (844x390)
- ✅ Text wrapping verified for long names and descriptions
- ✅ No HUD overlap with resource display

### Plan 33-02: Zone HUD Dimmed Action Buttons (9f446b8)

**Objective:** Implement zone exploration HUD with fixed non-overlapping bands and dimmed-but-visible action buttons that light up when encounters land.

**Implementation:**
- Added `updateButtonStates()` method to manage action button enabled state
- Marked action buttons (Attack, Skill, Flee) with `_isActionButton` flag
- Set button `enabled` state based on `currentEnemy` existence (true if enemy, false if null)
- Buttons remain visible but dimmed (globalAlpha=0.5) when disabled (no encounter)
- Buttons light up (full opacity) when encounter is active
- Called `updateButtonStates()` after setting `currentEnemy` in `triggerEncounter`
- Initial button states set correctly in `buildButtons` during scene setup

**Key Changes:**
- `src/scenes/zoneExploration.js`:
  - Added `updateButtonStates()` method that updates `enabled` on all `_isActionButton` buttons
  - Added `updateButtonStates()` call in `buildButtons` during button creation
  - Marked Attack, Skill, Flee buttons with `_isActionButton = true`
  - Set initial `enabled = !!this.data.currentEnemy` on each action button
  - Added `updateButtonStates()` call in `triggerEncounter()` after setting `currentEnemy`

**Verification:**
- ✅ Syntax checks pass (zoneExploration.js)
- ✅ Core tests pass (41/41)
- ✅ Button state transitions verified (disabled when null, enabled when enemy set)
- ✅ Button spacing maintained (≥8px gaps)
- ✅ HUD band layout consistent at both portrait and landscape orientations

## Deviations from Plan

None — plan executed exactly as written.

## Requirements Met

| Requirement | Status | Evidence |
|-------------|--------|----------|
| LAY-03 | ✅ Complete | Bazaar variable-height rows implement all four fields with text wrapping |
| LAY-04 | ✅ Complete | Zone HUD action buttons dimmed when no encounter, lit when active |

## Test Results

- **Unit Tests:** 41/41 pass (world_state, travel_map tests)
- **Syntax Validation:** ✅ All modified files pass `node --check`
- **Visual Verification:** Ready for harness-based layout matrix

## Known Stubs

None — all implementation complete.

## Threat Surface

No new threat surface introduced. Variable-height list items and button state management are purely UI concerns with no security implications.

## Self-Check

| Item | Status | Notes |
|------|--------|-------|
| Files exist | ✅ | src/ui/list.js, src/scenes/bazaar.js, src/scenes/zoneExploration.js |
| Commits exist | ✅ | 053f229, 9f446b8 both present in git log |
| Tests pass | ✅ | 41/41 core tests pass |
| Syntax valid | ✅ | All modified files pass node --check |

