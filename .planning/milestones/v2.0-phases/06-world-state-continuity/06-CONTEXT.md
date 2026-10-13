# Phase 6: World-State Continuity - Context

**Gathered:** 2026-09-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Ensure evolving world state survives reloads and legacy saves safely, including service-worker asset coherence and verification evidence. Preserve version-1 save compatibility and unrelated player progress.

</domain>

<decisions>
## Implementation Decisions

### Service-worker coherence
- **D-01:** Treat the current cache key as authoritative and increment from the current `mythika-v11` only if a code change requires invalidation; do not revert to the stale plan target v10.
- **D-02:** Preserve the existing network-first shell and cache-first asset strategy; limit work to cache invalidation, precache coverage, and tests.

### Save compatibility
- **D-03:** Keep save envelope version 1 and normalize the nested world branch at the existing hydration migration boundary.
- **D-04:** Missing or malformed world data must resolve to the canonical defensive shape without invoking gameplay mutation APIs or replaying outcomes.

### Verification
- **D-05:** Use current source and automated tests as implementation evidence, while adding explicit evidence for cache-version freshness and current script/precache coherence.
- **D-06:** Treat the remaining browser cache activation and legacy-save boot/Travel Map checks as manual verification, not as a reason to alter the migration contract.

### OpenCode's Discretion
- Exact test structure and metadata reconciliation.
- Whether completion evidence is recorded in a new verification artifact or an updated phase UAT record, provided it follows repository conventions.

</decisions>

<specifics>
## Specific Ideas

- Current `sw.js` already contains `src/systems/world_state.js` and related map assets; the plan's v10 wording is stale because the worker is currently v11.
- Existing `tests/save_coherence.test.js` and `tests/world_state.test.js` are the authoritative regression harnesses.

</specifics>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 6 goal, plans, and completion state.
- `.planning/REQUIREMENTS.md` — REQ-015 acceptance criteria.
- `.planning/PROJECT.md` — persistence and offline constraints.
- `.planning/phases/06-world-state-continuity/06-03-PLAN.md` — intended cache-coherence scope and gates.
- `.planning/debug/phase-6-legacy-save.md` — diagnosed mixed-version service-worker failure.
- `sw.js` — current cache version and precache manifest.
- `tests/save_coherence.test.js` — script/precache and legacy hydration checks.
- `tests/world_state.test.js` — world-state normalization, round-trip, and replay-safety checks.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SaveSystem.migrate()` — existing migration boundary for world normalization.
- `WorldState.normalize()` — canonical defensive world-state contract.
- `tests/save_coherence.test.js` — static service-worker coherence harness.
- `tests/world_state.test.js` — malformed, legacy, round-trip, and replay-safety coverage.

### Established Patterns
- Version-1 save envelopes remain backward compatible.
- Browser scripts are loaded in explicit dependency order and mirrored by service-worker precache.
- World-state mutations are bounded and idempotent; loading must remain side-effect free.

### Integration Points
- `index.html` local script list must remain covered by `sw.js`.
- `SaveSystem.load()` hydrates and normalizes before offline progression.
- Phase completion metadata must agree with ROADMAP and STATE.

</code_context>

<deferred>
## Deferred Ideas

- Redesigning the service-worker fetch strategy — outside Phase 6.
- Changing save envelope versioning — unnecessary unless a future incompatible schema requires it.
- New world features or event generation — later feature scope.

</deferred>

---

*Phase: 06-world-state-continuity*
*Context gathered: 2026-09-19*
