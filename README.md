<!-- generated-by: gsd-doc-writer -->
# Mythika: Echoes of the Divine

**Mythika** is a mobile-first, offline-capable idle/cultivation RPG inspired by Indian mythology, built for players progressing their atman toward Moksha through combat, exploration, crafting, and spiritual choices.

## Game Overview

Build a party of heroes, explore mythic regions, fight turn-based battles, cultivate spiritual power, and make persistent choices in narrative encounters. The game runs directly in the browser, scales from phones to desktop screens, and can be installed as a portrait-oriented progressive web app.

### Highlights

- Turn-based party combat with ailments, combos, equipment, and progression
- Cultivation realms, breakthroughs, rebirth, and offline advancement
- Farming, fishing, alchemy, forge upgrades, quests, and achievements
- Spirit beast companions, recruitable heroes, trials, and tournament duels
- Eight mythology-driven zone and travel encounters with visible consequences
- Persistent encounter markers, karma requirements, and choice-dependent follow-ups
- Authoritative access checks for journeys, rebirth, forging, recruitment, tournaments, and trials
- Optional Firebase Authentication and Firestore cloud saves
- Local `localStorage` saves and service-worker-backed offline play
- Responsive combat layout for full parties and reduced-motion support

## Tech Stack

- **Vanilla JavaScript (ES6+)** — direct script loading with no framework or compilation step
- **HTML5 Canvas 2D** — immediate-mode rendering for scenes, combat, effects, and reusable UI
- **Web Audio API** — procedural sound effects and music
- **Web Storage API** — local saves and offline progress
- **Progressive Web App** — manifest and service worker for installation and offline use
- **Firebase (optional)** — authentication and Firestore-backed cross-device saves

## Installation

There are no package dependencies to install and no build step. Clone the repository and serve its root directory with any static HTTP server:

```bash
git clone https://github.com/magekt/mythika-echoes-of-the-divine.git
cd mythika-echoes-of-the-divine
python3 -m http.server 3000
```

Google Chrome or another modern browser with Canvas 2D, Web Audio, service-worker, and ES6 support is recommended. Opening `index.html` directly also works, but service-worker registration is skipped for `file://` URLs.

## Quick Start

1. Start the local server:

   ```bash
   python3 -m http.server 3000
   ```

2. Open `http://localhost:3000` in a browser.
3. Choose **Continue offline** to play without Firebase, then create a character and enter the ashram.

## Gameplay

### Explore and fight

Use the Travel Map to enter an unlocked zone. Zone exploration alternates between combat and eligible narrative encounters. Combat rewards flow into the same progression, economy, quest, and achievement systems used throughout the game.

### Cultivate and craft

Return to the ashram to cultivate, attempt breakthroughs, manage the party, brew alchemy recipes, tend the farm, fish, or improve equipment at the forge. Equipment and the active spirit beast contribute to cultivation and prana gains.

### Make persistent choices

Narrative encounters can appear during zone exploration or travel. Each choice previews its consequences and may award experience, gold, karma, prana, cultivation, or permanent stat changes. Choices are recorded in the save state, can unlock later encounter branches, and advance encounter quests and achievements.

## Major Systems

| Area | Implementation | Responsibility |
|---|---|---|
| Engine | `src/engine/` | Game loop, global state, renderer, input, audio, scene management, authentication |
| Data | `src/data/` | Heroes, enemies, zones, items, quests, achievements, journeys, and encounters |
| Systems | `src/systems/` | Combat, progression, cultivation, saves, economy, crafting, quests, journeys, and encounter resolution |
| Scenes | `src/scenes/` | Self-contained Canvas screens with enter, update, render, and leave lifecycles |
| UI | `src/ui/` | Reusable buttons, panels, cards, lists, text, progress bars, tabs, and modals |

The browser loads source files in dependency order from `index.html`. `src/main.js` registers available scenes defensively and starts the game through an idempotent boot sequence. Shared singletons such as `G`, `R`, `UI`, `Combat`, `Progression`, and `SaveSystem` coordinate state and behavior.

For a detailed repository map, see [`codemap.md`](codemap.md).

## Cross-System Integration

- Equipped accessory magic and active spirit beast levels improve cultivation and prana generation.
- Quest completion can reduce forge upgrade costs.
- Fishing, exploration, forging, and narrative choices advance their corresponding quest objectives.
- Tournament victories add a veteran badge to the Travel Map.
- Fish-and-herb recipes connect gathering with alchemy.
- Consumables can heal heroes or cleanse combat ailments.
- Encounter rewards use the canonical economy, progression, cultivation, quest, and achievement APIs.
- Encounter scenes release buttons and cached drawing state when left, avoiding retained UI growth.

## Development

Run the game from a local server while editing files; changes are consumed directly by the browser.

```bash
python3 -m http.server 3000
```

Verify boot behavior across desktop, phone, and phone-landscape profiles:

```bash
python3 tools/verify_matrix.py --budget 6000
```

The verification harness requires a local Chrome, Chromium, or Microsoft Edge executable. Set `MYTHIKA_CHROME` to select a specific browser binary.

Check a changed JavaScript file for syntax errors:

```bash
node --check src/engine/game.js
```

Useful runtime diagnostics:

- Add `?probe` to the local URL for FPS logging.
- Add `?probe&selftest` to run the input-chain self-test.
- Enable the operating system's reduced-motion setting, or set `G.state.reduceMotion = true` in the browser console, to test reduced-motion behavior.

## Firebase Setup (Optional)

Offline play does not require Firebase. To enable account-based cloud saves:

1. Create a Firebase project.
2. Enable the desired Authentication providers; the game includes email/password, Google, and phone-auth flows.
3. Create a Firestore database and secure the `game_saves/{userId}` documents so users can access only their own save.
4. Copy `src/engine/firebase-config.template.js` to `src/engine/firebase-config.js`.
5. Replace every placeholder in `window.FIREBASE_CONFIG` with the web-app configuration from the Firebase project.

`src/engine/firebase-config.js` is ignored by Git and must not be committed. For GitHub Pages deployment, the workflow generates it from these repository secrets:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID` (optional)

The GitHub Pages workflow verifies the game on desktop, phone, and landscape profiles before publishing the static repository root.

## Project Structure

```text
.
├── index.html              # Browser entry point and dependency loading order
├── manifest.json           # Installable PWA metadata
├── sw.js                   # Offline asset caching
├── styles/game.css         # Canvas container and responsive presentation
├── src/
│   ├── main.js             # Boot sequence and scene registration
│   ├── engine/             # Runtime, rendering, input, audio, auth, and scene helpers
│   ├── data/               # Static gameplay definitions
│   ├── systems/            # Stateful game rules and progression systems
│   ├── scenes/             # Canvas screen implementations
│   └── ui/                 # Reusable immediate-mode UI components
└── tools/                  # Boot verification and diagnostic utilities
```

## License

No license file or package license declaration is currently present in the repository.
