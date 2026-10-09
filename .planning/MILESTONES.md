# Milestones

## v3.0 — Screen & Gameplay Revamp

**Status:** ✅ SHIPPED 2026-10-09  
**Scope:** Phases 13–20 · 8 phases · 23 plans  
**Evidence:** REQ-021 through REQ-034 validated at contract level; 202/202 tests pass + UI invariants green.  
**Archive:** [ROADMAP](milestones/v3.0-ROADMAP.md) · [REQUIREMENTS](milestones/v3.0-REQUIREMENTS.md) · [phase history](milestones/v3.0-phases/)

### Delivered

- Responsive screen grammar with consistent labeled navigation, back behavior, and 5-viewport matrix contracts.
- Readable combat state bands and a reusable read-only hero identity surface across character screens.
- Shared feedback library (toast, inline hint, contextual badge, blocker tooltip) wired at all confirmation and denial points.
- Canvas-first semantic backgrounds with cached/fallback layers in 7 scenes; LRU-bounded, reduced-motion compliant.
- Canonical navigation routes with legacy-compatible facades; lifecycle guards with leak prevention and failure recovery.
- Evidence-led deprecated-code removal with save-fixture proof; disabled-by-default bounded diagnostics behind a Settings toggle.

### Accepted residual debt

- Live-browser evidence deferred across all 8 phases (same precedent as v2.0): console silence, probe FPS, dense states, reduced motion, existing-worker cache activation.
- 10-combination full-loop journey matrix defined with all rows pending (see 20-VERIFICATION.md in archive).

See `.planning/milestones/v3.0-MILESTONE-AUDIT.md` for the final `gaps_found` audit and evidence details.

---

## v2.0 — Living Map & World State

**Status:** ✅ SHIPPED 2026-09-20  
**Scope:** Phases 6–12 · 7 phases · 17 plans  
**Evidence:** REQ-013 through REQ-020 validated; final integration audit has no blockers; 69/69 tests pass.  
**Archive:** [ROADMAP](milestones/v2.0-ROADMAP.md) · [REQUIREMENTS](milestones/v2.0-REQUIREMENTS.md) · [phase history](milestones/v2.0-phases/)

### Delivered

- Persistent, defensive world-state continuity across current, legacy, partial, and malformed saves.
- Touch-first visual region map using canonical existing zones and authoritative access rules.
- Persistent landmark discovery, regional influence/control, environmental narrative echoes, and local dynamic world events.
- Stable, reduced-motion-aware rendering with lifecycle cleanup, caching, culling, and bounded state.

### Accepted residual debt

- Existing-worker cache activation and legacy-save browser boot evidence.
- Phase 11 event walkthrough evidence.
- Phase 12 mobile FPS, dense-map, and reduced-motion walkthrough evidence.

See `.planning/v2-MILESTONE-AUDIT.md` for the final `tech_debt` audit and evidence details.
