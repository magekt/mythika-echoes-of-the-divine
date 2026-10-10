---
phase: 31-toast-lifecycle-scoping
verified: 2026-10-10T00:00:00Z
status: human_needed
score: 9/9 must-haves verified
overrides_applied: 0
re_verification: false
human_verification:
  - test: "31-UAT test 5 manual retest — Recruit Hall shows no stale hero chrome"
    expected: "Party → tap hero → Back to Party → Recruit Hero → recruit list shows candidates + recruit header only, no prior hero detail; post-recruit toasts unchanged"
    why_human: "Requires live browser play with real taps and visual inspection of painted pixels; static dispatch assertions pin the contract but cannot confirm rendered output"
---

# Phase 31: Toast Lifecycle Scoping Verification Report

**Phase Goal:** Toasts never leak across scenes (ROADMAP Phase 31 SC 1–4 + gap-closure 31-03 for 31-UAT test 5)
**Verified:** 2026-10-10
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Live boot reaches Ashram with no loop-error crash (31-01) | ✓ VERIFIED | `R.Backgrounds = Backgrounds` lexical attach at backgrounds.js:307; window synced to SAME object (:310-313); full suite green; invariants green |
| 2 | Ashram paints a background distinct from clear color (31-01) | ✓ VERIFIED | `R.Backgrounds.renderBackground(ctx, 'ashram', bgAlpha)` at ashram.js:294 resolves via fixed binding; binding test asserts slot path; UAT tests 1–2 pass |
| 3 | Stale-toast repro outcome recorded, branch selected (31-01) | ✓ VERIFIED | `tools/shots/repro-lay05.json` exists (`reproduced:false`, branch `harden`, non-empty notes) |
| 4 | Navigating to a new scene clears stale toasts (SC 1) | ✓ VERIFIED | `Notify.show` stamps `scene` (game.js:6); `Notify.clearScene` drops queue (game.js:11); `clearSceneToasts()` choke called pre-branch in `gScene` (:511) AND at `Fade.update` swap (:148); repro-path queue test passes |
| 5 | Scene tags stamped; achievement banners survive (SC 2) | ✓ VERIFIED | `sceneTag` stamped in feedback.js:66; `clearScene` never touches `achievements` (only additions/context in diff); survival tests pass both systems |
| 6 | Harness regression green + concurrent-toast cap documented (SC 3) | ✓ VERIFIED | toast_lifecycle 12/12 (10 fail pre-fix per summary); cap comment "3 per system" present; full suite 426 pass + 1 intentional skip, 0 fail |
| 7 | Text-bounds holds for toast-lane scenes at both viewports (SC 4) | ✓ VERIFIED | `tools/shots/layout-31-toast.json` exists; 26 scenes × 2 viewports, 0 toast-related violations either viewport (per 31-02 summary; artifact present on disk) |
| 8 | Recruit Hall renders own header + candidates, no stale hero chrome (31-03 / UAT-5) | ✓ VERIFIED | CURRENT party.js: `} else if (this.data.view === 'recruit')` at line 854 INSIDE `render()` (starts :816), between itemsView branch and detail else; body paints header + culled buttons + drawStatic + HUD, zero `selectedHero` refs; recruit onClick (:255-261) nulls selectedHero + itemsView=false; gift-denial else restored verbatim with no draw calls; exactly one `=== 'recruit'` comparison in file |
| 9 | Toast lifecycle intact after recruit fix; detail view unaffected (31-03) | ✓ VERIFIED | toast_lifecycle still 12/12 alongside new test (20 pass + 1 skip combined); detail else-branch (:868+) still reads selectedHero, untouched; full suite + invariants green |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/engine/backgrounds.js` | Lexical R attach | ✓ VERIFIED | Exists, substantive (`R.Backgrounds = Backgrounds` + window sync to same object), wired (7 call sites incl. ashram.js:294) |
| `tests/backgrounds_binding.test.js` | Binding regression | ✓ VERIFIED | Exists, asserts strict identity + slot resolution; in green suite |
| `src/engine/game.js` | Scene-tagged Notify + transition clear | ✓ VERIFIED | Exists, substantive (scene stamp, clearScene, clearSceneToasts at both swap sites), wired (gScene + Fade.update + navigation.js bypass covered) |
| `src/ui/feedback.js` | Scene-tagged Feedback + clearScene | ✓ VERIFIED | Exists, substantive (sceneTag stamp, Toast.clearScene, clearSceneToasts export), wired via choke helper |
| `tests/toast_lifecycle.test.js` | Lifecycle regression + cap docs | ✓ VERIFIED | Exists, 12/12 green, cap comment present, real-source loading |
| `src/scenes/party.js` | Recruit render branch in render() | ✓ VERIFIED | Exists, substantive, wired — branch at :854 inside render(), correct dispatch order list → itemsView → recruit → detail; NOT in gift handler (verified first-hand, not from summary claims) |
| `tests/party_recruit_view.test.js` | Recruit dispatch regression + location pin | ✓ VERIFIED | Exists (120 lines), 5 tests: 4 pass + 1 intentional browser-only skip; location-pinning test asserts branch sits after `render: function(ctx)` with no intervening scene member and exactly one `=== 'recruit'` comparison |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| backgrounds.js | lexical R in renderer.js | direct `R.Backgrounds =` assign | WIRED | Line 307, not window-prefixed; identity asserted in test |
| ashram.js | R.Backgrounds.renderBackground | render call :294 | WIRED | Call site present, binding fixed |
| gScene (both paths) | Notify queue + Feedback toastQueue | clearSceneToasts pre-branch + Fade.update swap | WIRED | game.js:511 + :148; idempotent exactly-once; achievements exempt |
| Notify.show / Feedback Toast() | scene tag | stamp at creation from G.state.scene | WIRED | game.js:6 `scene:`, feedback.js:66 `sceneTag:` |
| party.js render | recruit buttons + staticDraws | recruit branch cull + drawStatic inside clip | WIRED | Lines 854-866: cullButtons + drawStatic + HUD + scrollbar |
| recruit onClick | view switch state | null selectedHero/itemsView + buildRecruitList | WIRED | Lines 255-261 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| party.js recruit branch | data.buttons / staticDraws | buildRecruitList() (called on switch) | ✓ FLOWING | ✓ FLOWING — branch renders culled buttons + staticDraws built by buildRecruitList |
| game.js Notify.queue | queue items w/ scene | Notify.show callers | ✓ FLOWING | ✓ FLOWING — stamped, rendered, cleared on transition |
| feedback.js toastQueue | toast items w/ sceneTag | Toast() callers | ✓ FLOWING | ✓ FLOWING — stamped, rendered, cleared on transition |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Binding + lifecycle + recruit tests | `node --test tests/backgrounds_binding.test.js tests/toast_lifecycle.test.js tests/party_recruit_view.test.js` | 20 pass, 1 intentional skip, 0 fail | ✓ PASS |
| Full Node suite | `node --test tests/*.test.js` | 427 tests: 426 pass, 1 skip, 0 fail | ✓ PASS |
| UI invariants | `tools/check_ui_invariants.sh` | All checks passed (95 files, 21 system scripts) | ✓ PASS |
| Syntax | `node --check` on all 4 touched sources | All exit 0 | ✓ PASS |
| Diff hygiene | `git diff --check` | Clean | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| LAY-05 | 31-01, 31-02, 31-03 | Toast lifecycle: repro, scene-tag clearing except achievements, regression test, cap documented | ✓ SATISFIED | All 9 truths verified; tests green; cap documented; gap-closure branch landed |

No orphaned requirements: REQUIREMENTS.md maps only LAY-05 to Phase 31, and all three plans declare it.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/engine/game.js | 447, 452 | `rmAutoDone` matched TODO-substring grep | ℹ️ Info | False positive (`autoDone` contains `todo`); not a stub |
| (all touched sources) | — | No TODO/FIXME/placeholder/empty-return/console-only-handler patterns | — | Clean |

Gift-handler audit (post-review correction area): gift item `onClick` (:731-794) denial `else` restored verbatim (giftDenialCopy toast + Audio.error, no ctx/draw calls); no `recruit` comparison anywhere outside render() — misplacement class eliminated and pinned by test.

### Human Verification Required

#### 1. 31-UAT test 5 manual retest — Recruit Hall shows no stale hero chrome

**Test:** Party → tap hero → Back to Party → Recruit Hero → inspect recruit list; then Back-to-Party → tap hero (detail still works); recruit a hero and observe post-recruit toasts.
**Expected:** Recruit list shows candidates + recruit header only, no prior hero detail; detail view works after returning; post-recruit toasts unchanged (lane work deferred to Phase 32).
**Why human:** Requires live browser play with real taps and visual inspection of painted pixels; static dispatch assertions pin the contract but cannot confirm rendered output.

### Gaps Summary

No gaps. All automated checks pass: 9/9 truths verified against current codebase state (including first-hand verification that the recruit branch lives inside `render()`, not the gift handler, and that the location-pinning test exists). The single human item is the manual UAT retest of the closed test-5 gap, which by the Step 9 decision tree routes status to human_needed rather than passed.

---

_Verified: 2026-10-10_
_Verifier: OpenCode (gsd-verifier)_
