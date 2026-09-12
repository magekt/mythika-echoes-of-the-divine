# Mythika: Echoes of the Divine

**Mythika** is a mobile-first idle/cultivation RPG rooted in Indian mythology. Cultivate your atman toward Moksha through combat, alchemy, farming, fishing, and spiritual journeys.

---

## Game Overview

Mythika: Echoes of the Divine is an idle/cultivation RPG where players progress their atman toward Moksha — the ultimate liberation. Set against the rich backdrop of Indian mythology, the game features:

- **32+ Scenes** with a full UI overhaul
- Turn-based combat system
- Cultivation realm progression
- Alchemy crafting system
- Spirit beast companions
- Farming and fishing mechanics
- Tournament PvP
- Achievement system
- Cloud save via Firebase (optional)

The game is designed to be **mobile-first** but works perfectly on desktop, with a progressive web app (PWA) experience and service worker for offline play.

---

## Tech Stack

- **Vanilla JS (ES6+)** — No frameworks, no build step required
- **HTML5 Canvas 2D** — Renderer for all graphics
- **Web Audio API** — Sound and music
- **PWA** — Service worker for offline play
- **Firebase** — Optional auth and cross-device saves

> **No build step required** — Simply open `index.html` or use `npx serve` to play locally.

---

## Features

| Category | Details |
|----------|---------|
| **Scenes** | 32+ unique scenes with full UI overhaul |
| **Combat** | Turn-based combat system |
| **Progression** | Cultivation realm progression |
| **Crafting** | Alchemy crafting system |
| **Companions** | Spirit beast companions |
| **Gameplay** | Farming and fishing mechanics |
| **PvP** | Tournament PvP |
| **Achievements** | Comprehensive achievement system |
| **Cloud Save** | Firebase optional cloud saves |
| **Cross-System Interdependence** | Equipment boosts cultivation, spirit beasts aid cultivation, quests unlock forge bonuses, tournament earns veteran badges, fish/explore/forge track quest progress |
| **Hybrid Alchemy** | Fish-herb hybrid recipes for advanced crafting |
| **Extended Quests** | Collect, explore, fish, and forge quest types alongside combat quests |
| **Extended Equipment Pool** | Zone-specific weapons, armor, and accessories with rarity tiers |

---

## Cross-System Hooks

1. **Equipment → Cultivation**: Equipped accessory magic stat boosts `CultivationSystem.getCultivationPerSecond()` and `getPranaPerSecond()`.
2. **Spirit Beast → Cultivation**: Active spirit beast level adds small cultivation/prana per second bonus.
3. **Quest → Forge**: Completing the `ary_forge1` quest unlocks a -10% upgrade cost bonus at the Forge.
4. **Tournament → Zone**: Tournament wins (`tournamentWins >= 3`) award a veteran badge visible on the Travel Map.
5. **Fish → Quest**: Successful fishing catches call `QuestSystem.trackFish()` to advance fish-type quest objectives.
6. **Zone → Quest**: Exploration progress calls `QuestSystem.trackExplore()` to advance explore-type quests.
7. **Forge → Quest**: Equipment upgrades call `QuestSystem.trackForge()` to advance forge-type quests.
8. **Alchemy → Farm**: Fish-herb hybrid recipes in `ALCHEMY_RECIPES` bridge the farming and crafting systems.
9. **Consumables → Combat**: Herb Poultice (`cleanse: true`) clears all hero ailments/debuffs in combat.
10. **Characters → Equipment**: Hero `classId` and `skillTypes` displayed in Equipment Stats tab.

---

## Development

### Local Development

```bash
# Start local dev server
python3 -m http.server 3000

# Run boot verification (3 profiles)
python3 tools/verify_matrix.py --budget 6000

# Syntax check individual files
node --check src/engine/<file>.js
```

### Design References

- **Visual Design System**: `.slim/deepwork/DESIGN-SYSTEM.md`
- **Verification Workflow**: `.slim/deepwork/verification-playbook.md`

---

## Firebase Setup (Optional)

1. Create a Firebase project
2. Enable Email/Password auth
3. Create Firestore database
4. Copy config to `src/engine/firebase-config.js`
5. Set security rules for `game_saves/{userId}`

For GitHub Pages, keep the config file out of git. Add these repository Actions
secrets so the workflow generates it before verification and deployment:
`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`,
`FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, and `FIREBASE_APP_ID`.
`FIREBASE_MEASUREMENT_ID` is optional. The workflow fails before publishing if
one of the required values is missing.

---

## License

Check if `LICENSE` exists in the repo root. If not, add a license note appropriate for the project.

---

## Quick Start

1. Open `index.html` in your browser
2. Or start a local server: `python3 -m http.server 3000`
3. Navigate to `http://localhost:3000`
4. Begin your cultivation journey toward Moksha!
