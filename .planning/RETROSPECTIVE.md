# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v4.0 — Deep Companions & Living Zones

**Shipped:** 2026-10-09
**Phases:** 9 (21–29) | **Plans:** 26 | **Sessions:** single-day execution (2026-10-09)

### What Was Built

- Hero affinity bonds: meter + tiers on the hero surface, +2/+4 choice gains, 15-event bond arc reusing encounter UI (Phases 22, 23).
- Combat bonds: tier passives, pair synergy, linger-one-battle, signature duo skills for all five heroes (Phases 24, 25).
- Beast bonding: hearts via battle XP + feed/train care actions with caps and explained denials; potency, heart-2 auras, evolution assist (Phases 26, 27).
- Living zones: 12 bond-gated encounter variants with zero new zone IDs; landmark/echo bond references with oath naming (Phase 28).
- Hero gifts: 19-gift catalog, diminishing returns, weekly caps, tier locks via canonical Economy + BondSystem (Phase 29).
- Save-compatible persistence across all companion state with legacy/malformed/hostile-key coverage (Phases 22+24–29).
- Phase 21 headless Chrome boot harness green; 3 deterministic boot defects found and fixed.

### What Worked

- Single-authority companion state (BondSystem + BeastBond, never-throw, no R/UI dependency) kept 8 feature phases conflict-free: combat authority, encounter ledger, and economy ownership all intact at audit.
- Vertical slices with contract-first verification scaled to 9 phases in one day: 379/379 tests + UI invariants green at close.
- Traceability held: 15/15 requirements mapped exactly once, and the audit-time checkbox gap (11 stale boxes) was closed before milestone close — only the honest EVD-01 journey gap remains.
- Scheduling evidence debt first (Phase 21) at least produced a green harness + fixed defects, even though the human journey matrix still deferred.

### What Was Inefficient

- Live-browser evidence deferred a third consecutive milestone; debt now spans three milestones and grows each cycle (journey matrix + 8 feature walkthroughs). The verification checkbox is not the mechanism — an owned human browser slot is.
- Phase 21-02's blocking human checkpoint was the known bottleneck at plan time; planning it as a phase plan rather than a scheduled session guaranteed the deferral.
- ROADMAP.md phase details again drifted (TBD plan stubs for shipped phases 25–29); milestone close had to reconcile from phase directories.

### Patterns Established

- Single-authority system file for a feature family (one never-throw module, separate globals, canonical routing only) — companion depth without parallel stores.
- Readability verdicts as scope gates (COMMIT-ALL-FIVE): record the decision explicitly instead of letting scope creep silently.
- Read-time bond references (no persistence change) for landmark/echo personalization — personalization without migration risk.
- Explained denials with zero-mutation guarantees for capped actions (caps, cooldowns, diminishing returns).

### Key Lessons

1. Companion depth composes safely when one module owns the state and every consumer reads through it — no parallel stores, no backdoor writes.
2. Checkbox traceability rots within days unless ticking is part of phase close; audit-time reconciliation is the fallback, not the process.
3. Browser-evidence debt compounds: three milestones of deferral now require a dedicated evidence milestone or session, not a phase plan with a human gate.

### Cost Observations

- Model mix: unknown (not tracked this milestone).
- Sessions: single-day execution (2026-10-09), 9 phases / 26 plans.
- Notable: contract-first approach kept verification cheap again (Node suite + invariant script); the expensive item — human browser matrix — deferred a third time.

---

## Milestone: v3.0 — Screen & Gameplay Revamp

**Shipped:** 2026-10-09
**Phases:** 8 (13–20) | **Plans:** 23 | **Sessions:** ~8 (Sep 20 → Oct 9, 19 days)

### What Was Built

- Responsive screen grammar + canonical navigation: consistent labeled nav, back behavior, 8 canonical routes with legacy `gScene` compat (Phases 13, 18).
- Combat readability bands + read-only `HeroSurface` view-model across party/combat/cultivation/equipment/result (Phases 14, 15).
- `UI.Feedback` library (Toast, InlineHint, ContextualBadge, BlockerTooltip) wired at every confirmation + denial point with a global game-loop drain (Phase 16; gap closed 2026-10-09).
- `R.Backgrounds` semantic slots with LRU cache + procedural fallbacks in 7 scenes; contrast-safe, reduced-motion aware (Phase 17).
- `Lifecycle` guards via `Scene.create` auto-wrap + evidence-led deprecation removal with save-fixture hydration proof (Phase 19).
- Disabled-by-default `Diagnostics` system behind a Settings toggle; bounded buffers, save-stripped session data (Phase 20).

### What Worked

- Compatibility facades (Navigation wrapper, Scene auto-wrap, read-only selectors) let architecture improve without breaking the global runtime — zero gameplay-authority regressions.
- Contract-first verification per phase (Node tests + UI invariants) kept 8 phases shippable without a browser in the loop; audit could still map 14/14 requirements exactly once.
- Vertical screen slices delivered observable player capabilities each phase instead of horizontal rewrites.
- The feedback-gap addendum pattern (audit → targeted closure → re-verify full suite) resolved the only non-browser gap within a day.

### What Was Inefficient

- Live-browser evidence deferred in every phase, accumulating v2.0 + v3.0 debt; the 10-combination matrix was defined but never run — acceptance bottleneck is human browser time, not code.
- STATE.md drifted (stale "24 plans" vs verified 23; stale progress bar and resume pointers) because phase closes updated it partially; milestone close had to reconcile.
- REQUIREMENTS.md traceability table went stale (REQ-025..034 left `Pending`) while phases completed — audit became the source of truth instead of the table.
- Six untracked `.planning/debug/*.md` scratch notes accumulated outside the planning workflow and remain uncommitted.

### Patterns Established

- Facade-over-rewrite for global-runtime migration (canonical API + legacy wrapper + contract tests).
- Evidence-led deletion: `19-REMOVALS.md` call-site/runtime proof + save-fixture hydration as the bar for removing deprecated code.
- Diagnostics discipline: disabled-by-default, bounded, save-stripped, zero normal-play output; `?probe` stays independent.
- Audit addendum for gap closure (dated section appended to the milestone audit) instead of rewriting history.

### Key Lessons

1. Schedule the browser-evidence matrix as its own plan early in a milestone, not as the last plan of the last phase — otherwise it is structurally the first thing deferred.
2. Keep REQUIREMENTS.md traceability statuses current at each phase close; a stale table forces the audit to duplicate its job.
3. Reconcile STATE.md counters (plans, progress, resume pointers) mechanically at phase close — stale state compounds into milestone-close rework.
4. Route all debug scratch notes through the workflow's debug artifact path so they are committed or discarded deliberately.

### Cost Observations

- Model mix: unknown (not tracked this milestone).
- Sessions: ~8 execution sessions over 19 days (~5 hours active execution noted mid-milestone).
- Notable: contract-first approach kept verification cheap (Node suite + invariant script, no browser dependency); the expensive item — human browser matrix — was deferred rather than paid.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v2.0 | — | 7 (6–12) | Living-map vertical slices; browser evidence partially deferred |
| v3.0 | ~8 | 8 (13–20) | Facade-over-rewrite migration; audit-addendum gap closure; full browser matrix defined but deferred |
| v4.0 | 1 day | 9 (21–29) | Single-authority companion state; readability verdicts; evidence debt scheduled first but journey deferred again |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v2.0 | 69/69 | REQ-013–020 (8/8) | world-state, landmarks, influence, echoes, events systems |
| v3.0 | 202/202 + UI invariants | REQ-021–034 (14/14, contract level) | navigation, heroSurface, feedback, backgrounds, lifecycle, diagnostics |
| v4.0 | 379/379 + UI invariants | AFF/BST/ZON/GFT/SAV (14/15, contract level; EVD-01 deferred) | bond.js authority, beastBond, livingZones, gifts, save-chain healing |

### Top Lessons (Verified Across Milestones)

1. Browser-evidence debt recurs (v2.0 → v3.0); it needs a scheduled, owned slot — not a verification checkbox.
2. Compatibility facades preserve the vanilla-JS global runtime while allowing real architectural progress.
3. Traceability tables and STATE.md counters rot unless updated mechanically at phase close.
