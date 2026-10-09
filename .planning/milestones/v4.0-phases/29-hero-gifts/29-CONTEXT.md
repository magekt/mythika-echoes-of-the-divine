# Phase 29: Hero Gifts - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Each hero gets a late-game-deep roster of liked gifts drawn from (and added to) `items.js`. Gifting grants steep diminishing affinity (+13/+8/+5, then +3) under both a weekly-equivalent flag cap and tier locks. No gift-vending: gifts supplement bonds, never replace them.

</domain>

<decisions>
## Implementation Decisions

### Gift Mapping
- Extend `items.js` so every hero has liked gifts through late game: roster size per hero ≈ zones + cultivation levels + story rewards. Personality-matched to each hero; reuse existing item IDs where they fit, add new gift items where gaps exist.

### Diminishing
- Per hero–item pair: first gift +13, second +8, third +5, subsequent +3. Tracked per pair in flags.

### Cap
- Both: a weekly-equivalent flag cap on total gift affinity per hero AND tier-locked gifts (each gift declares a min tier to be effective; top gifts locked behind Sworn+).

### OpenCode's Discretion
- Exact item IDs, roster sizes after reading zones/cultivation/story counts, gift UI placement (party/equipment screens), and Toast copy.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/data/items.js` item schema; `BondSystem.add` gains path; `G.state.flags` conventions.
- Inventory consumption via Economy authority; `UI.Feedback` Toasts.
- Weekly-equivalent cap precedent: bond replay caps (Phase 23), feed/train caps (Phase 26).

### Established Patterns
- Capped gains, no decay; exactly-once flags; canonical economy owns item consumption.
- Semantic tokens; reduced motion; player-facing blocker reasons.

### Integration Points
- Gift action in party/equipment UI; inventory decrement; affinity meter refresh; save flags.

</code>

<specifics>
## Specific Ideas

No specific requirements beyond the roster-scale, diminishing, and dual-cap rules above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
