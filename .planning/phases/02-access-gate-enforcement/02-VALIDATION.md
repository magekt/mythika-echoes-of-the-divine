---
phase: 02-access-gate-enforcement
type: validation
status: complete
backfill: true
source: backfilled 2026-10-11 from 02-RESEARCH.md (Validation Architecture) and the executed 02-UAT.md record
validated: 2026-09-14
requirements:
  - REQ-006
---

# Phase 02 — Validation

> Historical backfill (2026-10-11): this phase predates the VALIDATION.md convention.
> The validation architecture was planned in [02-RESEARCH.md](02-RESEARCH.md) ("Validation
> Architecture") and executed on 2026-09-14; the as-run evidence lives in
> [02-UAT.md](02-UAT.md). This file records that architecture and points at the
> executed results so the phase directory is self-describing.

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual browser testing via browser-use CDP (no unit test framework at the time) |
| Quick run command | Open `index.html` in browser, navigate to gated feature |
| Full suite command | Per-gate browser test matrix (6 gates) |

## Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Result |
|--------|----------|-----------|-------------------|--------|
| REQ-006 (Journey) | Journey start blocked when ineligible (wrong level, already active, not available) | browser-test | `JourneySystem.start(...)` duplicate + valid start | ✅ pass (UAT tests 1–3) |
| REQ-006 (Rebirth) | Rebirth blocked below level 30 or < 10 karma | browser-test | punarjanma scene, RebirthAccess.status/enter | ✅ pass (UAT test 4) |
| REQ-006 (Forge) | Upgrade blocked when gold insufficient or hero gone | browser-test | forge scene, ForgeAccess.status/enter | ✅ pass (UAT test 5) |
| REQ-006 (Recruit) | Recruit blocked when party full or duplicate | browser-test | `partyScene.recruitHero(...)`, RecruitAccess | ✅ pass (UAT test 6) |
| REQ-006 (Tournament) | Tournament blocked when gold insufficient | browser-test | tournament scene, TournamentAccess | ✅ pass (UAT test 7) |
| REQ-006 (Trials) | Trials blocked when boss not defeated | browser-test | trials scene without `boss_svarga` flag | ✅ pass (UAT test 8) |

## Sampling Rate (as planned)

- **Per task commit:** manual browser test of the specific gate.
- **Per wave merge:** full per-gate browser matrix.
- **Phase gate:** all 6 gates pass; failed-attempt side-effect check (state unchanged).

## Results

Executed 2026-09-14 as an automated 6-gate browser UAT via browser-use CDP —
**all 6 gates verified** (`status`/`enter` return correct values; blocked attempts show
a Notify message with no state change; scene navigation produced zero console errors).
Full as-run evidence: [02-UAT.md](02-UAT.md) (status: complete). Close-out record:
git `d339303` (STATE.md at v1.0 close), commits `71757ef` `352d1bd` `0feb2ea`
`8b6c182` `20bad46`.

## Security Domain (as planned in research)

ASVS L1, applicable: V4 Access Control (`XxxAccess.status()`/`.enter()` pattern),
V5 Input Validation (journeyId/hid validated against registry keys). Threat patterns
covered by design: console tampering (authority at system level, `enter()` re-validates
before mutation) and duplicate-hero exploit (id uniqueness checked at mutation time).
