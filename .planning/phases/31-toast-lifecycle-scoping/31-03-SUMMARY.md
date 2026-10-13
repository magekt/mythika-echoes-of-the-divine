---
phase: 31-toast-lifecycle-scoping
plan: "03"
subsystem: party-scene
tags: [recruit-hall, render-dispatch, LAY-05, uat-gap-closure]

# Dependency graph
requires:
  - phase: 31-toast-lifecycle-scoping plan 02
    provides: [scene-tagged toast lifecycle, clearSceneToasts choke point]
provides:
  - [explicit recruit render branch, stale-selection clearing on view switch, recruit-view regression test]
affects: [phase-32 toast lane (LAY-02), party scene views]

# Tech tracking
tech-stack:
  added: []
  patterns: [explicit per-view render branch, stale-pointer clearing on in-scene view switch]

key-files:
  created: [tests/party_recruit_view.test.js]
  modified: [src/scenes/party.js]

key-decisions:
  - "Stale pixels are scene chrome, not queued toasts — clearSceneToasts correctly never fires on in-scene view switches; fix the missing branch, not the toast system"
  - "Recruit branch follows the itemsView pattern (cull + drawStatic + HUD) since buildRecruitList builds staticDraws; character-moment gutter stays detail-only"
  - "No toast visuals, durations, lane, Notify, game.js/Fade, or save state touched — LAY-02 owns the lane in Phase 32"

patterns-established:
  - "Every data.view value gets an explicit render branch; fall-through to detail is a stale-chrome bug"
  - "In-scene view switches null pointers the incoming view must never read"

requirements-completed: [LAY-05]

# Metrics
duration: 20min
completed: 2026-10-10
---

# Phase 31 Plan 03 Summary

**Recruit Hall is a first-class view: explicit recruit render branch paints header + culled candidate buttons + staticDraws + HUD without reading selectedHero, and the list-to-recruit switch nulls the stale selection — closing the 31-UAT test-5 gap.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-10-10
- **Completed:** 2026-10-10
- **Tasks:** 2/2
- **Files modified:** 1 modified, 1 test created

## Accomplishments

- `src/scenes/party.js`: Recruit Hero onClick now nulls `selectedHero` and clears `itemsView` on the list-to-recruit switch; new `else if (this.data.view === 'recruit')` branch before the detail `else` paints the Recruit Heroes header/subtitle, culled buttons, `staticDraws` header line, HUD, and scrollbar — never referencing `selectedHero`. Detail branch, toast systems, lane, and save state untouched.
- `tests/party_recruit_view.test.js`: 4 passing assertions (branch exists, positioned before detail else, paints drawStatic + culled buttons with no selectedHero read, switch clears selection) + 1 intentionally skipped behavioral test (needs browser globals; covered by 31-UAT test-5 manual path).

## Verification

- `node --check src/scenes/party.js`: pass
- `node --test tests/toast_lifecycle.test.js tests/party_recruit_view.test.js`: 16 pass, 1 skipped (behavioral, browser-only), 0 fail; toast_lifecycle still 12/12
- `node --test tests/*.test.js`: 426 total — 425 pass, 1 skipped, 0 fail (421 baseline + 4 new + 1 skip)
- `tools/check_ui_invariants.sh`: all checks passed (95 files syntax, 21 system scripts)
- `git diff --check`: clean; diff touches only src/scenes/party.js + tests/party_recruit_view.test.js

## Deviations from Plan

None - plan executed exactly as written.

## Post-Review Correction (orchestrator spot-check, 2026-10-10)

Spot-check found the recruit branch had been inserted chained onto `if (res.ok)`
inside the gift `btn.onClick` handler — not in `render()`. Consequences of the
misplacement: (1) `render()` still fell through to the detail else for
`view==='recruit'` (gap NOT closed); (2) a denied gift while in recruit view
would have executed scene-draw calls with an undefined `ctx` (ReferenceError).
The static regression test passed vacuously because it only checked string
presence/order, not location.

Correction: removed the misplaced branch (gift-denial `else` restored verbatim)
and inserted the identical branch body into `render()` between the `itemsView`
branch and the final detail `else` (party.js `} else if (this.data.view ===
'recruit')`, single `=== 'recruit'` comparison in the file). Added a
location-pinning test (`recruit branch lives inside render(), not in an event
handler`: branch must sit after `render: function(ctx)` with no intervening
scene member; exactly one `=== 'recruit'` comparison). Would-have-caught check:
pre-fix, the branch preceded `render()`, so `lastIndexOf('render:
function(ctx)')` returns -1 and the new test fails.

Re-verified: `node --test tests/*.test.js` 427 total — 426 pass, 1 intentional
skip, 0 fail; `tools/check_ui_invariants.sh` green; `git diff --check` clean.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, file access, or schema changes. T-31-03-03 (detail null-deref) mitigated structurally: recruit branch never reads selectedHero and detail is unreachable while view==='recruit'.

## Self-Check: PASSED

- FOUND: src/scenes/party.js (view === 'recruit' branch)
- FOUND: tests/party_recruit_view.test.js
- FOUND: 671f0fc feat(31-03) commit
- FOUND: 991e719 test(31-03) commit
