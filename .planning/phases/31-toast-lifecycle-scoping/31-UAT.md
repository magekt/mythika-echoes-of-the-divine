---
status: testing
phase: 31-toast-lifecycle-scoping
source: [31-01-SUMMARY.md, 31-02-SUMMARY.md]
started: 2026-10-10T00:00:00Z
updated: 2026-10-10T00:00:00Z
---

## Current Test

number: 1
name: Boot to Ashram without crash
expected: |
  Serve the game (python3 -m http.server 3000), load it, and navigate to the Ashram scene.
  Ashram renders normally with no console loop-error crash (previously: TypeError reading 'renderBackground').
awaiting: user response

## Tests

### 1. Boot to Ashram without crash
expected: Ashram scene renders normally; no `[Mythika] loop error` crash in console
result: [pending]

### 2. Ashram background paints
expected: Ashram shows a visible painted background (distinct from the blank clear color) behind its content
result: [pending]

### 3. Stale toast dies across scenes
expected: Trigger a locked-zone toast on the travel map, then go Back → Ashram → Party. No stale toast from the old scene is visible in the new scene
result: [pending]

### 4. Achievement banner survives transition
expected: An achievement/banner toast remains visible across a scene change (only regular toasts are cleared)
result: [pending]

### 5. Toasts never cover action buttons
expected: Tutorial and regular toasts draw inside their lane and never overlap action buttons or other text
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

[none yet]
