# Product Brief: 2D Dynamic World

## Concept

A 2D dynamic-world RPG where the player is a chosen catalyst whose actions reshape one living region. Persistent world state, timed events, NPC schedules and relationships, factions, economy, hazards, and discoveries interact over time.

## Player Role

The player is a chosen catalyst entering an evolving region. They explore, intervene, cultivate power, form relationships, influence factions, and create consequences that continue after they leave or close the game.

## Core Player Loop

1. Explore the region and observe what has changed.
2. Meet NPCs and choose how to respond to their schedules, needs, and conflicts.
3. Make decisions that affect relationships, factions, resources, hazards, and discoveries.
4. Cultivate and prepare the player character for emerging threats.
5. Return later to see consequences unfold through new events, NPC behavior, prices, quests, and regional conditions.

## First Playable Slice

Build one living region containing:

- Persistent regional state.
- Time-based events that advance while the player is away.
- A small cast of NPCs with schedules, relationships, memory, and reactions.
- Faction influence and conflict.
- A lightweight economy with meaningful resource movement.
- Hazards and discoveries that respond to world conditions.
- A hybrid content model: authored characters and story arcs reacting to systemic changes.

## Success Signal

After one in-game day, the player should be able to identify a visible NPC consequence caused by their actions: an NPC changes location, availability, relationship, request, allegiance, or behavior.

## Design Principles

- **Consequences over notifications:** Show change through the world and NPC behavior, not only logs.
- **Persistent but understandable:** World state survives reloads and offline time while clearly explaining why it changed.
- **Systems support story:** Simulation creates variation; authored characters and arcs provide meaning.
- **Small, legible simulation:** Prefer a bounded, inspectable region over a large opaque world.
- **Player agency:** Important changes should be traceable to player choices, timing, or neglect.
- **2D clarity:** Use readable visual state changes, compact UI, and responsive presentation across mobile and desktop.

## Initial Scope

### In scope

- One region and its world-state model.
- Scheduled NPC behavior and relationship changes.
- Timed events and offline progression.
- Faction influence and basic economy.
- Hazards, discoveries, and consequence presentation.
- Persistence, debug inspection, and deterministic test fixtures.

### Out of scope for the first slice

- Multiplayer or server-authoritative simulation.
- A full-world simulation across every region.
- Unbounded procedural generation.
- Complex real-time NPC pathfinding.
- A large content catalog before the core loop proves engaging.

## Definition of Done

- A player action can produce a visible NPC consequence within a testable in-game time window.
- Closing and reopening the game preserves the relevant world state.
- Offline time advances events and schedules deterministically within defined bounds.
- NPC, faction, economy, hazard, and discovery changes are inspectable in debug mode.
- The player can understand the major causes of meaningful changes.
- The region remains playable and readable across mobile portrait, mobile landscape, and desktop layouts.
- Automated tests cover state transitions, persistence, offline advancement, and duplicate-resolution protection.

## Open Decisions

- Exact region setting, cast size, and faction identities.
- Time scale for one in-game day.
- Whether simulation uses deterministic seeds, fixed ticks, or event scheduling.
- Which NPC consequence is the first showcase scenario.

---
*Created: 2026-09-20 after product interview.*
