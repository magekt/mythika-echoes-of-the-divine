# Phase 26: Beast Hearts & Care Actions - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Beast bond hearts (0–3) grow fast through both battle-together XP and feed/train care actions. Feeding mixes farm produce, alchemy herbs, and scaling gold; training spends prana freely plus cooldown-gated gold sessions.

</domain>

<decisions>
## Implementation Decisions

### Heart Pace
- Fast: battle-together XP and feed/train are co-equal drivers. Active players reach heart 1 quickly; heart 3 takes sustained care.

### Feed Cost
- Each feed consumes one farm/alchemy item plus gold scaling at 1.2× per current heart (base × 1.2^hearts). Bond-XP gain per feed is flat (1.1× base rate), capped per day-equivalent.

### Train Cost
- Two tracks: prana training (spend prana, no cooldown, smaller XP) and gold training (larger XP, per-beast cooldown). Both feed the same bond-XP pool with daily-equivalent caps.

### OpenCode's Discretion
- Base XP numbers, cap sizes, cooldown lengths, and beast-scene UI placement (spiritBeast scene).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/data/spirit_beasts.js` beast defs; beast state/XP helpers; farm produce + alchemy herb item IDs; gold/prana economy.
- `UI.Feedback` Toasts for feed/train confirmations and heart-up moments.
- Save normalize pattern (drop unknown keys, clamp, proto-pollution guard).

### Established Patterns
- Capped gains, no decay; canonical economy owns item/gold/prana mutations; read-only view data.
- Semantic tokens; reduced motion.

### Integration Points
- spiritBeast scene (feed/train buttons), battle end (battle-together XP), save migrate/normalize for `bond` map.

</code>

<specifics>
## Specific Ideas

No specific requirements beyond the feed/train cost rules above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
