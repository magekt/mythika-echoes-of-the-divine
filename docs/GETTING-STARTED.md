<!-- generated-by: gsd-doc-writer -->
# Getting Started

Play **Mythika: Echoes of the Divine** locally in under five minutes. This guide
takes you from a fresh clone to your first battle. No build step, no
dependencies to install — the repository root is the deployable static site.

## Prerequisites

You need all three of the following:

- **Git** — to clone the repository.
- **A modern browser** — current Chrome, Edge, Firefox, or Safari with ES6,
  Canvas 2D, Web Audio, `localStorage`, and service-worker support.
- **One local static server** — either of these works:
  - `Python 3` (`python3 --version` should print 3.x)
  - `Node.js` with `npx` (only needed if you prefer the `npx serve .`
    alternative below)

There is no `package.json`, no `.nvmrc`, no Dockerfile, and no `.env` file to
set up. Offline play with local saves is the default and needs no account or
network access beyond the first page load.

## Installation steps

1. Clone the repository:

   ```bash
   git clone https://github.com/magekt/mythika-echoes-of-the-divine
   ```

2. Move into the project directory:

   ```bash
   cd mythika-echoes-of-the-divine
   ```

3. Confirm the root contains `index.html`, `manifest.json`, `sw.js`,
   `styles/`, and `src/`. If those are present, installation is complete —
   there is no `npm install`, `pip install`, or compile step to run.

## First run

Start a static server from the repository root (serving the root matters —
paths like `src/main.js` and `styles/game.css` only resolve from there):

```bash
python3 -m http.server 3000
```

Then open `http://localhost:3000` in your browser. The title screen renders
the glowing `MYTHIKA` wordmark with `Echoes of the Divine` beneath it.

Node.js alternative (no project changes required):

```bash
npx serve .
```

Open the local URL printed by `serve`.

> Opening `index.html` directly via `file://` works for basic play but skips
> service-worker registration, so PWA install and offline caching are
> unavailable. Use the local HTTP server for the full experience.

### Your first session: title to first battle

1. **Title screen** — tap `New Game` to start fresh. (`Continue` only appears
   when a previous local save exists; it loads the save and jumps straight to
   the ashram.)
2. **Step 1 — Path** (`Choose your spiritual path`) — pick one of three
   spiritual paths (see `src/data/classes.js`):
   - **Kshatriya** — Path of the Warrior. Physical damage, high HP, tanking
     (`STR+5 HP+20`).
   - **Rishi** — Path of the Sage. Magic damage, high MP, spells
     (`MAG+5 MP+20`).
   - **Yogi** — Path of the Mystic. Hybrid, balanced stats, versatility
     (`STR+3 MAG+3`).

   First-time players see one-line stat glosses under the path cards
   (`src/systems/gloss.js`): Health is total hit points, Strength is melee
   attack power, Magic is spell power and max MP, Mana is fuel for skills.
   Each gloss shows once, then is suppressed.
3. **Step 2 — Hero** (`Choose your hero`) — pick your hero. Each card shows
   name, title, role, and an `HP/MP/STR/AGI/MAG/DEF` stat line
   (see `src/data/heroes.js`): Arjuna (Ranged DPS), Bhima (Tank), Karna
   (Burst DPS), Draupadi (Support Mage), Hanuman (Agile Fighter).
4. **Step 3 — Elite** (`Choose your Elite Class`) — pick one of the four
   elite classes for your path (for example, Kshatriya offers Knight,
   Assassin, Gladiator, and Warlord, each with its bonus line such as
   `+10% damage` or `+15% max HP for whole party`). Confirm with
   `Create <hero> as <path> with <elite>?`, or choose
   `Skip Elite (choose later)` to start without one. New heroes begin with
   50 gold, a Leather Armor, two HP Potions, and a wolf spirit beast.
5. **Intro** — a short typewriter prologue plays
   (`src/scenes/welcome.js`). Tap once to fast-forward the text, then tap
   `Tap to continue` to enter the ashram.
6. **Ashram (home base)** — the welcome hint reads
   `Welcome to your Ashram. Tap Travel to begin your journey.` The bottom bar
   offers `Map`, `Party`, `Shop`, `Rest`, and `More`. Autosave starts here.
7. **First battle** — tap `Map` (or `Travel`), select
   **Aryavarta Grasslands** (the level-1 starting zone; later zones such as
   Dandaka Forest unlock at higher levels), and enter exploration. A guided
   first-battle tour (`src/systems/tour.js`) walks you through five callouts
   in a gold banner: tap the enemy to begin, tap Attack on your turn, watch
   the turn indicator, claim your rewards, then keep exploring for more
   encounters. Victory grants gold, experience, and equipment.

## Common setup issues

- **Page loads but buttons do nothing.** You are probably serving the wrong
  directory or a script failed to load. Always start the server from the
  repository root, open devtools, and fix the first failed `.js` request in
  the Network panel. A successful boot logs `[Mythika] booted scene=` to the
  console.
- **Service worker is not registered.** Do not use a `file://` URL — start
  the local HTTP server and open the game through `http://localhost`.
  Non-local deployments require HTTPS for service workers.
- **Port 3000 is already in use.** Pick another port:

  ```bash
  python3 -m http.server 8080
  ```

  Then open `http://localhost:8080`.
- **No audio.** Browsers suspend Web Audio until a user gesture. Click or tap
  once inside the game, confirm SFX and Music are on in Settings, and check
  tab and OS volume.
- **Changed files do not appear after reload.** The service worker caches
  assets (cache-first for everything except `index.html`, which is
  network-first). In devtools, unregister the service worker, clear Cache
  Storage, and reload. Do not clear Local Storage unless you have exported
  your save — local progress lives under the `mythika_save` key.

For deeper diagnostics, append `?probe` to the URL for FPS/script timing, or
`?probe&selftest` for the input-chain self-test (the self-test navigates
scenes with synthetic input — do not use it for normal play). See
`TROUBLESHOOTING.md` for the full fault guide.

## Next steps

- `docs/DEVELOPMENT.md` — local development setup, build/lint commands, and the
  pull-request process.
- `docs/TESTING.md` — how to run the Node test suite and the browser boot matrix.
- `docs/CONFIGURATION.md` — Firebase config, PWA manifest, URL flags, and
  save-storage keys.
- `ARCHITECTURE.md` — engine, scenes, systems, and data layout.
- `TROUBLESHOOTING.md` — the full diagnostic checklist when something breaks.
- `codemap.md` — system mechanics reference once you start exploring zones,
  cultivation, and crafting.
