# Phase 24: Combat Bonds - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Bonded heroes fight better: tier passives apply in the active party and adjacent bonded pairs grant synergy buffs. Bonuses linger exactly one battle after benching, then drop.

</domain>

<decisions>
## Implementation Decisions

### Tier Passive
- DAO-style non-cumulative bumps to the hero's role stat: +1 Trusted, +2 Sworn, +4 Legend. Applied in combat stat calc only when the hero is in the active party (or lingering).

### Synergy
- Adjacent bonded pair: a Sworn+ hero positioned next to the player grants a small single-tag buff (per-hero tag, e.g. crit, intercept). One tag per hero, not a tree.

### Removal
- Linger one battle: after benching, bonuses persist for the next completed battle only (tracked flag), then drop. Moving the hero back in resets normally.

### OpenCode's Discretion
- Exact per-hero synergy tags and linger-flag plumbing, within existing combat hooks.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BondSystem.tierFor` (Phase 22) for tier lookup; combat stat calc in `src/systems/combat.js`.
- Combat readability bands (Phase 14) — bonuses must surface in intent/result displays without overlap.

### Established Patterns
- Canonical systems own mutations; combat authority boundaries from Phase 14 contracts.
- `R.reducedMotion()`; semantic tokens; feedback Toasts for bonus application/removal.

### Integration Points
- Combat start (apply), combat end (linger bookkeeping), party bench action (set linger flag).
- HeroSurface could show active bonus state (optional, discretion).

</code>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decided passive/synergy/linger rules.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
