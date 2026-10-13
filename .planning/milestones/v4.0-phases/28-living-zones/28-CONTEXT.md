# Phase 28: Living Zones - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Existing zones gain bond-reactive encounter variants scaled to zone size and story fit, landmarks/echoes name oath-bound companions, and unqualified players get a teased hint — never a dead end.

</domain>

<decisions>
## Implementation Decisions

### Variants
- Scaled by zone size and story: small zones 1 variant, medium zones 2, large zones 3. Each zone's variants feature its story-relevant heroes (and beasts where fitting). Companion encounters per zone are limited by size and story — no padding.

### Echo Style
- Name the oath: landmark/echo entries reference the highest-bond companion per zone (oath marker naming), in player-facing language.

### Ungated Default
- Teased lock: below-threshold players get the standard encounter plus a hint that deeper bonds open more (drives the bond loop without blocking).

### OpenCode's Discretion
- Exact variant-to-hero mapping per zone (read zone sizes from `zones.js`/`map_layout.js`), gating thresholds, and tease copy.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Zone encounter pools with `flagsReq` gating; `affinityMin`/`bondMin` pattern from research.
- `landmarks.js` + `narrative_echoes.js` keyed by zone ID; `BondSystem.tierFor`, BeastBond hearts.
- `UI.Feedback` Toasts for unlock/tease moments.

### Established Patterns
- Exactly-once rewards; canonical system mutations; variant data declarative in `src/data/`.
- Semantic tokens; reduced motion; player-facing language for consequences.

### Integration Points
- Zone pools, landmark detail views, echo markers on travel map, save flags for variant completion.

</code>

<specifics>
## Specific Ideas

No specific requirements beyond the size-scaled, story-fit variant rule above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
