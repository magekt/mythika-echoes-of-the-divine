# Phase 27: Beast Power & Evolution Assist - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Bond hearts convert to power: incremental element-aligned potency per heart, a beast-specific aura plus a universal flat stat boost at heart 2, and halved evolution level requirements at heart 3.

</domain>

<decisions>
## Implementation Decisions

### Potency
- Incremental per heart, element-aligned: each heart adds one increment to the beast's elemental skill potency (fire hits harder with fire, etc.). Linear and predictable.

### Heart-2 Passive
- Both: a beast-specific aura (per-beast flavor: ember regen, stone ward, gale focus...) AND a flat stat boost every beast gets (same +HP/+attack for all at heart 2).

### Evolution Assist
- Heart 3 halves the evolution level requirement (bonded beasts evolve earlier). Materials unchanged.

### OpenCode's Discretion
- Exact increment sizes, aura definitions per beast, flat boost numbers, and spiritBeast/combat surfacing.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 26 `BeastBond` hearts/XP/caps; `createBeastState`/`getBeastBonus`; `BEAST_EVOLUTIONS` requirement checks.
- Combat beast-skill hooks; spiritBeast scene cards.

### Established Patterns
- Clones-only combat mutation; canonical economy authority; Toast confirmations; save normalize for new fields.
- Semantic tokens; reduced motion.

### Integration Points
- Beast skill potency calc, evolution requirement check, spiritBeast scene display, save migrate.

</code>

<specifics>
## Specific Ideas

No specific requirements beyond the potency/aura/evolution rules above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
