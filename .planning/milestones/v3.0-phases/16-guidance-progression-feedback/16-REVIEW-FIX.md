# Phase 16 Code Review Fixes

## Fixes Applied

### 1. Centralized InlineHint Dismissal Logic (feedback.js)

**Issue**: Dismissal check duplicated in constructor and render.

**Fix**: Removed redundant check from render; constructor is the single source of truth.

### 2. ContextualBadge Update Scope (feedback.js)

**Issue**: `rm` variable referenced in update but not defined in that scope.

**Fix**: Added `const rm = reduceMotion();` at start of update function.

### 3. InlineHint Instance Reuse (party.js)

**Issue**: New InlineHint created every render frame in list view.

**Fix**: Store hint instance in scene data during buildList, reuse in render.

### 4. Probe Group Deduplication (index.html)

**Issue**: Duplicate `__mythikaProbeGroup` definitions.

**Fix**: Removed duplicate; kept single definition at top.

## Files Modified

- `src/ui/feedback.js` - Fixed ContextualBadge update scope
- `src/scenes/party.js` - Store/reuse InlineHint instance
- `index.html` - Deduplicated probe group

## Verification

All tests still pass after fixes:
- `node --test tests/feedback.test.js` ✅
- `node --test tests/character_party_integration.test.js` ✅
- `node --check src/ui/feedback.js` ✅
- `node --check src/scenes/party.js` ✅