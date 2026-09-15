<!-- generated-by: gsd-doc-writer -->
# API Reference

Mythika: Echoes of the Divine uses a global-state, immediate-mode architecture. All systems are exposed as global objects with public methods. This document covers the stable API surface for each major system.

## Global State (`G`)

The `G` object holds all game state and engine configuration.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `G.canvas` | HTMLCanvasElement | The main game canvas |
| `G.ctx` | CanvasRenderingContext2D | The 2D rendering context |
| `G.W` | number | Canvas width (320px) |
| `G.H` | number | Canvas height (480px) |
| `G.state` | object | Current save state (party, inventory, gold, etc.) |
| `G.scenes` | object | Registered scene registry |
| `G.scene` | string | Current active scene name |
| `G.running` | boolean | Whether the game loop is active |

### State Object (`G.state`)

| Property | Type | Description |
|----------|------|-------------|
| `party` | Hero[] | Active party members |
| `inventory` | Item[] | Player inventory |
| `gold` | number | Current gold |
| `karma` | number | Karma currency |
| `divineFragments` | number | Premium currency |
| `realm` | string | Current cultivation realm |
| `cultivationBase` | number | Accumulated cultivation points |
| `prana` | number | Spiritual energy resource |
| `perks` | object | Siddhi perks owned (key → level) |
| `quests` | object | Quest progress by ID |
| `journeys` | object | Journey progress |
| `flags` | object | Story/event flags |
| `reduceMotion` | boolean | Accessibility: animations disabled |

### Methods

```javascript
// Create a new default state object
G.createDefaultState();

// Switch to a named scene with optional data payload
G.scene = 'ashram';  // Direct assignment
```

---

## Renderer (`R`)

Drawing primitives, color tokens, and visual effects.

### Color Tokens

```javascript
R.colors.bg          // '#0a0a1a' - Background
R.colors.panel       // '#1a1a30' - Panel surface
R.colors.gold        // '#e8a030' - Accent/gold
R.colors.hp          // '#c83030' - Health bar
R.colors.mp          // '#3080c8' - Mana bar
R.colors.text        // '#e8e0d0' - Primary text
R.colors.textDim     // '#98a0b8' - Secondary text
R.colors.accent      // '#e8a030' - Accent color
R.colors.success     // '#30c830' - Success state
R.colors.warning     // '#e8a030' - Warning state
R.colors.danger      // '#c83030' - Danger state
```

### Border Radius Scale

```javascript
R.radius.xs  // 3 - Chips, ticks
R.radius.s   // 5 - Buttons, small bars
R.radius.m   // 8 - Panels, headers
R.radius.l   // 10 - Large cards
```

### Drawing Methods

```javascript
// Fill the canvas with background color
R.clear();

// Draw a rounded rectangle
R.roundRect(x, y, w, h, r, fill, stroke);

// Draw text with optional alignment
R.text(str, x, y, color, font, align);

// Draw a progress bar
R.bar(x, y, w, h, pct, color, bgColor);

// Draw an icon (from the icon atlas)
R.icon(id, x, y, size, color);
```

---

## Scene Manager (`Scene`)

Manages scene registration and transitions.

### Methods

```javascript
// Create a scene definition object
const myScene = Scene.create({
  name: 'myScene',
  enter: function(data) { /* Called when scene activates */ },
  leave: function() { /* Called when scene deactivates */ },
  update: function(dt) { /* Called each frame */ },
  render: function() { /* Called each frame */ },
  data: {}  // Scene-specific data
});

// Register a scene (called from main.js)
registerScene('myScene', myScene);
```

### Scene Transitions

Scene transitions happen via direct assignment:

```javascript
G.scene = 'combatScene';
```

The engine handles calling `leave()` on the current scene and `enter()` on the new scene.

---

## Fade System (`Fade`)

Scene transition fade effects.

### Methods

```javascript
// Start a fade to black, then switch scene
Fade.to('combatScene');

// Start a fade from black (reveal)
Fade.from();

// Check if currently fading
Fade.active();  // Returns boolean
```

---

## Input System (`Input`)

Touch, mouse, and keyboard input handling with flood protection.

### Tap Queue

```javascript
// Check for a queued tap (does not consume)
const tap = Input.peekTap();  // { x, y, t: 'touch'|'click' }

// Consume and return the next tap
const tap = Input.getTap();
```

### Touch State

```javascript
// Current touch positions
Input.touches  // Array of { x, y, t }

// Click queue (mouse)
Input.clicks  // Array of { x, y, t }
```

### Keyboard

```javascript
// Check if a key is currently held
Input.keys['ArrowUp']  // boolean
```

### Swipe Detection

```javascript
// Last detected swipe direction
Input._lastSwipe  // 'left' | 'right' | null
```

---

## Audio System (`Audio`)

Procedural audio synthesis for music and sound effects.

### Methods

```javascript
// Toggle music on/off
Audio.musicOn = true/false;

// Toggle sound effects
Audio.sfxOn = true/false;

// Set music volume (0-1)
Audio.musicVolume(0.7);

// Play a music track
Audio.playMusic('battle');  // Tracks: 'title', 'ashram', 'battle'

// Stop music
Audio.stopMusic();

// Sound effects
Audio.click();     // UI click
Audio.levelUp();   // Level up fanfare
Audio.slash();     // Attack sound
Audio.block();     // Block/defend sound
```

### Browser Unlock

Audio requires a user gesture to unlock:

```javascript
Audio.unlock();  // Called automatically on first pointer/key event
```

---

## Notification System (`Notify`)

Toast messages and achievement popups.

### Methods

```javascript
// Show a toast message
Notify.show('Message text', duration, color);
// duration: seconds (default: 2)
// color: any R.colors token (default: R.colors.gold)

// Show an achievement popup
Notify.achievement('Achievement Name', 'Description', 'iconId');
```

---

## Combat System (`Combat`)

Turn-based battle engine.

### Methods

```javascript
// Initialize a battle
Combat.startBattle(heroes, enemies);

// Build turn order based on agility
Combat.buildTurnOrder();

// Execute a player turn
Combat.playerTurn(action, target);
// action: 'attack' | 'skill' | 'defend' | 'item'
// target: enemy object

// Execute enemy AI turn
Combat.enemyTurn(enemy);

// Calculate damage
Combat.calculateDamage(attacker, defender, skill);

// Apply ailment
Combat.applyAilment(target, ailmentId, duration);

// Check if battle is over
Combat.checkBattleEnd();  // Returns 'won' | 'lost' | null
```

### Ailment Types

```javascript
Combat.AILAMENT_EFFECTS = {
  rakta: { name: 'Bleed', dmgPerTurn: 5, duration: 3 },
  vajra: { name: 'Stun', duration: 1 },
  agni: { name: 'Burn', dmgPerTurn: 8, duration: 3 },
  visha: { name: 'Poison', dmgPerTurn: 6, duration: 4 },
  shila: { name: 'Freeze', duration: 2 },
  vayu: { name: 'Wind', dmgPerTurn: 3, duration: 2 },
  confuse: { name: 'Confuse', duration: 1 }
};
```

### Properties

```javascript
Combat.heroes        // Party members in battle
Combat.enemies       // Enemies in battle
Combat.turnOrder     // Array of combatants sorted by agility
Combat.currentTurn   // Index into turnOrder
Combat.isPlayerTurn  // boolean
Combat.battleOver    // boolean
Combat.comboCount    // Consecutive hits counter
```

---

## Progression System (`Progression`)

XP, leveling, and difficulty scaling.

### Methods

```javascript
// Add XP to a hero (handles level-up)
Progression.addXP(hero, amount);  // Returns true if leveled up

// XP required for a given level
Progression.xpForLevel(level);  // Returns number

// Apply level-up stat gains
Progression.applyLevelUp(hero);

// Get current challenge multiplier
Progression.getChallenge();  // Returns 0.6-1.5

// Adjust challenge based on battle result
Progression.adjustChallenge(result);
// result: { won, hpPct, turnsPerEnemy }

// Get perk value for current save
Progression.perkValue('vajra');  // Returns number (0 if unowned)
```

---

## Cultivation System (`CultivationSystem`)

Idle cultivation and realm progression.

### Methods

```javascript
// Get current realm data
CultivationSystem.getRealmData();  // Returns realm object from REALMS

// Get player level (party[0].level)
CultivationSystem.getPlayerLevel();

// Add cultivation points
CultivationSystem.addCultivationBase(amount);

// Add prana
CultivationSystem.addPrana(amount);

// Get cultivation per second (from ashram + bonuses)
CultivationSystem.getCultivationPerSecond();

// Get prana per second
CultivationSystem.getPranaPerSecond();

// Process idle tick (called periodically)
CultivationSystem.tick(dt);
```

---

## Save System (`SaveSystem`)

localStorage persistence with migration.

### Methods

```javascript
// Save current state to localStorage
SaveSystem.save();  // Returns true/false

// Load state from localStorage
SaveSystem.load();  // Returns true/false

// Hydrate state from an object
SaveSystem.hydrate(stateObject);  // Returns true/false

// Run migration (fixes old save formats)
SaveSystem.migrate();

// Start auto-save timer (every 30s)
SaveSystem.startAutoSave();

// Stop auto-save
SaveSystem.stopAutoSave();
```

---

## Journey System (`JourneySystem`)

Narrative choice adventures.

### Methods

```javascript
// Initialize journey state
JourneySystem.init();

// Get progress for a journey
JourneySystem.getProgress(journeyId);
// Returns: { nodeId, completed, choices }

// Check if journey is completed
JourneySystem.isCompleted(journeyId);  // Returns boolean

// Get all available journeys
JourneySystem.getAvailable();  // Returns array of journey objects

// Make a choice at current node
JourneySystem.choose(journeyId, choiceIndex);

// Start a journey
JourneySystem.start(journeyId);
```

---

## Quest System (`QuestSystem`)

Zone-based quest tracking.

### Methods

```javascript
// Initialize quest state
QuestSystem.init();

// Get quests for a zone
QuestSystem.getQuests(zoneId);
// Returns: [{ id, name, desc, target, progress: { count, completed, claimed } }]

// Get quest chains for a zone
QuestSystem.getQuestChains(zoneId);

// Track progress on a quest objective
QuestSystem.trackCollect(itemName, amount);
QuestSystem.trackKill(enemyId, amount);

// Claim a completed quest reward
QuestSystem.claim(questId);
```

---

## Economy System (`Economy`)

Currency and inventory management.

### Currency Methods

```javascript
// Gold
Economy.addGold(amount);
Economy.spendGold(amount);         // Returns true/false
Economy.spendGoldOrNotify(amount); // Shows toast on failure

// Karma
Economy.addKarma(amount);
Economy.spendKarma(amount);

// Divine Fragments
Economy.addDivineFragments(amount);
Economy.spendDivineFragments(amount);
```

### Inventory Methods

```javascript
// Add an item to inventory
Economy.addItem(itemObject);
// itemObject: { name, type, qty?, ...otherProps }

// Remove an item
Economy.removeItem(itemName, qty);

// Check if player has an item
Economy.hasItem(itemName);  // Returns boolean

// Get item count
Economy.getItemCount(itemName);  // Returns number
```

---

## Duel System (`Duel`)

Lightweight 1v1 arena combat (Tournament, Endless Trials).

### Methods

```javascript
// Create a duel state
const duel = Duel.create(hero, foe);
// Returns: { hero, foe, playerHP, log }

// Execute a round
const result = Duel.round(duel, action, opts);
// action: 'attack' | 'special' | 'heal' | 'defend'
// opts: { healPct, regen, enrage, thorns }
// Returns: 'win' | 'lose' | null (ongoing)
```

### Example

```javascript
const hero = { str: 15, def: 10, mag: 8, maxHp: 100 };
const foe = { hp: 80, maxHp: 80, str: 12, def: 8 };

const duel = Duel.create(hero, foe);

let result = Duel.round(duel, 'attack', {});
if (!result) result = Duel.round(duel, 'heal', { healPct: 0.2 });
```

---

## UI Components (`UI`)

Reusable UI component factory functions.

### Button

```javascript
const btn = UI.Button(x, y, w, h, 'Button Text', color, hoverColor, textColor);
btn.onClick = function(data) { /* handle click */ };
btn.contains(x, y);  // Hit test
btn.update(dt);      // Spring physics
btn.render(ctx);     // Draw
```

### MagneticBtn (Spring-physics button)

```javascript
const btn = UI.MagneticBtn(x, y, w, h, 'Text', onClick, color);
// Uses spring physics: stiffness=120, damping=22
```

### Progress Bar

```javascript
const bar = UI.ProgressBar(x, y, w, h, value, max, color, bgColor);
bar.render(ctx);
```

### Panel

```javascript
const panel = UI.Panel(x, y, w, h, color);
panel.render(ctx);
```

### Card

```javascript
const card = UI.Card(x, y, w, h, { title: 'Title', body: 'Content' });
card.render(ctx);
```

### Modal

```javascript
const modal = UI.Modal(title, content, buttons);
modal.show();
modal.hide();
```

### Tab Bar

```javascript
const tabs = UI.TabBar(x, y, w, ['Tab1', 'Tab2', 'Tab3'], activeIndex);
tabs.render(ctx);
tabs.onClick(index);  // Handle tab change
```

---

## Data Constants

Static data loaded from `src/data/*.js`.

### HEROES

```javascript
HEROES.arjuna = {
  id: 'arjuna',
  name: 'Arjuna',
  title: 'The Peerless Archer',
  weapon: 'Gandiva',
  hp: 80, mp: 30, str: 12, agi: 14, mag: 8, def: 8,
  ailment: 'rakta',
  role: 'Ranged DPS',
  skills: [...],
  signalSkill: { name: 'Pashupatastra', dmg: 3.0 }
};
```

### ENEMIES

Enemy definitions by zone.

### ZONES

Zone metadata and encounter tables.

### REALMS

Cultivation realm progression data.

### AURAS

Aura unlock definitions.

### ITEMS

Item database with stats and effects.

### QUESTS

Quest definitions by zone.

### JOURNEYS

Narrative journey scripts.

---

## Error Handling

All systems use defensive programming:

- Missing effects (e.g., `R.stoneHit`) are guarded with existence checks
- Invalid state objects are sanitized in `SaveSystem.migrate()`
- Undefined scenes in `main.js` registration are skipped gracefully
- Audio context creation is deferred to user gesture

---

## Accessibility

### Reduced Motion

```javascript
// Check reduced motion preference
R.reducedMotion();  // Returns boolean

// Set manually
G.state.reduceMotion = true;
```

When enabled:
- All animations are disabled
- Transitions are instant
- Spring physics are bypassed

---

## Performance

- Immediate-mode rendering: entire canvas redrawn each frame
- No retained scene graph
- Tap queue limited to 4 events max
- Minimum tap interval: 70ms (flood protection)
- Auto-save interval: 30 seconds
