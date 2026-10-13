# Feature Landscape: v4.0 Deep Companions & Living Zones

**Domain:** Companion/affinity depth on existing heroes, beasts, zones (no new geography)
**Researched:** 2026-10-09

## Table Stakes

| Feature | Expected behavior | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| Per-hero affinity meter + tiers | `affinity[heroId]` 0–100, 4 tiers (Wary→Trusted→Sworn→Legend); tier thresholds gate dialogue + bonus; visible meter on hero surface | Med | `G.state.party` hero objects, `UI.HeroSurface`, `SaveSystem.migrate` defaults |
| Choice-driven affinity gains | Existing `ENCOUNTERS` choice schema extended: `affinity: {heroId: ±n}` + `flags: {'bond_<hero>_<event>': choice}`; gains only when hero recruited/in-earshot (in party) | Med | `src/systems/encounter.js`, `src/data/encounters.js`, `G.state.flags` |
| Bond dialogue events | 2–3 authored conversations per hero (recruit → crisis → oath), unlocked by tier + flag; reuse encounter prompt/choice UI, Canvas immediate-mode | Med | Encounter UI, quest flag conventions |
| Tier combat bonus (passive) | Per-hero stat bump at tiers (e.g. +1/+2/+4 to role stat, DAO-style non-cumulative); applies only when hero in active party | Low | `src/systems/combat.js` stat calc, party membership check |
| Pair/party synergy bonus | Bonded hero adjacent to player grants small pair buff (e.g. Arjuna +5% crit, Bhima damage-intercept 15%); single tag per hero, not a tree | Med | Combat formulas, `isAlly`/intercept hook |
| Beast bond hearts | `bond[beastId]` 0–3 hearts via battle-together XP + feed/train actions; each heart = +skill potency step and unlocks one passive at heart 2 | Med | `createBeastState`/`getBeastBonus`, beast level/xp |
| Beast feed/train actions | Feed = consume farm/alchemy item (reuse inventory); train = spend gold/prana with cooldown; both give fixed bond XP with daily cap | Low | Economy, farm, alchemy, inventory items |
| Companion-gated zone encounters | Existing zone pools gain variants with `flagsReq` + `affinityMin`/`bondMin` (e.g. Naga ford reacts if Bhima Sworn); no new zone IDs | Med | Zone pools, `landmarks.js`, `narrative_echoes.js`, `world_events.js` |
| Save-compatible persistence | `affinity`, `bond`, `bondFlags` under version-1 save with `normalize` healing (clamp 0–100/0–3, drop unknown hero/beast keys, proto-pollution guard like `WorldState`) | Low | `src/systems/save.js`, `src/systems/world_state.js` |

## Differentiators

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| One signature combo per hero | Tier-3 unlocks single duo skill (e.g. Hanuman Mountain-Leap follow-up); high fantasy payoff, one anim + one formula each | High | Combat scene only; defer if combat readability regresses |
| Beast evolution assist | Heart 3 counts as half the level requirement for `BEAST_EVOLUTIONS` (bonded beasts evolve earlier); makes bonding strategically distinct from grinding | Low | Evolution check hook |
| Narrative echoes recall bonds | `narrative_echoes` entries reference highest-bond companion per zone (e.g. landmark plaque names the oath); cheap environmental payoff | Low | Echo/landmark data keyed by zone ID |
| Hero-specific gift preferences | 2–3 liked items per hero from existing `items.js` (+3 affinity, diminishing to +1, weekly cap); personality without new art | Low | Economy item IDs; caps prevent gift-vending |

## Anti-Features

| Anti-Feature | Why avoid | Instead |
|--------------|-----------|---------|
| Romance/dating paths | Scope + cultural-sensitivity risk on mythological figures; not in milestone | Sworn-sibling / guru-shishya oath framing |
| Companion departure/betrayal | Destroys party trust + save-compat pain (BG3/DAO abandonment); hostile to mobile-idle loop | No leaving; low affinity = dormant bonus only |
| Morale decay / needs meters | Idle-game hostile; punishes absence, forces upkeep grind | Gains only, no decay; caps on gains, not drains |
| Multi-axis affection/trust/respect vectors | Overkill for 5 heroes + localStorage; triples writing/balancing | Single 0–100 meter + event flags |
| Full companion skill trees | Combat-rewrite scope; conflicts with v4.0 "no broad combat rewrite" boundary | One passive + one combo per hero max |
| Pet-sim hunger/hygiene | Grind without narrative payoff; unbounded timers break offline/PWA | Feed/train = capped bond-XP actions |
| New zones/realms for bonds | Explicitly out of scope | Landmark/echo/encounter variants within current zone IDs |

## Feature Dependencies

```
Affinity meter → bond dialogue → tier bonus → signature combo (each tier gates the next)
Beast feed/train + battle-together → bond hearts → skill potency → evolution assist
Affinity/bond thresholds → zone encounter variants → landmark/echo reactions
All → save normalize (migrate must heal old saves: default 0, clamp, drop unknown keys)
```

## MVP Recommendation

Prioritize: meter+tiers, choice gains, 1 dialogue per hero, tier passive bonus, beast hearts + feed, 1 gated encounter per existing zone, save normalize.
Defer: signature combos (one hero pilot first), gift preferences (after economy audit), echo naming (cheap, do last).

## Sources

- Companion approval mechanics (Dragon Age/BG3 patterns, gift-vending pitfall): gamemechanicshoard.com/mechanic/companion-approval/ (LOW — websearch only)
- Tier = approval + progressionEvent + party buff pattern (cultivation-genre specific): AFNM mod relationship-system docs (MEDIUM — two corroborating pages, unverified version)
- Role-based reactions + morale-departure warning: AI RPG Engine companions ch.39 (LOW — single source; departure explicitly rejected above)
- ESO rapport thresholds + personal quests + non-combat perks: elderscrollsonline.com companion guide 2021 (MEDIUM — official docs, dated)
- Codebase grounding: `src/data/heroes.js`, `src/data/spirit_beasts.js`, `src/data/encounters.js`, `src/systems/save.js`, `src/systems/world_state.js` (HIGH — read directly)
