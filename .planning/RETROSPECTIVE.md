# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

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

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v2.0 | 69/69 | REQ-013–020 (8/8) | world-state, landmarks, influence, echoes, events systems |
| v3.0 | 202/202 + UI invariants | REQ-021–034 (14/14, contract level) | navigation, heroSurface, feedback, backgrounds, lifecycle, diagnostics |

### Top Lessons (Verified Across Milestones)

1. Browser-evidence debt recurs (v2.0 → v3.0); it needs a scheduled, owned slot — not a verification checkbox.
2. Compatibility facades preserve the vanilla-JS global runtime while allowing real architectural progress.
3. Traceability tables and STATE.md counters rot unless updated mechanically at phase close.
