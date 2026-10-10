---
status: diagnosed
phase: 31-toast-lifecycle-scoping
source: [31-01-SUMMARY.md, 31-02-SUMMARY.md]
started: 2026-10-10T00:00:00Z
updated: 2026-10-10T00:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Boot to Ashram without crash
expected: Ashram scene renders normally; no `[Mythika] loop error` crash in console
result: pass

### 2. Ashram background paints
expected: Ashram shows a visible painted background (distinct from the blank clear color) behind its content
result: pass

### 3. Stale toast dies across scenes
expected: Trigger a locked-zone toast on the travel map, then go Back → Ashram → Party. No stale toast from the old scene is visible in the new scene
result: pass

### 4. Achievement banner survives transition
expected: An achievement/banner toast remains visible across a scene change (only regular toasts are cleared)
result: pass

### 5. Toasts never cover action buttons
expected: Tutorial and regular toasts draw inside their lane and never overlap action buttons or other text
result: issue
reported: "when I click recruit, new hero, the toast still has previous screen of the initially selected hero visible."
severity: major

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Tutorial and regular toasts draw inside their lane and never overlap action buttons or other text"
  status: failed
  reason: "User reported: when I click recruit, new hero, the toast still has previous screen of the initially selected hero visible."
  severity: major
  test: 5
  root_cause: "partyScene.render() (src/scenes/party.js ~814-875) has no branch for data.view==='recruit', so the Recruit Hall falls through to the detail else-branch and repaints the previously selected hero's header/detail/action-button shell behind the recruit-candidate buttons. selectedHero is never cleared on the list-to-recruit switch. No scene transition occurs (in-scene view switch by design), so Phase 31 clearSceneToasts correctly never fires — the stale pixels are chrome, not queued toasts."
  artifacts:
    - path: "src/scenes/party.js"
      issue: "missing view==='recruit' render branch; falls into detail else-branch painting stale selectedHero; recruit header staticDraw built but never painted"
    - path: "src/ui/feedback.js"
      issue: "recruitHero fires two 3s toasts at fixed ty=470 over rebuilt list buttons, compounding the overlap complaint"
  missing:
    - "Add explicit view==='recruit' render branch (header + clip + recruit buttons + staticDraws)"
    - "Clear or ignore selectedHero chrome while in recruit view"
  debug_session: ".planning/debug/recruit-stale-screen.md"
