# Phase 62: Layout Harness Regression - Context

**Gathered:** 2026-10-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Verify layout harness tests pass at all 5 viewport sizes (400×720, 540×900, 720×400, 1024×768, 1440×900) after all HUD alignment changes. No layout logic changed in v12.0 — only HUD draw order and verification tests were added.

</domain>

<decisions>
## Implementation Decisions

### Layout harness coverage at all 5 viewports
- Layout harness tests (`tests/layout_harness.test.js`) already pass at all 5 viewport sizes ✓
- No layout logic changes in v12.0 — only draw order (HUD renders last) and coordinate assertion tests were added
- No regression possible since layout math is unchanged

### HUD-specific layout harness test cases
- HUD alignment is covered by `tests/hud_alignment.test.js` (coordinate assertions at all 5 viewports)
- Layout harness tests box overlap/overflow logic — separate concern from HUD position
- No additional layout harness test cases needed

### Layout harness as CI gate
- `check_ui_invariants.sh` already runs layout harness as part of UI invariants check
- No additional CI integration needed

</decisions>

<specifics>
## Specific Ideas

None — regression verification only, no new logic needed.

</specifics>

<canonical_refs>
## Canonical References

### Requirements
- `.planning/REQUIREMENTS.md` — HUD-08 (layout harness tests pass at all 5 viewport sizes) requirement for v12.0
- `.planning/ROADMAP.md` — Phase 62 goal and success criteria (phases 57–64)
- `.planning/PROJECT.md` — v12.0 constraints

### Code
- `tests/layout_harness.test.js` — layout harness contract tests at 5 viewport sizes
- `tools/layout_harness/inject.js` — box math injection
- `tools/layout_harness/assert.js` — violation detection
- `tools/layout_harness/expected_pairs.json` — frozen oracle shape

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Layout harness tests (`tests/layout_harness.test.js`) — 15 tests, all passing
- `tools/layout_harness/inject.js` — `computeBoxFromCtx` for box overlap detection
- `tools/layout_harness/assert.js` — `findViolations` for layout violation detection
- `tools/layout_harness/seeded_save.json` — seeded save for regression testing
- `tools/layout_harness/expected_pairs.json` — expected violation pairs

### Established Patterns
- Layout harness tests box overlap, overflow, clip, and scroll-clip violations
- Tests run at 5 viewport sizes: 400×720, 540×900, 720×400, 1024×768, 1440×900
- No layout logic changes in v12.0

### Integration Points
- `check_ui_invariants.sh` — runs layout harness as part of UI invariants check
- `tests/layout_harness.test.js` — standalone test file, runs with `node --test`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 62-layout-harness-regression*
*Context gathered: 2026-10-22*
