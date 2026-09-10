# Mythika: Echoes of the Divine

**Mythika** is a mobile-first idle/cultivation RPG rooted in Indian mythology. Cultivate your atman toward Moksha through combat, alchemy, farming, fishing, and spiritual journeys.

---

## Game Overview

Mythika: Echoes of the Divine is an idle/cultivation RPG where players progress their atman toward Moksha — the ultimate liberation. Set against the rich backdrop of Indian mythology, the game features:

- **30+ Scenes** with a full UI overhaul
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
| **Scenes** | 30+ unique scenes with full UI overhaul |
| **Combat** | Turn-based combat system |
| **Progression** | Cultivation realm progression |
| **Crafting** | Alchemy crafting system |
| **Companions** | Spirit beast companions |
| **Gameplay** | Farming and fishing mechanics |
| **PvP** | Tournament PvP |
| **Achievements** | Comprehensive achievement system |
| **Cloud Save** | Firebase optional cloud saves |

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

---

## License

Check if `LICENSE` exists in the repo root. If not, add a license note appropriate for the project.

---

## Quick Start

1. Open `index.html` in your browser
2. Or start a local server: `python3 -m http.server 3000`
3. Navigate to `http://localhost:3000`
4. Begin your cultivation journey toward Moksha!