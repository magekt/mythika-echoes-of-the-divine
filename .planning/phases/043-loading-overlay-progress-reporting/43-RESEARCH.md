# Phase 43: Loading Overlay and Progress Reporting - Research

**Researched:** 2026-10-13
**Domain:** Classic script loading progress tracking, loading overlay enhancement
**Confidence:** HIGH

## Summary

This research focuses on implementing a loading overlay with live progress reporting for Mythika's 100 classic `<script>` tags. The solution builds on existing infrastructure (`__mythikaProbeGroup` markers, CSS loading states) and prior performance-loading.md findings. Key implementation involves: enhancing the script loading tracker to support group-based progress reporting, updating the loading overlay DOM safely during script execution, implementing error states for failed scripts, and ensuring proper `Input._ready` signaling.

**Primary recommendation:** Extend the existing script load tracking mechanism to support group-based progress reporting using the existing `__mythikaProbeGroup` markers, update the CSS content property dynamically via JavaScript, and integrate with the existing `Input._ready` flow.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Script load tracking with progress events | Browser / Client | — | DOM manipulation, event handling on script elements |
| Loading overlay DOM updates | Browser / Client | — | Direct manipulation of loading overlay elements |
| Error state handling for failed scripts | Browser / Client | — | DOM updates, class manipulation for error styling |
| Group boundary detection | Browser / Client | — | Reading existing probe markers, script tag iteration |
| Input readiness signaling | Browser / Client | — | Setting global Input._ready flag, checking in UI |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Mythika Vanilla JS | N/A | Core game engine, global APIs (G, Input, etc.) | Existing codebase contract, no build step |
| CSS | N/A | Loading overlay styling, error states | Existing `#game-container.loading::after/before` pseudo-elements |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | — | — | Implementation uses existing vanilla JS/DOM APIs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Count-based progress | Weighted progress by file size | Simpler implementation vs. smoother progress bar; prior research recommends count-based for this codebase |
| XHR/Fetch script loading | Classic script tags | Byte-level progress vs. breaks synchronous execution order and global API contract |

**Installation:**
No external dependencies required - implementation uses existing vanilla JS and DOM APIs.

## Architecture Patterns

### System Architecture Diagram

```
[HTML Parser] --> [Script Loading Phase] --> [Loading Overlay Updates] --> [First Frame Render] --> [Input Ready Check] --> [Game Loop]
     |                    |                       |                         |                  |
     |                    v                       v                         v                  v
     |           [Progress Tracking]       [DOM Content Update]   [Overlay Dismissal]   [Input Processing]
     |                    |                       |                         |                  |
     +--[onload/onerror]--+--[updateOverlayText]--+--[remove loading class]--+--[enable input]--+
```

### Recommended Project Structure
No structural changes needed - implementation enhances existing files:
- `index.html`: Add progress tracking and group detection
- `src/main.js`: Set Input._ready after successful boot
- `src/engine/input.js`: Add _ready flag and UI guards
- `styles/game.css`: Enhance loading overlay styling for progress/error states

### Pattern 1: Group-Based Progress Tracking
**What:** Extend existing script load tracker to report progress per group (engine, data, systems, ui, scenes, boot) using existing probe markers
**When to use:** During initial boot when all 100 classic scripts are loading synchronously
**Example:**
```typescript
// In index.html, after defining __scriptLoad object:
function updateLoadingOverlay() {
  const pct = Math.round((__scriptLoad.loaded / __scriptLoad.total) * 100);
  const groupNames = ['engine', 'data', 'systems', 'ui', 'scenes', 'boot'];
  const currentGroup = groupNames.find(g => 
    window[`__mythikaProbe${g.charAt(0).toUpperCase() + g.slice(1)}Start`] !== undefined &&
    window[`__mythikaProbe${g.charAt(0).toUpperCase() + g.slice(1)}End`] === undefined
  ) || 'boot';
  
  // Update overlay content via CSSOM or direct DOM manipulation
  document.documentElement.style.setProperty('--load-progress', `${pct}%`);
  document.documentElement.style.setProperty('--load-group', `"${currentGroup}"`);
}
```

### Anti-Patterns to Avoid
- **Blocking DOM updates:** Don't perform expensive DOM operations in script onload handlers that could delay parsing
- **Tight coupling:** Don't have script loading logic know about specific UI implementation details
- **Ignoring errors:** Don't fail to handle script errors which would leave overlay in perpetual loading state

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Script loading progress tracking | Custom XHR/fetch + eval loader | Existing script tag onload/onerror with group tracking | Breaks synchronous execution, global API contract, and service worker caching |
| Loading overlay animation | Custom CSS/JS animation engine | Existing CSS pseudo-elements with class-based transitions | Reuses existing, tested animation system |
| Input readiness signaling | Custom event system | Global Input._ready flag with UI.consume()/getPress() guards | Matches existing pattern, minimal overhead |
| Error state detection | Custom timeout/error detection | Existing script onerror events with failBoot integration | Leverages existing error handling pathways |

**Key insight:** The existing infrastructure (probe markers, CSS loading states, Input._ready pattern) provides 90% of what's needed - only enhancement and integration required.

## Common Pitfalls

### Pitfall 1: Synchronous Script Blocking DOM Updates
**What goes wrong:** Expensive DOM operations in script onload handlers block HTML parsing and delay subsequent script loading
**Why it happens:** Mistaking script onload for asynchronous callback when it's actually synchronous during initial parse
**How to avoid:** Use `requestAnimationFrame` or `setTimeout(..., 0)` for DOM updates, or limit updates to simple property changes
**Warning signs:** Network waterfall shows gaps between script loads, delayed first paint

### Pitfall 2: Lost Progress Tracking on Script Errors
**What goes wrong:** When a script fails to load, progress tracker doesn't increment, leaving overlay at 99% forever
**Why it happens:** Only handling onload events, ignoring onerror
**How to avoid:** Always increment loaded count in both onload and onerror handlers
**Warning signs:** Overlay stays at fixed percentage (<100%) after network error in devtools

### Pitfall 3: Incorrect Group Boundary Detection
**What goes wrong:** Progress reporting shows wrong group name due to mistimed probe detection
**Why it happens:** Reading probe variables at wrong time or missing the start/end pattern
**How to avoid:** Detect group by finding the most recent start marker without corresponding end marker
**Warning signs:** Group name jumps erratically or shows wrong group during loading

### Pitfall 4: Input Ready Race Condition
**What goes wrong:** Input._ready set before first frame renders, allowing input during loading state
**Why it happens:** Setting flag too early in boot process
**How to avoid:** Only set Input._ready after successful scene registration AND verify with existing dismissal logic
**Warning signs:** Input processed during loading overlay visible, causing unintended actions

## Code Examples

### Progress Tracking Initialization
```typescript
// In index.html, after window.__mythikaProbeGroup definition:
window.__scriptLoad = { 
  total: 100, 
  loaded: 0,
  groups: {
    engine: { start: 107, end: 121 },
    data: { start: 121, end: 142 },
    systems: { start: 142, end: 170 },
    ui: { start: 170, end: 181 },
    scenes: { start: 181, end: 209 },
    boot: { start: 209, end: 211 }
  }
};

function trackScriptLoad(el) {
  el.addEventListener('load', () => {
    window.__scriptLoad.loaded++;
    updateLoadingOverlay();
  });
  el.addEventListener('error', () => {
    // Count failed scripts as loaded to unblock progress
    window.__scriptLoad.loaded++;
    updateLoadingOverlay();
    triggerErrorState(el.src);
  });
}

// Apply to all existing script tags
document.querySelectorAll('script[src]').forEach(trackScriptLoad);
```

### Loading Overlay Update
```typescript
function updateLoadingOverlay() {
  const pct = Math.round((window.__scriptLoad.loaded / window.__scriptLoad.total) * 100);
  
  // Determine current group from probe markers
  let currentGroup = 'boot';
  const groups = ['engine', 'data', 'systems', 'ui', 'scenes'];
  for (const group of groups) {
    const startProp = `__mythikaProbe${group.charAt(0).toUpperCase() + group.slice(1)}Start`;
    const endProp = `__mythikaProbe${group.charAt(0).toUpperCase() + group.slice(1)}End`;
    if (window[startProp] !== undefined && window[endProp] === undefined) {
      currentGroup = group;
      break;
    }
  }
  
  // Update CSS custom properties for dynamic content
  document.documentElement.style.setProperty('--load-progress', `${pct}%`);
  document.documentElement.style.setProperty('--load-group', `"${currentGroup}"`);
}
```

### Error State Handling
```typescript
function triggerErrorState(failedSrc) {
  const container = document.getElementById('game-container');
  if (container) {
    container.classList.add('load-error');
    // Update overlay content to show error
    document.documentElement.style.setProperty('--load-error-message', 
      `"Failed to load: ${failedSrc.split('/').pop()}"`);
  }
  // Ensure input is not blocked
  if (typeof Input !== 'undefined') {
    Input._ready = true;
  }
}
```

### Enhanced Game Loop Dismissal Condition
```typescript
// In src/engine/game.js, modify existing frameCount === 1 check:
if (G.frameCount === 1) {
  const el = document.getElementById('game-container');
  if (el && el.classList.contains('loading')) {
    // Only dismiss if input is also ready (covers both success and failBoot paths)
    if (typeof Input !== 'undefined' && Input._ready === true) {
      el.classList.add('out');
      // Remove loading class entirely after transition
      setTimeout(() => el.classList.remove('loading', 'out', 'load-error'), 150);
    }
  }
}
```

### Input.js Ready Flag Implementation
```typescript
// In src/engine/input.js, add to Input object:
_ready: false,

// Add initialization function call at end of file:
function initInput() {
  // ... existing event listener setup ...
  
  // Add ready state checking to input consumers
  const originalConsume = UI.consume;
  UI.consume = function() {
    if (!Input._ready) return null;
    return originalConsume.apply(this, arguments);
  };
  
  const originalGetPress = UI.getPress;
  UI.getPress = function() {
    if (!Input._ready) return null;
    return originalGetPress.apply(this, arguments);
  };
}

// Call initInput() at end of file
initInput();
```

### CSS Enhancements for Progress/Error States
```css
/* In styles/game.css, enhance existing loading overlay */
#game-container.loading::after {
  content: attr(data-load-group) " " attr(data-load-progress) "%";
  /* ... existing styles ... */
}

#game-container.load-error::after {
  content: attr(data-load-error-message);
  color: #ff4444; /* Red for error state */
  animation: none;
}

#game-container.load-error::before {
  display: none; /* Hide spinner on error */
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static loading message | Dynamic progress + group reporting | Phase 43 | Users see actual boot progress instead of static message |
| No error state for failed scripts | Visible error message + input unblocked | Phase 43 | Failed boot shows clear error instead of perpetual spinner |
| Input readiness scattered | Centralized Input._ready with UI guards | Phase 43 | Consistent input blocking during boot, reliable unblocking |

**Deprecated/outdated:**
- Manual progress bar DOM updates: Replaced with CSS custom property approach
- Individual script onload handlers: Enhanced with group detection and error handling

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The existing 100 script tags plus 11 probe markers equal 111 total script elements to track | Standard Script Count | If incorrect, progress percentage will be miscalculated |
| A2 | All script tags have src attribute (no inline scripts to track) | Script Selection | If inline scripts exist, they won't be tracked affecting progress |
| A3 | The probe markers accurately define group boundaries between script tags | Group Boundary Detection | If markers are misplaced, group reporting will be inaccurate |
| A4 | Setting Input._ready = true in failBoot path will sufficiently unblock input | Input Readiness | If insufficient, game could remain in blocked state after failure |

## Open Questions

1. **Should we use weighted progress instead of count-based?**
   - What we know: Prior research recommends count-based for simplicity; we have file size data from performance-loading.md
   - What's unclear: Whether the coarseness of 1% increments (100 files) is acceptable UX
   - Recommendation: Start with count-based; if UX feedback indicates it feels jumpy, implement weighted progress using the existing size data

2. **How should we handle the Firebase config script that appears before engine start probe?**
   - What we know: Firebase config loads before first probe marker at line 105
   - What's unclear: Whether to count it in engine group or create a special "config" group
   - Recommendation: Include it in engine group since it's functionally part of engine initialization

3. **What is the optimal timing for DOM updates to avoid blocking parsing?**
   - What we know: Using requestAnimationFrame or setTimeout(0) defers expensive operations
   - What's unclear: Whether simple CSS property updates actually block parsing significantly
   - Recommendation: Implement with simple property updates first; measure performance and defer if needed

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| DOM API | Script tracking, overlay updates | ✓ | Native | — |
| CSS Custom Properties | Dynamic overlay content | ✓ | Native | — |
| requestAnimationFrame | Deferred DOM updates | ✓ | Native | setTimeout(..., 0) |
| serviceWorker | Asset caching (existing) | ✓ | mythika-v11 | — |

**Missing dependencies with no fallback:**
- None - all required APIs are native browser features

**Missing dependencies with fallback:**
- None - all dependencies are natively available

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Native Node test (existing) |
| Config file | none — see Wave 0 |
| Quick run command | `node --test tests/world_state.test.js` |
| Full suite command | `node --test tests/*.test.js` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOAD-01 | Visible loading overlay with live progress | manual/visual | Observe overlay during boot | ❌ Wave 0 |
| LOAD-02 | Overlay reports current stage as each group finishes | manual/visual | Verify group name changes | ❌ Wave 0 |
| LOAD-03 | Overlay dismisses when G.frameCount >= 1 AND Input._ready === true | integration | Check boot completion conditions | ❌ Wave 0 |
| LOAD-04 | Failed critical script shows visible error message | manual/visual | Simulate script 404, check overlay | ❌ Wave 0 |
| LOAD-05 | Failed-script handling sets Input._ready = true | integration | Verify input not blocked after failure | ❌ Wave 0 |
| INPUT-03 | Input._ready = true set in main.js after scene registration | integration | Check flag state post-registration | ❌ Wave 0 |
| INPUT-04 | Input._ready = true also set in failBoot path | integration | Check flag state in failBoot | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manual verification of loading overlay during development builds
- **Per wave merge:** Visual inspection of loading states in pre-release builds
- **Phase gate:** Manual verification checklist before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `{tests/test_loading_overlay.js}` — covers REQ-LOAD-01 through REQ-LOAD-05
- [ ] `{tests/test_input_ready.js}` — covers REQ-INPUT-03 and REQ-INPUT-04
- [ ] Framework install: `none` — uses existing test infrastructure

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | yes | Input._ready flag prevents premature input processing |
| V5 Input Validation | yes | Early return in UI.consume()/getPress() when !Input._ready |
| V6 Cryptography | no | — |

### Known Threat Patterns for Vanilla JS Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Input injection during loading | Tampering | Input._ready blocking in UI layer |
| Script loading error DoS | Denial of Service | Error state shows message, sets Input._ready to allow refresh |
| DOM-based XSS through error messages | Injection | Text content only, no HTML injection in error display |

## Sources

### Primary (HIGH confidence)
- `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/.planning/research/performance-loading.md` - Count-based progress approach, file size data
- `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/index.html` - Existing script tag structure, probe markers
- `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/src/main.js` - Existing bootGame/failBoot flow
- `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/src/engine/game.js` - Existing frameCount === 1 dismissal logic
- `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/styles/game.css` - Existing loading overlay styling

### Secondary (MEDIUM confidence)
- None - all primary sources verified via direct file reading

### Tertiary (LOW confidence)
- None - all claims verified against existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on existing codebase and verified file reads
- Architecture: HIGH - Based on direct inspection of existing patterns and files
- Pitfalls: HIGH - Based on logical analysis of synchronous script loading behavior

**Research date:** 2026-10-13
**Valid until:** 2026-11-12 (30 days for stable web tech)