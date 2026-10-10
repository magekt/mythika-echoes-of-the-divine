---
status: investigating
trigger: "when I click recruit, new hero, the toast still has previous screen of the initially selected hero visible."
created: 2026-10-10T00:00:00Z
updated: 2026-10-10T00:00:00Z
---

## Current Focus

hypothesis: party.js render() has no 'recruit' branch, so view='recruit' falls into the detail else-branch and paints the stale selectedHero behind the recruit list + toasts
test: read render dispatch (party.js ~814-875), buildRecruitList (~274-320), recruitHero (~322-364), and the Phase 31 choke points (game.js ~501-524, Fade.update ~148)
expecting: recruit view renders old hero detail chrome (header/info/action shell) while buttons are the recruit list — matches verbatim report
next_action: return ROOT CAUSE FOUND (goal is find_root_cause_only, no fix)

## Symptoms

expected: Tutorial and regular toasts draw inside their lane and never overlap action buttons or other text; toasts die with their creating scene.
actual: "when I click recruit, new hero, the toast still has previous screen of the initially selected hero visible."
errors: none (visual stale-screen, no crash)
reproduction: party scene → tap a hero (selectHero sets view='detail', selectedHero=X) → Back to Party (view='list') → Recruit Hero (view='recruit') → recruit list opens over the old hero's detail screen; recruitHero then fires 2 Feedback toasts on top
started: discovered during Phase 31 UAT on the GitHub Pages build including Phase 31 toast-lifecycle changes

## Eliminated

- hypothesis: Confirm-Creation modal overlay (characterCreate.js + Modal.confirm) is the stale screen
  evidence: party recruit flow never touches UI.Modal (no Modal reference in party.js); modal dimming (Modal._paint rgba(0,0,0,0.7) over old scene) is intentional overlay behavior in the characterCreate path, not the recruit-Hall path the report describes
  timestamp: 2026-10-10

- hypothesis: Phase 31 clearSceneToasts choke is broken (gScene ~511 / Fade.update ~148 failing to clear)
  evidence: both choke points exist and are correct (clearSceneToasts drops Notify.queue + Feedback toastQueue; UAT test 3 stale-toast-dies-across-scenes PASSES); recruit flow is an in-scene data.view switch that never calls gScene/Fade.toScene by design, so the choke correctly never fires — the stale pixels are scene chrome, not queued toasts surviving a transition
  timestamp: 2026-10-10

- hypothesis: redirect-toast wipe via Scene.navigate (scene-helpers.js ~140) causes this
  evidence: recruit buttons call buildRecruitList/recruitHero directly, never Scene.navigate/gScene; the known navigate-then-wipe edge applies to cross-scene redirects only
  timestamp: 2026-10-10

## Evidence

- timestamp: 2026-10-10
  checked: src/scenes/party.js render dispatch lines 814-875
  found: three-way dispatch is `if (view==='list') … else if (itemsView) … else {detail}` — there is NO `view==='recruit'` branch. Any recruit view falls into the detail else-branch.
  implication: opening the recruit hall renders the detail header (`hero.name + ' — ' + title`), renderDetailInfo, and the 7-button action shell for whatever selectedHero is stale (or crashes on null header if never selected).

- timestamp: 2026-10-10
  checked: src/scenes/party.js buildRecruitList 274-320 + Recruit button 253-259 + selectHero 366-372
  found: Recruit onClick sets `data.view='recruit'` and swaps `data.buttons` to recruit candidates, but leaves `data.selectedHero` untouched (still the initially selected hero X; enter() is the only place that nulls it). buildRecruitList pushes its own staticDraws header line, but render never draws staticDraws in the detail else-branch (only itemsView branch calls Scene.drawStatic) — so the recruit header line is built but never painted, while the old hero detail IS painted.
  implication: exact match for "previous screen of the initially selected hero visible" behind the recruit/new-hero UI.

- timestamp: 2026-10-10
  checked: src/scenes/party.js recruitHero 322-364
  found: success path pushes TWO UI.Feedback.Toast (joins-party duration 3 + bond-scene-awaits duration 3), then flips view='list' + buildList() — a valid branch, so post-recruit list itself is fine. But both toasts render at fixed ty=470 (feedback.js Toast.render), the same lane as Notify.render ty=470, stacked downward over the scrollable action-button band.
  implication: the toast-lane overlap half of test 5 is a real secondary aggravator: two back-to-back 3s toasts sit on top of the freshly rebuilt list buttons. Root visible-staleness, though, is the render-branch bug above, not the queue.

- timestamp: 2026-10-10
  checked: src/engine/game.js 501-524 + 141-159, src/ui/feedback.js 45-76/133-137, src/engine/scene-helpers.js 137-142, src/ui/modal.js
  found: Phase 31 tagging/clearing is intact (sceneTag stamped at Toast creation; clearScene drops all Feedback toasts; Notify.clearScene drops queue only, banners survive). In-scene view switches (list/detail/recruit/itemsView) intentionally bypass gScene/Fade — no clearing is supposed to happen there.
  implication: confirms this is NOT a toast-lifecycle regression — Phase 31 works as designed; the recruit view simply never had a render branch, and UAT misfiled the stale-detail-screen under test 5 (toast lane).

## Resolution

root_cause: partyScene.render() has no branch for data.view==='recruit', so opening the Recruit Hall falls through to the detail else-branch and repaints the previously selected hero's header, detail info, and action-button shell behind the recruit-candidate buttons (selectedHero is never cleared on the list→recruit switch; the recruit header staticDraw is built but never drawn because only the itemsView branch calls Scene.drawStatic). The two recruit-success Feedback toasts then stack at the fixed ty=470 lane over the action buttons, compounding the overlap complaint. No scene transition occurs (in-scene view switch by design), so Phase 31 clearSceneToasts correctly never fires — the stale pixels are chrome, not queued toasts.
fix:
verification:
files_changed: []
