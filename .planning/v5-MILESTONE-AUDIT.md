---
milestone: v5.0
audited: 2026-10-10
status: gaps_found
scores:
  requirements: 1/11
  phases: 1/6
  integration: 2/11
  flows: 2/3
gaps:
  requirements:
    - id: "LAY-05"
      status: "partial"
      phase: "Phase 31"
      claimed_by_plans: ["31-01-PLAN.md (LAY-05-repro-gate)", "31-02-PLAN.md (LAY-05)"]
      completed_by_plans: ["31-01-SUMMARY.md (LAY-05-repro-gate)", "31-02-SUMMARY.md (LAY-05)"]
      verification_status: "missing"
      evidence: "No 31-VERIFICATION.md. 12/12 toast_lifecycle tests green, layout sweep 730 vs 774 baseline zero-new, but phase-level verification never written."
    - id: "LAY-01"
      status: "unsatisfied"
      phase: "Phase 32"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "Phase 32 directory does not exist. In traceability but absent from all VERIFICATION.md files."
    - id: "LAY-02"
      status: "unsatisfied"
      phase: "Phase 32"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "Phase 32 directory does not exist. No toast-lane constant in src (grep clean)."
    - id: "LAY-07"
      status: "unsatisfied"
      phase: "Phase 32"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "Only 31-01 crash fix (lexical R.Backgrounds attach) exists; sampler + expected-color recorder absent. Phase 32 does not exist."
    - id: "LAY-03"
      status: "unsatisfied"
      phase: "Phase 33"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "Phase 33 directory does not exist."
    - id: "LAY-04"
      status: "unsatisfied"
      phase: "Phase 33"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "Phase 33 directory does not exist."
    - id: "LAY-06"
      status: "unsatisfied"
      phase: "Phase 34"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "Phase 34 directory does not exist."
    - id: "BAL-01"
      status: "unsatisfied"
      phase: "Phase 35"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "Sim emits meanHpLossFirstFive 0.3925 / deathRate 0.07 but no threshold asserts or tuning. Phase 35 does not exist."
    - id: "BAL-02"
      status: "unsatisfied"
      phase: "Phase 35"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "Sim emits fightsToClear 8 / meanPctGain 13.69 but no 12-20 asserts. Phase 35 does not exist."
    - id: "BAL-03"
      status: "unsatisfied"
      phase: "Phase 35"
      claimed_by_plans: []
      completed_by_plans: []
      verification_status: "orphaned"
      evidence: "No producer at all. Phase 35 does not exist."
  integration:
    - from: "Scene.navigate redirect toast"
      to: "gScene pre-branch clear"
      issue: "Redirect notice wiped on every path: Scene.navigate shows toast before gScene whose first statement clears it; fade-path second clear wipes even the gScene-internal redirect."
      requirements: ["LAY-05"]
    - from: "Feedback Toast.render"
      to: "layout harness overlay protocol"
      issue: "Toast.render sets no __layoutHarness.overlay flag (zero hits in feedback.js); Feedback toasts at y=470 lane asserted as regular text. Harness cannot structurally distinguish toast from overlap."
      requirements: ["LAY-00", "LAY-02"]
  flows:
    - name: "toast repro tap path (travelMap locked -> Back -> Ashram -> Party)"
      break: "live-tap observation"
      detail: "Queue-level replay green (12/12); repro-lay05.json honestly records reproduced:false (headless taps undrivable). No live browser frame proves stale toast dies on real taps."
      requirements: ["LAY-05"]
tech_debt:
  - phase: 30-layout-harness-extension
    items:
      - "R.Backgrounds split surfaced in 30-VERIFICATION (backgrounds never paint) — fixed in 31-01, verify no regression"
      - "Journey-level browser evidence rides Phase 31+ per-plan checkpoints (30-VERIFICATION deferred note)"
  - phase: 31-toast-lifecycle-scoping
    items:
      - "Scene tags stamped but never filtered (clearScene drops all) — diagnostic only; no selective-keep drift risk today"
      - "Remaining 730 layout violations untouched by design (owned by Phases 32/33); fail-first oracle pairs still HIT"
      - "Unverified phase: 2/2 plans summarized, no 31-VERIFICATION.md written"
nyquist:
  compliant_phases: []
  partial_phases: []
  missing_phases: ["30-layout-harness-extension", "31-toast-lifecycle-scoping", "32", "33", "34", "35"]
  overall: "missing"
---

# v5.0 Milestone Audit — Layout Fixes & Early-Game Pacing (Phases 30–35)

**Verdict: gaps_found** — milestone is 1/6 phases verified and 1/11 requirements satisfied at contract level. This is an in-progress milestone, not a shippable one: Phase 30 is solid, Phase 31 work is done but unverified, Phases 32–35 do not exist yet.

**Fresh gates (this audit):** `node --test tests/*.test.js` 421/421 pass; `tools/check_ui_invariants.sh` green (95 files, 21 system scripts); `git diff --check` clean.

## Sources read

- `.planning/REQUIREMENTS.md` (11 reqs: LAY-00–07, BAL-01–03 + traceability table, all Pending)
- `.planning/ROADMAP.md` (v5.0 scope: Phases 30–35, in planning)
- Phase verifications: `30-VERIFICATION.md` (exists); 31–35 VERIFICATION.md missing
- Phase summaries: `30-01/30-02/30-03-SUMMARY.md`, `31-01/31-02-SUMMARY.md`
- Integration checker report (this audit): 30↔31 wiring clean + 2 warnings + 7 absent-connection blockers

## Per-requirement verdicts (3-source cross-reference)

| Req | Phase | VERIFICATION | SUMMARY frontmatter | REQUIREMENTS box | → Final |
|-----|-------|--------------|---------------------|------------------|---------|
| LAY-00 harness | 30 | passed (contracts + fail-first proven) | listed (30-01/02/03) | `[ ]` | **satisfied** (tick box) |
| LAY-05 toast lifecycle | 31 | missing (no 31-VERIFICATION.md) | listed (31-02 LAY-05; 31-01 repro-gate) | `[ ]` | **partial** (verification gap) |
| LAY-01 combat header | 32 | missing | missing | `[ ]` | **unsatisfied** (orphaned — phase absent) |
| LAY-02 buttons + lane | 32 | missing | missing | `[ ]` | **unsatisfied** (orphaned — phase absent) |
| LAY-07 backgrounds paint | 32 | missing | missing | `[ ]` | **unsatisfied** (orphaned — crash fix only) |
| LAY-03 Bazaar | 33 | missing | missing | `[ ]` | **unsatisfied** (orphaned — phase absent) |
| LAY-04 zone exploration | 33 | missing | missing | `[ ]` | **unsatisfied** (orphaned — phase absent) |
| LAY-06 fit-finish | 34 | missing | missing | `[ ]` | **unsatisfied** (orphaned — phase absent) |
| BAL-01 difficulty | 35 | missing | missing | `[ ]` | **unsatisfied** (orphaned — sim only) |
| BAL-02 clear rate | 35 | missing | missing | `[ ]` | **unsatisfied** (orphaned — sim only) |
| BAL-03 empty states | 35 | missing | missing | `[ ]` | **unsatisfied** (orphaned — no producer) |

FAIL gate enforced: 9× `unsatisfied` + 1× `partial` → status `gaps_found`.

## Phase status

| Phase | Plans | VERIFICATION.md | Status |
|-------|-------|-----------------|--------|
| 30 Layout Harness Extension | 3/3 | exists — contracts + fail-first proven, 2 prod nav defects fixed | verified |
| 31 Toast Lifecycle Scoping | 2/2 | **missing — unverified phase (blocker)** | work done, unverified |
| 32 Combat Layout | 0/0 | missing (no directory) | not started |
| 33 Bazaar & Zone Layout | 0/0 | missing (no directory) | not started |
| 34 Fit & Finish | 0/0 | missing (no directory) | not started |
| 35 Pacing & Empty States | 0/0 | missing (no directory) | not started |

## Cross-phase integration (checker report)

- **30→31 toast vs overlay flags: WIRED.** Overlay-flag protocol (game.js + modal.js) untouched by 31-02; flags are per-frame tags, clearing is queue state. Double-clear (gScene + Fade.update) idempotent.
- **30→32+ harness readiness: WIRED.** Inject/assert/allowlist/sweep wired; fail-first re-proven 4/4 in 31-02; sim BAL JSON ready for Phase 35.
- **31 internal dual-system × dual-path: WIRED.** Notify + Feedback stamp and clear on both paths; achievements structurally exempt; no lane-constant conflict (LAY-02 field clean).
- **E2E Ashram boot: COMPLETE.** Lexical attach + binding regression + clean boot matrix.
- **E2E combat entry: COMPLETE at wiring.** Routes + go() + fade forwarding verified; visual overlaps owned by Phase 32.
- **E2E toast repro path: PARTIAL.** Breaks at live-tap observation (reproduced:false by honest headless limit).
- **WARNING 1 (LAY-05):** redirect-notice wipe — Scene.navigate toast dies in gScene pre-branch clear on all paths; game.js comment claiming survival is false.
- **WARNING 2 (LAY-00/LAY-02):** Feedback toasts untagged in overlay protocol — Phase 32 should add the flag.
- **BLOCKERs by absence:** LAY-01/02/07-full (Ph32), LAY-03/04 (Ph33), LAY-06 (Ph34), BAL-01/02/03 (Ph35) all UNWIRED — nothing built, nothing broken.

## Nyquist compliance

`workflow.nyquist_validation` is enabled; no `*-VALIDATION.md` in any phase directory → all 6 phases MISSING. Discovery only; no validation run. Suggested: `/gsd-validate-phase 30` once Phase 31 verification lands, or per-phase as 32–35 execute.

## Recommendation

1. Write `31-VERIFICATION.md` from the two SUMMARYs + sweep numbers (converts LAY-05 partial → satisfied at contract level).
2. Tick the LAY-00 checkbox in REQUIREMENTS.md (contract evidence supports it).
3. Plan and execute Phases 32–35 in roadmap order (toast lane depends on 31; pacing last).
4. Fold the two WARNINGs into Phase 32 scope: redirect-notice ordering + Feedback overlay flag.
5. Do NOT complete this milestone — 10/11 requirements remain open by absence, not by dispute.
