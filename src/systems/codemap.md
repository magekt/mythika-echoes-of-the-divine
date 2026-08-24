# src/systems/

## Responsibility
10 game logic systems — each encapsulates a distinct gameplay domain (combat, progression, cultivation, save, journey, alchemy, economy, achievements, quests, duel). Systems are stateless operators on `G.state` and global data constants.

## Design Patterns
- **Namespace Objects**: Each system is a `const SystemName = {}` with methods
- **Global State Mutation**: Direct reads/writes to `G.state.*` (no encapsulation)
- **Data-Driven Logic**: Behavior driven by `REALMS`, `PERKS`, `AURAS`, `HEROES`, `ENEMIES` constants
- **Cross-System Dependencies**: Systems call each other via global namespace (e.g., `Combat → Progression.perkValue()`)
- **Pure Functions where Possible**: Calculation helpers (`_getEffectiveAtk`, `calcDamage`) are pure

## System Catalog

### Combat System (`combat.js` — 462 lines)
**Responsibility**: Turn-based combat engine, damage calculation, enemy AI, status ailments, combo system, loot.

**Key Exports**:
- `Combat.startBattle(heroes, enemies)` — initializes battle state
- `Combat.performAttack(attacker, defender, skill)` — main damage path
- `Combat.performEnemyAbility(enemy, target, ability)` — enemy skills
- `Combat.enemyAI(enemy)` — simple AI (stun/confuse check → random ability → attack)
- `Combat.calcDamage / calcMagicDamage` — damage formulas with variance, crit, combo, shields
- `Combat.checkCombo(actor)` — combo gauge (100 max, -5/turn decay, Divine Combo at 100)
- `Combat.getLoot()` — XP/gold from defeated enemies
- `Combat.awardBeastXP()` — spirit beast progression

**Dependencies**: `Progression` (perkValue), `AURAS` (global), `Audio`, `R` (effects), `Progression.addPartyXP`, `AchievementSystem.check`

**State Mutations**: `G.state.party` (HP/MP/ailments/buffs), `Combat.turnOrder`, `Combat.comboCount`, `Combat.comboTimer`

### Progression System (`progression.js` — 145 lines)
**Responsibility**: XP/leveling, challenge scaling, zone difficulty, loot bonuses, elite variants.

**Key Exports**:
- `Progression.perkValue(id)` — wired perk level → numeric value
- `Progression.addXP(hero, amount)` — level up loop with `applyLevelUp`
- `Progression.xpForLevel(lvl)` — XP curve (4 tiers: ≤10, ≤20, ≤30, >30)
- `Progression.getChallenge()` — sanitized challenge multiplier (0.6–1.5)
- `Progression.adjustChallenge(result)` — dynamic difficulty (win/loss + performance)
- `Progression.getZoneDifficulty(zoneId)` — player level vs zone reqLevel
- `Progression.applyDifficulty(enemies)` — scales enemy stats + rewards
- `Progression.addPartyXP(amount)` — distributes XP to active party, triggers journey unlock
- `Progression.createEliteVariant(enemy)` — 1.5–1.8x stats, 1.5x rewards

**Dependencies**: `AURAS` (global), `JourneySystem`, `Notify`, `Audio`, `R.triggerLevelUp`

**State Mutations**: `G.state.challenge`, `hero.xp`, `hero.level`, `hero.stats`, `hero.skillPoints`

### Cultivation System (`cultivation_sys.js` — 103 lines)
**Responsibility**: Realm progression, cultivation base accumulation, prana generation, breakthrough logic.

**Key Exports**:
- `CultivationSystem.getRealmData()` — current `REALMS` entry
- `CultivationSystem.addCultivationBase(amount)` — `G.state.cultivationBase += amount`
- `CultivationSystem.addPrana(amount)` — `G.state.prana += amount`
- `CultivationSystem.getCultivationPerSecond()` — base + ashram bonus
- `CultivationSystem.getPranaPerSecond()` — base + ashram + enlightenment buff
- `CultivationSystem.tick(dt)` — called every frame, adds base/prana per second
- `CultivationSystem.canBreakthrough()` — checks if base ≥ next realm threshold
- `CultivationSystem.attemptBreakthrough()` — RNG (40% base + ashram + tribulation), on success: realmStage++, realm advance, party stat bonuses, XP
- `CultivationSystem.getBreakthroughStats(realmIdx)` — static stat bonuses per realm
- `CultivationSystem.getRealmProgress()` — { current, needed, progress }

**Dependencies**: `data/cultivation.js` (REALMS, CULTIVATION_RATES, helpers), `QuestSystem`, `Progression`, `AchievementSystem`, `Audio`, `Notify`

**State Mutations**: `G.state.cultivationBase`, `G.state.prana`, `G.state.realm`, `G.state.realmStage`, `G.state.party` stats

### Save System (`save.js` — 180 lines)
**Responsibility**: Persistence (localStorage), migration, offline progress, import/export.

**Key Exports**:
- `SaveSystem.save()` — deep clone `G.state` → JSON → localStorage (30s auto-save)
- `SaveSystem.load()` — parse → `Object.assign(G.state, data.state)` → migrate → offline progress calc
- `SaveSystem.migrate()` — heals legacy inventory/gear, sanitizes numerics
- `SaveSystem.exportFile()` / `importFile()` — manual backup/restore
- `SaveSystem.startAutoSave()` / `stopAutoSave()` — 30s interval
- `SaveSystem.getSaveInfo()` — metadata for UI

**Offline Progress** (load:57-86):
- Caps at 8 hours (28800s)
- Cultivation gain = elapsed × cultPerSec
- Prana gain = elapsed × pranaPerSec
- Farm plots: fast-forward growTimer, mark harvested

**Dependencies**: `CultivationSystem`, `HERB_GROWTH`, `Notify`, `R.applyFontScale`

**State Mutations**: `G.state.*` (full replace on load), `G.state.cultivationBase`, `G.state.prana`, `G.state.farmPlots`

### Journey System (`journey.js` — ~200 lines)
**Responsibility**: Narrative journeys with choices, aura unlocks, progress tracking.

**Key Exports**:
- `JourneySystem.start(journeyId)` — initializes journey state
- `JourneySystem.makeChoice(choiceId)` — applies rewards, advances progress
- `JourneySystem.getProgress(journeyId)` — completion percentage
- `JourneySystem.trackRealm(realmId)` — realm-based journey triggers

**Dependencies**: `JOURNEYS` data, `QuestSystem`, `Notify`, `Audio`, `Progression`

**State Mutations**: `G.state.journeys.progress`, `G.state.auras`, `G.state.equippedAuras`

### Alchemy System (`alchemy.js` — ~150 lines)
**Responsibility**: Pill crafting from herbs, recipe management.

**Key Exports**:
- `AlchemySystem.craft(recipeId)` — consumes herbs, produces pill
- `AlchemySystem.getAvailableRecipes()` — filters by owned herbs
- `AlchemySystem.unlockRecipe(recipeId)` — adds to `G.state.alchemyRecipes`

**Dependencies**: `ALCHEMY_RECIPES`, `HERB_GROWTH`, `Economy`, `Notify`

**State Mutations**: `G.state.alchemyRecipes`, `G.state.inventory` (herbs), `G.state.prana` (Qi)

### Economy System (`economy.js` — ~100 lines)
**Responsibility**: Currency transactions (gold, karma, divine fragments).

**Key Exports**:
- `Economy.addGold(amount)` / `spendGold(amount)` — with validation
- `Economy.addKarma(amount)` / `spendKarma(amount)`
- `Economy.addDivineFragments(amount)` / `spendDivineFragments(amount)`
- `Economy.canAfford(costs)` — multi-currency check

**Dependencies**: `Notify` (insufficient funds)

**State Mutations**: `G.state.gold`, `G.state.karma`, `G.state.divineFragments`

### Achievements System (`achievements.js` — ~150 lines)
**Responsibility**: Achievement tracking, unlock conditions, rewards.

**Key Exports**:
- `AchievementSystem.check()` — evaluates all achievements against current state
- `AchievementSystem.unlock(id)` — grants rewards, shows notification
- `AchievementSystem.isUnlocked(id)` — boolean check

**Dependencies**: `ACHIEVEMENTS` data, `Notify`, `Audio`, `Economy`, `Progression`

**State Mutations**: `G.state.achievements` (unlocked IDs), currencies, perks

### Quest System (`quest.js` — ~200 lines)
**Responsibility**: Quest state machine (available → active → complete → claimed).

**Key Exports**:
- `QuestSystem.start(questId)` — moves to active
- `QuestSystem.updateProgress(questId, amount)` — increments objectives
- `QuestSystem.complete(questId)` — moves to complete, grants rewards
- `QuestSystem.claim(questId)` — moves to claimed

**Dependencies**: `QUESTS` data, `Economy`, `Progression`, `Notify`, `Audio`

**State Mutations**: `G.state.quests` (quest states), currencies, XP

### Duel System (`duel.js` — ~150 lines)
**Responsibility**: PvP-style combat for Tournament of Souls.

**Key Exports**:
- `DuelSystem.generateOpponent(playerLevel)` — procedural enemy from templates
- `DuelSystem.startDuel(hero, opponent)` — uses Combat engine
- `DuelSystem.getRewards(win)` — gold, XP, tournament points

**Dependencies**: `Combat`, `Progression`, `Economy`, `ENEMIES`

**State Mutations**: `G.state.tournamentWins`, currencies, XP

## Data & Control Flow

### Combat Flow
```
Scene.enter() → Combat.startBattle(party, enemies)
    → buildTurnOrder() → currentTurn = 0
Scene.update() → player action → Combat.performAttack()
    → calcDamage() → defender.hp -= dmg → checkCombo() → checkBattleEnd()
    → nextTurn() → processAilments() → buildTurnOrder() → enemyAI()
    → Combat.performEnemyAbility() or performAttack()
    → battleOver → getLoot() → awardBeastXP() → Progression.addPartyXP()
```

### Cultivation Tick (every frame)
```
gLoopFrame() → CultivationSystem.tick(dt)
    → addCultivationBase(cultPerSec * dt)
    → addPrana(pranaPerSec * dt)
```

### Save Cycle
```
SaveSystem.startAutoSave() → setInterval(save, 30000)
save() → JSON.parse(JSON.stringify(G.state)) → localStorage
load() → parse → Object.assign(G.state) → migrate() → offlineProgress()
```

### Progression Feedback Loop
```
Combat.getLoot() → Progression.addPartyXP(xp)
    → Progression.addXP(hero, xp) → level up → applyLevelUp() → stat gains
    → if level ≥ 10 → JourneySystem.start('karmicCrossroads')
Progression.adjustChallenge(battleResult) → G.state.challenge adjusted
Progression.getChallenge() → used by applyDifficulty() for next zone
```

## Integration Points

| System | Reads From | Writes To | Called By |
|--------|------------|-----------|-----------|
| Combat | G.state.party, G.state.perks, AURAS | G.state.party (HP/ailments), Combat.* | combatScene, duel, tournament |
| Progression | G.state.challenge, G.state.perks, AURAS, G.state.player | G.state.challenge, hero stats | Combat, Cultivation, Journey, Quest |
| Cultivation | G.state.realm, G.state.ashramLevel, REALMS | G.state.cultivationBase, G.state.prana, G.state.realm* | gLoopFrame, cultivationScene, SaveSystem |
| Save | G.state (all) | G.state (all on load) | main.js (boot), ashram (enter/leave), settings |
| Journey | G.state.journeys, AURAS, QUESTS | G.state.journeys, G.state.auras | Progression (level 10), ashram |
| Alchemy | G.state.inventory, HERB_GROWTH, ALCHEMY_RECIPES | G.state.alchemyRecipes, G.state.inventory, G.state.prana | alchemyScene, farm |
| Economy | G.state.gold/karma/DF | G.state.gold/karma/DF | All scenes (shops, rewards, costs) |
| Achievements | G.state.* (all) | G.state.achievements | Progression (levelUp), Combat, Quest, Journey |
| Quest | G.state.quests, QUESTS | G.state.quests | journeyScene, zoneExploration, ashram |
| Duel | Combat, ENEMIES, Progression | G.state.tournamentWins | tournamentScene |

## Critical Invariants
1. **Combat turn order** — sorted by AGI + random(0-5), rebuilt each round
2. **Combo gauge** — max 100, decays -5/turn, Divine Combo at 100 resets to 0
3. **Challenge bounds** — 0.6 to 1.5, sanitized on every `getChallenge()`
4. **Cultivation base** — never negative, breakthrough consumes `needed` amount
5. **Prana** — never negative, used for exploration/fishing/alchemy
6. **Save version** — only version 1 supported, migration handles legacy
7. **Offline cap** — 8 hours (28800s) max accumulation

## Memory Leak Risks
| System | Risk |
|--------|------|
| Combat | `turnOrder`, `combos` arrays not cleared on battle end |
| Save | `JSON.parse(JSON.stringify(G.state))` every 30s — GC pressure |
| Cultivation | `tick(dt)` called every frame even in non-cultivation scenes |
| Journey | `G.state.journeys` accumulates progress indefinitely |
| Quest | `G.state.quests` accumulates completed quests indefinitely |

## Refactoring Opportunities
1. **Centralized State Store** — replace direct `G.state` mutations with actions/reducers
2. **System Registry** — explicit dependency injection instead of globals
3. **Event Bus** — decouple systems (e.g., Combat emits `damageDealt`, Progression listens for XP)
4. **Selective Serialization** — SaveSystem only serializes changed fields
5. **Combat State Encapsulation** — move `Combat.*` properties into battle-scoped object
6. **Cultivation Tick Optimization** — only tick when in cultivation scene or ashram