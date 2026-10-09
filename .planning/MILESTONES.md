# Milestones

## v4.0 — Deep Companions & Living Zones

**Status:** ✅ SHIPPED 2026-10-09  
**Scope:** Phases 21–29 · 9 phases · 26 plans  
**Evidence:** AFF-01 through GFT-01 plus SAV-01 validated at contract level; 379/379 tests pass + UI invariants green.  
**Archive:** [ROADMAP](milestones/v4.0-ROADMAP.md) · [REQUIREMENTS](milestones/v4.0-REQUIREMENTS.md) · [phase history](milestones/v4.0-phases/)

### Delivered

- Hero affinity bonds: meter + tiers on the hero surface, choice-driven gains, and a 15-event bond dialogue arc reusing encounter UI.
- Combat bonds: tier passives, pair synergy buffs, linger-one-battle behavior, and signature duo skills for all five heroes (COMMIT-ALL-FIVE verdict).
- Spirit-beast bonding: bond hearts via battle XP plus feed/train care actions with caps and explained denials; heart potency, heart-2 auras, and heart-3 evolution assist.
- Living zones: 12 companion-gated encounter variants with zero new zone IDs, plus landmark/echo references to the highest-bond companion (oath naming).
- Hero gifts: 19-gift catalog with hero rosters, diminishing returns, weekly caps, and tier locks routed through canonical Economy + BondSystem.
- Save-compatible persistence: affinity, linger, combo flags, gift flags, and beastBond healed in the migrate chain with legacy/malformed/hostile-key coverage.
- Browser evidence harness: headless Chrome boot matrix green with 3 deterministic boot defects found and fixed.

### Known gaps

- EVD-01 journey rows pending: F1–F5/W1–W5 live-browser matrix unexecuted (console silence, probe FPS, dense states, reduced motion, worker/cache activation). Accepted residual per v2.0/v3.0 precedent.
- Feature walkthroughs deferred across Phases 22–29 (affinity meter, bond scenes, combat log/Toast, duo button, feed/train taps, aura lines, variant tease, gift picker).

See `.planning/milestones/v4.0-MILESTONE-AUDIT.md` for the final `gaps_found` audit and evidence details.

---

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
