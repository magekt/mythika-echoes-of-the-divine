# Phase 63: UI Invariants Gate - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify check_ui_invariants.sh reports clean after all HUD alignment changes. UI invariants cover JavaScript syntax, script loading order, and UI-specific invariants (no new element types, no WebGL, Canvas 2D only).

</domain>

<decisions>
## Implementation Decisions

### check_ui_invariants.sh clean
- check_ui_invariants.sh already passes after all HUD alignment changes ✓
- Checks: JavaScript syntax (102 files), script loading order, UI invariants (no new element types, no WebGL, Canvas 2D only)
- No additional invariant checks needed

### Additional invariant checks
- Current checks are sufficient — cover syntax, script order, and UI-specific constraints
- HUD alignment changes don't introduce new UI invariant risks

### CI gate integration
- check_ui_invariants.sh already part of project verification workflow
- Runs as part of milestone verification — no additional CI integration needed

</decisions>

<specifics>
## Specific Ideas

None — verification only, no new checks needed.

</specifics>

<canonical_refs>
## Canonical References

### Requirements
- `.planning/REQUIREMENTS.md` — HUD-09 (check_ui_invariants.sh clean) requirement for v12.0
- `.planning/ROADMAP.md` — Phase 63 goal and success criteria (phases 57–64)
- `.planning/PROJECT.md` — v12.0 constraints: no new element types, no WebGL, Canvas 2D only

### Code
- `tools/check_ui_invariants.sh` — UI invariants check script
- `src/engine/game.js` — HUD renders last (draw order change)
- `src/engine/renderer.js` — R namespace, no WebGL, Canvas 2D only

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/check_ui_invariants.sh` — invariant check script
- `tools/check_ui_invariants.sh` checks:
  1. JavaScript syntax across all source files
  2. Script loading order (classic globals, script order preserved)
  3. UI invariants (no new element types, no WebGL, Canvas 2D only)

### Established Patterns
- UI invariants checked as part of project verification workflow
- No new UI invariants introduced in v12.0

### Integration Points
- `tools/check_ui_invariants.sh` — standalone script, runs with `bash tools/check_ui_invariants.sh`
- Full test suite includes UI invariant checks

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 63-ui-invariants-gate*
*Context gathered: 2026-10-22*
