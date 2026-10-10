# Phase 21: Browser Evidence Catch-Up - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning
**Mode:** Auto-generated (evidence-collection phase; recipe defined by prior verifications)

<domain>
## Phase Boundary

Execute the deferred v2.0 + v3.0 browser matrix in a real Chrome browser and record per-combination evidence: console silence, probe FPS, dense states, reduced motion, worker/cache activation, legacy-save boot. No source changes unless the matrix exposes a defect (then: minimal fix + contract test).

</domain>

<decisions>
## Implementation Decisions

### Evidence Scope
- Run `tools/verify_matrix.py --budget 6000` profiles (desktop/phone/phone-land) plus the 10-combination full-loop matrix from archived `20-VERIFICATION.md` (fresh + existing-worker × 5 viewports).
- Screenshots retained under `tools/shots/`; console/probe captures recorded into `21-VERIFICATION.md` evidence tables.
- Reduced-motion and legacy-save boot covered explicitly (OS setting + `G.state.reduceMotion`, legacy save fixture).

### OpenCode's Discretion
- Exact run order and capture format; whether to use `--fps` probe gate.
- Defect triage: if the matrix exposes failures, fix-or-defer verdict per failure with evidence.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/verify_matrix.py` — headless Chrome harness with boot-beacon grep and screenshot capture.
- `tools/check_ui_invariants.sh` — static gate (already green).
- `?probe` + `&selftest` diagnostics built into the client.

### Established Patterns
- Prior verifications record "Automated / Deferred Browser Evidence / Status" sections; Phase 21 fills the deferred tables.
- `MYTHIKA_CHROME` selects the browser binary; local Chrome exists at the default macOS path.

### Integration Points
- Evidence rows live in `21-VERIFICATION.md`; the 10-combination journey table mirrors archived `20-VERIFICATION.md`.

</code>

<specifics>
## Specific Ideas

No specific requirements — execute the defined matrix and record honestly (pass rows pass, fail rows fail with logs).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
