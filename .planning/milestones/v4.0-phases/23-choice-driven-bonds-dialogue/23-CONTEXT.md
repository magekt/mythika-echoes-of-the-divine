# Phase 23: Choice-Driven Bonds & Dialogue - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Encounter choices raise affinity for party-present heroes, and tier thresholds unlock a full 3-event bond arc (recruit → crisis → oath) per hero in the encounter UI. No decay, ever.

</domain>

<decisions>
## Implementation Decisions

### Gain Size
- Small gains: +2 standard kind choice, +4 major sacrifice choice. Legend 90 stays hard-earned across many choices.

### Dialogues
- Full 3-event arc per hero: recruit scene (on recruitment), crisis scene (Trusted tier), oath scene (Sworn tier). Reuse encounter prompt/choice UI, Canvas immediate-mode.

### Repeat Gains
- Repeatable with caps: first completion grants full gain via `bond_<hero>_<event>` flag; replays grant +1 up to a weekly-equivalent cap tracked in flags (no infinite farming).

### Eligibility
- Gains apply only when the hero is recruited and in the active party (in-earshot rule from research).

### OpenCode's Discretion
- Exact cap numbers, flag key shapes, and crisis/oath copy (respectful mythological tone, oath framing not romance).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/systems/encounter.js` choice resolution + `src/data/encounters.js` choice schema (extend with `affinity: {heroId: n}`).
- `BondSystem` (Phase 22): tierFor/add/get, `G.state.affinity`, normalize.
- Encounter prompt/choice UI for bond scenes; quest flag conventions (`G.state.flags`).

### Established Patterns
- Exactly-once via flags; canonical systems own mutations; encounter rewards route through canonical APIs.
- `R.reducedMotion()`; semantic tokens.

### Integration Points
- Encounter choice application point; heroSurface meter (Phase 22) reflects gains immediately.
- Save round-trip covers new flags automatically via existing flag persistence.

</code>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decided gain/arc/repeat rules.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
