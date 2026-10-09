# Synthesized Requirements

## REQ-mythika-core-game
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/MYTHIKA_WIREFRAME_PLAN.md`
- description: Deliver a mobile-first Mythika RPG with turn-based combat, cultivation progression, exploration, party management, crafting, economy, onboarding, and save/rebirth loops.
- acceptance criteria: The plan defines launch screens and systems; combat supports the listed actions and optional timing taps; the MVP contains three zones and three heroes; the game remains playable offline; progression includes cultivation, breakthroughs, and Punarjanma; major systems unlock progressively.
- scope: product MVP

## REQ-progression-and-rebirth
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/MYTHIKA_WIREFRAME_PLAN.md`
- description: Implement realm progression, idle cultivation, breakthrough bosses, Punarjanma, rebirth perks, and long-term progression.
- acceptance criteria: Realms cap levels; breakthroughs require cultivation, a pill, and a boss victory; failure costs cultivation without real-time waiting; rebirth resets to Mortal while preserving equipment, currencies, and perks and grants persistent rewards.
- scope: progression

## REQ-combat-and-party
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/MYTHIKA_WIREFRAME_PLAN.md`
- description: Provide turn-based combat with optional timing bonuses, ailments, combo attacks, three active heroes, party management, and equipment.
- acceptance criteria: Timing misses do not prevent action resolution; combat exposes the specified attack, defense, support, and escape actions; ailments and Divine Combo follow the documented gauge and decay rules; all active heroes receive combat XP; equipment has weapon, armor, and accessory slots.
- scope: combat and party

## REQ-feature-gated-onboarding
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/MYTHIKA_WIREFRAME_PLAN.md`
- description: Unlock systems in staged playtime bands from tutorial combat through endgame optimization.
- acceptance criteria: The documented unlock sequence is represented from 0–15 minutes through 25+ hours, including zones, cultivation, farming, alchemy, rebirth, forge, Tournament, Echoes, and Boss Rush.
- scope: onboarding

## REQ-party-detail-actions
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/PARTY_DETAIL_ACTIONS_DESIGN.md`
- description: Provide a mobile-first hero detail view with separate summary and actions panels.
- acceptance criteria: Actions are full-width, vertically stacked, at least 48px high, scroll-safe, use semantic tokens, preserve existing callbacks, and retain reduced-motion-safe shared button feedback.
- scope: party hero detail

## REQ-cultivation-surface
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/CULTIVATION_SCENE_DESIGN.md`
- description: Provide a cultivation surface showing realm, progress, prana, rates, breakthrough state, and actions.
- acceptance criteria: The surface presents the documented hero, info panel, progress, action states, responsive stacking, semantic tokens, accessibility labels, and reduced-motion behavior.
- scope: cultivation scene

## REQ-punarjanma-surface
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/PUNARJANMA_SCENE_DESIGN.md`
- description: Provide a rebirth decision surface that makes costs, gains, resets, requirements, and irreversible consequences clear.
- acceptance criteria: Preview, gains, resets, requirements, and a 48px primary action are present; confirmation repeats consequences; existing callbacks and calculations remain unchanged.
- scope: rebirth scene

## REQ-travel-map
- source: `/Users/admin/Documents/Deepankar Project/dragonSword_EXPMinima/TRAVEL_MAP_DESIGN.md`
- description: Provide a mobile route-selection map with realm grouping, zone state cards, and selected-zone actions.
- acceptance criteria: Available, current, complete, and locked states are distinct; cards fit the logical mobile canvas; selected-zone actions are separate 48px controls; locked actions remain visible but disabled with prerequisites.
- scope: travel map
