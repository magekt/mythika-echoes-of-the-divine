# src/data/

## Responsibility
Static game data definitions — all immutable reference data for heroes, enemies, items, zones, cultivation realms, perks, auras, classes, spirit beasts, journeys, quests, achievements, and alchemy recipes. Pure data modules with no runtime logic.

## Design Patterns
- **Data Module Pattern**: Each file exports a single global constant (e.g., `HEROES`, `ENEMIES`, `ZONES`, `REALMS`)
- **Lookup Tables**: Arrays of objects with `id` keys for O(1) lookup via `find()`/`filter()`
- **Configuration over Code**: All balance numbers, progression curves, and content defined declaratively

## Data & Control Flow
```
index.html loads all data scripts → Global constants available → Systems/scenes import via global namespace
```

No control flow — data is read-only at runtime. Systems query data via global constants (e.g., `REALMS.find(r => r.id === G.state.realm)`).

## Integration Points
| Consumer | Data Used |
|----------|-----------|
| `cultivation_sys.js` | `REALMS`, `CULTIVATION_RATES`, `getCultivationForLevel` |
| `combat.js` | `ENEMIES`, `ENEMY_ABILITIES`, `HEROES` |
| `progression.js` | `HEROES` (base stats), `ZONES` (difficulty) |
| `journey.js` | `JOURNEYS`, `QUESTS` |
| `alchemy.js` | `ALCHEMY_RECIPES`, `HERB_GROWTH` |
| `save.js` | Migration references `HERB_GROWTH` |
| Scenes (30+) | Various — `ZONES`, `REALMS`, `HEROES`, `ITEMS`, `PERKS`, `AURAS`, `CLASSES`, `SPIRIT_BEASTS` |

## File Inventory
| File | Export | Description |
|------|--------|-------------|
| `heroes.js` | `HEROES` | 3 launch heroes (Arjuna, Bhima, Karna) + base stats |
| `enemies.js` | `ENEMIES`, `ENEMY_ABILITIES` | ~30 enemy definitions + ability table |
| `zones.js` | `ZONES` | 7 zones (3 MVP + 4 post-launch) with biome, reqLevel, bgColor |
| `perks.js` | `PERKS` | 3-tier rebirth perk tree (Perks 1, Perks 2, Ascension) |
| `auras.js` | `AURAS` | 24 auras (8 per class path) with effects |
| `classes.js` | `CLASSES` | 3 class paths (Kshatriya, Rishi, Yogi) + elite classes |
| `cultivation.js` | `REALMS`, `CULTIVATION_RATES`, helpers | 6 realms, offline cap, rate formulas |
| `alchemy_recipes.js` | `ALCHEMY_RECIPES`, `HERB_GROWTH` | Pill recipes + herb grow times |
| `spirit_beasts.js` | `SPIRIT_BEASTS` | 3 beasts (Garuda, Nandi, Naga) with passives/actives |
| `journeys.js` | `JOURNEYS` | Journey definitions with choices/rewards |
| `quests.js` | `QUESTS` | Quest definitions with objectives/rewards |
| `achievements.js` | `ACHIEVEMENTS` | Achievement list with unlock conditions |
| `items.js` | `ITEMS` | Equipment, consumables, materials |
| `data.js` | (none) | Re-exports all for convenience |

## Key Invariants
- All `id` fields unique within each dataset
- `REALMS` ordered by progression (index = realm tier)
- `ZONES` reference `REALMS` via `reqLevel` for difficulty scaling
- `PERKS` reference `AURAS` and `CLASSES` for cross-system effects
- No circular references between data files

## Migration Notes
- `save.js:migrate()` handles legacy inventory/gear format changes
- Numeric fields sanitized on load (finite, non-negative)
- Version field in save data enables future migrations