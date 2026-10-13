# Phase 32: Combat Layout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-10
**Phase:** 32-Combat Layout
**Areas discussed:** Combat band layout, Action-button grid, Toast-lane constant, Proof & fixtures, Non-combat states

---

## Combat band layout

| Option | Description | Selected |
|--------|-------------|----------|
| Keep order, fix bands / Enemies first / You decide | Band order | You decide |
| Compact rows / Scroll hero band / You decide | 5-hero scaling | You decide |
| Fixed min tap size / Band-driven size / You decide | Target button sizing | You decide |
| Fixed heights / Measured heights / You decide | Name-vs-bars separation | You decide |
| Same bands tighter / Landscape variant / You decide | Landscape adaptation | You decide |
| Yes, same rules / Leave results alone | Result screen discipline | ✓ Yes, same rules |

**User's choice:** "You decide" on all layout mechanics; result screen explicitly under band discipline.
**Notes:** User asked for "more questions" once; landscape + result questions then closed the area.

## Action-button grid

| Option | Description | Selected |
|--------|-------------|----------|
| Truncate / Wrap / Shrink font / You decide | Long skill names | You decide |
| Scroll / Category tabs / You decide | Overflow | You decide |
| Keep / Drop / You decide | Separators | You decide |
| Always last / Contextual / You decide | Flee placement | You decide |
| Dim + lock / Hidden / You decide | Disabled styling | You decide |

**User's choice:** All "You decide" (asked for more questions once; Flee + disabled questions closed the area).

## Toast-lane constant

| Option | Description | Selected |
|--------|-------------|----------|
| Viewport-relative / Per-orientation / You decide | Lane geometry (ty=470 off-screen at H=390) | You decide |
| Stack inside lane / Allow overflow / You decide | 3-toast stacking | You decide |
| All in lane / Victory exempt / You decide | Victory/loot exemption | You decide |
| Clear of modals / Draw over dim / You decide | Lane vs modals | You decide |
| Keep both / Consolidate / You decide | Story line + Notify lane | You decide |

**User's choice:** All "You decide" (asked for more questions once; modal + stream questions closed the area).

## Proof & fixtures

| Option | Description | Selected |
|--------|-------------|----------|
| Eyeball / Downstream judges / You decide | First-correct-render judge | You decide |
| Review first / Auto-adopt / You decide | Pair re-derivation review | You decide |
| Log and defer / Fix as found / You decide | Sweep fallout policy | You decide |
| Strict / Advisory / You decide | Fixture retirement | You decide |

**User's choice:** All "You decide".

## Non-combat states (added round)

| Option | Description | Selected |
|--------|-------------|----------|
| All under discipline / Live turns only / You decide | State coverage | You decide |
| Disabled rows / Empty-state line / You decide | Zero-usable-skills | You decide |

**User's choice:** All "You decide".

## Todo folding

| Option | Description | Selected |
|--------|-------------|----------|
| Fold all three / Fold combat two / Fold none | Pending todos matching scope | ✓ Fold all three |

**User's choice:** Fold fix-combat-header-overlap, fix-combat-action-buttons, fix-stale-toast-persistence.

---

## OpenCode's Discretion

All areas above except the result-screen band discipline and the todo fold. Framed in CONTEXT.md as D-00 researcher/planner ownership with defaults noted (log-and-defer sweep fallout, strict fixture retirement).

## Deferred Ideas

- Quiet Firebase 404/init noise on Pages build (from user's live review; deploy/hygiene phase)
- Add repo LICENSE (from user's live review)
- Procedural-audio upgrade (from user's live review)
- Painted zone backdrops / enemy portraits (from user's live review)
- Remove debug scene from shipped build (from user's live review; flag if sweep trips over it)
- Web best-practices research skipped — Exa rate-limited, SearXNG misconfigured; decisions rest on codebase evidence.
