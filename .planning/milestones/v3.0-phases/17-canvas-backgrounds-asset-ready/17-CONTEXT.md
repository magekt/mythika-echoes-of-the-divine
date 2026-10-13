# Phase 17: Canvas Backgrounds & Asset-Ready Presentation — Context

**Gathered:** 2026-10-08  
**Status:** Ready for execution planning  
**Requirement:** REQ-028, REQ-029

<domain>
## Phase Boundary

Add purposeful, performant visual atmosphere and character moments to revamped screens using semantic background/character slots with cached authored imagery or deterministic fallback art. The system must not reduce text/control contrast, block screen entry, or create unbounded allocations. It owns presentation and asset slot selection; canonical systems continue to own all gameplay state.

The phase includes automated source/contract coverage and a browser/device verification recipe. It does not include new asset production, background/asset pipeline tooling, navigation seam migration (Phase 18), or broad lifecycle cleanup (Phase 19).
</domain>

<decisions>
## Locked Decisions

### D-01 — Semantic slots with cached/fallback behavior
- Define background slots: `realm:{id}`, `zone:{id}`, `combat:{enemyType}`, `cultivation:{realm}`, `ashram`, `map:{region}`.
- Define character slots: `hero:{id}:{state}`, `enemy:{id}`, `npc:{id}`.
- On screen enter: check cache for slot key → if hit, render immediately; if miss, show deterministic fallback (procedural gradient/noise/silhouette) and kick off async load.
- Failed/slow loads (>2s) remain on fallback; successful loads crossfade in (reduced motion: instant swap).
- Cache bounded by LRU (max 20 entries, max 5MB total); cleared on memory pressure.

### D-02 — Atmosphere without hiding gameplay
- Backgrounds render behind all UI/gameplay layers; never overlap text, controls, or Canvas hit regions.
- Contrast maintained: backgrounds use `R.colors.surfaceGlass` overlay or darken blend; text always on `textPrimary`/`textSecondary`.
- Character moments (hero/enemy silhouettes) positioned in designated safe zones (top 30%, bottom 20%, side gutters) away from action bands.
- Reduced motion: static backgrounds, no parallax/drift, crossfade instant.

### D-03 — No unbounded allocations
- All background/canvas assets managed through single `R.backgroundCache` (Map<string, HTMLImageElement|OffscreenCanvas>).
- Screen enter/leave clears only that screen's slot references; global cache persists across navigation.
- No per-frame canvas creation; reuse OffscreenCanvas for procedural fallbacks.
- Memory profile tested via `?probe` at all 5 viewport sizes.

### D-04 — Integration with existing screen grammar
- Backgrounds added to Phase 13 screen shell (Scene.drawHeader/content area).
- Character moments added to Phase 15 hero surface contexts (result, cultivation, party detail).
- Combat backgrounds use Phase 14 layout bands (background behind intent/log/result).
- No changes to Phase 13/14/15/16 contracts.

## OpenCode's Discretion

- Choose procedural fallback generators (gradient, noise, pixel silhouette) per slot type.
- Choose asset naming convention and cache key format.
- Choose crossfade implementation (alpha lerp over 300ms, reduced motion: 0ms).
- Choose LRU eviction strategy and memory pressure handling.

</decisions>

<canonical_refs>
- `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`
- `.planning/research/ARCHITECTURE.md`, `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md`, `.planning/research/STACK.md`
- `codemap.md`, `STYLE_GUIDE.md`, `src/engine/codemap.md`, `src/scenes/codemap.md`, `src/ui/codemap.md`
- `src/engine/renderer.js` (R.renderNoise, R.colors, R.fonts, R.radius, R.reducedMotion)
- `src/scenes/party.js`, `src/scenes/equipment.js`, `src/scenes/cultivationScene.js`, `src/scenes/combatScene.js`, `src/scenes/travelMap.js`, `src/scenes/ashram.js`, `src/scenes/zoneExploration.js`
- `.planning/phases/13-responsive-screen-grammar-navigation/13-CONTEXT.md`, `13-03-SUMMARY.md`
- `.planning/phases/14-combat-gameplay-readability/14-CONTEXT.md`, `14-01-SUMMARY.md`
- `.planning/phases/15-character-party-surfaces/15-CONTEXT.md`, `15-02-SUMMARY.md`, `15-UI-REVIEW.md`
- `.planning/phases/16-guidance-progression-feedback/16-CONTEXT.md`
</canonical_refs>

<deferred>
- New asset production, background/asset pipeline tooling, CDN/remote asset loading, navigation/store architecture migration (Phase 18), diagnostics implementation (Phase 20), broad lifecycle/deprecated-code cleanup (Phase 19).
</deferred>