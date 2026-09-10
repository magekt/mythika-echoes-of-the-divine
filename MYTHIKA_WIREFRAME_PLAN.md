# MYTHIKA: ECHOES OF THE DIVINE — Wireframe Plan

**Platform:** Mobile-first (iOS + Android)  
**Art Style:** 16-bit Pixel Art with Indian color palettes (saffron, vermillion, peacock blue, gold)  
**Combat:** Turn-based with optional timing taps (Parry, Block, Swing, Heavy Swing, Duck, Defense, Magic, Heal, Run)  
**Architecture:** Offline-first  
**Monetization:** Premium ($7.99) + optional cosmetic DLC  
**Target Playtime:** 25-30 hours base, 40+ hours completionist

---

## TABLE OF CONTENTS

1. Game Identity & Theme
2. Core Progression System (Merged: Cultivation Realms)
3. Combat System
4. Scope: 3 Zones, 3 Heroes (Realistic MVP)
5. Complete Systems List
6. Economy & Currencies
7. Feature-Gated Onboarding
8. Screen-By-Screen Wireframes
9. Class & Customization
10. Endgame Loop
11. Save System
12. File Structure
13. Summary of Feature Sources

---

## 1. GAME IDENTITY & THEME

| Element | Description |
|---|---|
| **Title** | Mythika: Echoes of the Divine |
| **Setting** | The cosmic realms of Bharatvarsha — Aryavarta (mortal plains), Dandaka (enchanted forest), Meru (cosmic peak) |
| **Protagonist** | A young seeker chosen by the Devas to restore cosmic balance |
| **Pantheon** | Heroes based on mythological figures: Arjuna, Bhima, Karna, plus more post-launch |
| **Enemies** | Asuras, Rakshasas, Nagas, Danavas from the Puranas |
| **Theme** | Journey of cultivation — from mortal to immortal, through cycles of rebirth (Punarjanma) |

---

## 2. CORE PROGRESSION SYSTEM (Merged)

### Cultivation Realms as Primary Progression (Replaces conflicting level + realm system)

```
[Game starts here]
        │
        ▼
  ┌─────────────────┐
  │  MORTAL         │  (Levels 1-9)
  │  3 sub-stages   │
  └────────┬────────┘
           │ Breakthrough (Tribulation Boss #1)
           ▼
  ┌─────────────────┐
  │  QI GATHERING   │  (Levels 10-19)
  │  4 sub-stages   │
  └────────┬────────┘
           │ Breakthrough (Tribulation Boss #2)
           ▼
  ┌─────────────────┐
  │  FOUNDATION     │  (Levels 20-29)
  │  4 sub-stages   │
  └────────┬────────┘
           │ Breakthrough (Tribulation Boss #3)
           ▼
  ┌─────────────────┐
  │  CORE FORMATION │  (Levels 30-39)
  │  4 sub-stages   │
  └────────┬────────┘
           │ Breakthrough (Tribulation Boss #4)
           ▼
  ┌─────────────────┐
  │  NASCENT SOUL   │  (Levels 40-50)
  │  4 sub-stages   │
  └────────┬────────┘
           │ PUNARJANMA (Rebirth) available
           │ Resets to Mortal, grants permanent perks
           ▼
  [Repeat with bonuses — each cycle faster than the last]
           │
           ▼ (After 10x Punarjanma)
  ┌─────────────────┐
  │  ASCENSION      │  (Infinite scaling)
  │  +2% all stats  │
  │  per tier       │
  └─────────────────┘
```

**Key Rules:**
- Realm determines maximum level cap (Mortal = 9, Qi Gathering = 19, etc.)
- Each sub-stage gives 1 stat point + small stat bonuses
- Breakthrough to next realm requires: enough Cultivation Base + Breakthrough Pill + defeating Tribulation Boss
- Failure = lose some Cultivation Base, try again (no real-time wait)
- Punarjanma (Rebirth): resets to Mortal Lv.1, keeps equipment/currencies/perks, grants Soul Stones

### Idle Cultivation (Offline Progression)

- Character meditates in Ashram even while offline
- Generates **Cultivation Base** (realm XP) and **Qi** (crafting resource)
- Rate determined by Ashram upgrade level + techniques equipped
- Caps at 8 hours of offline accumulation (daily login collects)

---

## 3. COMBAT SYSTEM

### Turn-based with Optional Timing Taps

**Player Turn:**
1. Choose action from the action bar
2. Action resolves with OPTIONAL timing tap:
   - Normal = 100% effect
   - Perfect Tap = +25% bonus (damage, heal, or effect)
   - Miss = still resolves at 100% (no penalty)
3. All timing taps are **bonus**, never mandatory

**Available Actions:**

| Action | Type | Description |
|---|---|---|
| **Swing** | Melee ATK | Basic physical attack, generates +10 Combo Gauge |
| **Heavy Swing** | Melee ATK (slow) | 1.5x damage, -20% accuracy, generates +15 Combo Gauge |
| **Bow** | Ranged ATK | High accuracy, low damage, applies ailment (hero-dependent) |
| **Magic** | Magical ATK | Costs 5 MP, damage based on MAG stat |
| **Parry** | Defense (timing) | Perfect tap timing = nullify + counterattack. Miss = take full damage |
| **Block** | Defense (guaranteed) | Reduce damage by 50%, guaranteed to work |
| **Duck** | Evasion | Evade high attacks, sets up +50% next attack damage |
| **Defend** | Defense | Reduce damage by 75% for one turn |
| **Heal** | Support | Restore 20-25% HP, costs 10 MP |
| **Run** | Escape | Chance based on AGI stat vs. enemy level |

**Enemy Turn:**
1. Enemy attacks (can be Parried/Blocked/Ducked)
2. Status Ailments tick (Rakta bleed, Agni burn, Visha poison)
3. Combo Gauge decays by -5 per turn (encourages active combat)

### Status Ailment System

| Name | Effect | Applied By |
|---|---|---|
| **Vajra (Stun)** | Enemy skips next turn | Bhima, Heavy Swing |
| **Rakta (Bleed)** | 10% ATK per turn for 3 turns | Arjuna, Bow |
| **Agni (Burn)** | 15% MAG per turn for 3 turns | Karna, Magic |
| **Visha (Poison)** | 8% max HP per turn for 4 turns | Rare weapons, Alchemy |
| **Vayu (Airborne)** | 1.5x damage from next hit | Techniques |
| **Shila (Petrify)** | Cannot act, 2x damage from next hit | Rare, high-level |

### Divine Combo System

**Combo Gauge** (0-100):
- +10 per attack, +15 per skill, +5 per Perfect Tap
- +20 per status ailment applied
- -5 decay per enemy turn

**At 100 Gauge:** Divine Combo available
- All 3 active heroes attack in sequence (modular: plays each hero's Signal Skill animation + connecting particle effect)
- Damage = (sum of 3 hero ATK) × 1.5
- No unique per-pair animations needed — 3 unique Signal Skill animations, sequenced dynamically

**Cooldown:** Divine Combo resets gauge to 0. Cannot trigger again until gauge refills (typically 5-8 turns).

---

## 4. SCOPE: 3 ZONES, 3 HEROES (Realistic MVP)

### Zone Progression

| Zone | Realm | Level Range | Biome | Boss | Playtime |
|---|---|---|---|---|---|
| **1. Aryavarta** | Mortal → Qi Gathering | 1-19 | Golden plains, sacred groves, villages | Rakshasa Chieftain | 8-10 hrs |
| **2. Dandaka** | Qi Gathering → Foundation | 10-29 | Dark enchanted forest, caves | Dark Elf Prince | 10-12 hrs |
| **3. Mount Meru** | Foundation → Core Formation | 20-39 | Mountain peaks, elemental trials | Emerald Dragon | 10-15 hrs |

**Total base playtime:** 28-37 hours. +Completionist: 45+ hours.

**Post-launch zones** (free updates):
- 4. Kshira Sagar (Ocean World) — 6 months post-launch
- 5. Patala (Underworld) — 9 months post-launch
- 6. Swarga (Celestial Realm) — 12 months post-launch

### Launch Heroes

| Hero | Weapon | Ailment | Role | Unlock Method |
|---|---|---|---|---|
| **Arjuna** | Bow (Gandiva) | Rakta (Bleed) | Ranged DPS | Starter — begins with player |
| **Bhima** | Mace (Gada) | Vajra (Stun) | Tank / Melee | Starter — begins with player |
| **Karna** | Spear (Vel) | Agni (Burn) | Burst DPS | Story unlock — defeat Zone 2 boss |

**Post-launch heroes:**
- Hanuman (post-launch update 1)
- Draupadi (post-launch update 2)
- Nakula & Sahadeva (post-launch update 3)

### Party Composition Rules

- **3 active** heroes in party at all times
- All 3 heroes gain 100% XP from combat (no bench penalty)
- **Mid-combat swap** available 1x per battle (costs no turn, gauge cooldown of 5 turns)
- **Zone affinity**: each zone boosts one hero (+20% stats) — encourages trying different combos even with only 3 heroes

---

## 5. COMPLETE SYSTEMS LIST

| System | Description | MVP or Post-Launch |
|---|---|---|
| **Turn-based Combat** | Swing, Heavy Swing, Bow, Magic, Parry, Block, Duck, Defend, Heal, Run | MVP |
| **Status Ailments** | Vajra (Stun), Rakta (Bleed), Agni (Burn), Visha (Poison), Vayu (Airborne), Shila (Petrify) | MVP |
| **Divine Combo** | Combo Gauge (0-100), modular 3-hero chain attack | MVP |
| **Cultivation Realms** | Mortal → Qi Gathering → Foundation → Core Formation → Nascent Soul | MVP (first 4 realms) |
| **Idle Cultivation** | Offline generation of Cultivation Base + Qi | MVP |
| **Tribulation Bosses** | Boss fight to break through to next realm | MVP |
| **Alchemy** | Craft pills from herbs (Breakthrough, XP, Stat, Healing) | MVP |
| **Punarjanma (Rebirth)** | Reset to Mortal, keep perks/currencies/gear | MVP |
| **Rebirth Perks** | 3-tier perk system (Perks 1, Perks 2, Ascension) | MVP |
| **Ashram (Home Base)** | Upgradeable dwelling that boosts cultivation speed, Qi generation | MVP |
| **Farming** | Grow Ayurvedic herbs (in-game time, not real time) | MVP |
| **Fishing** | Relaxing mini-game for rare materials | MVP |
| **Forge** | Upgrade equipment (rarity, augment, socket gems) | MVP |
| **Bazaar** | Fixed NPC shop with randomized inventory per zone visit | MVP |
| **Tournament of Souls** | Fight procedurally generated AI opponents (scaled to player level) | MVP |
| **Fortunate Encounters** | Random events during exploration (meet sages, find treasures) | MVP |
| **Spirit Beasts (3)** | Garuda, Nandi, Naga — passive buffs + once-per-battle active ability | MVP |
| **24 Auras** | 8 per class path, equip up to 3, cross-class usable with class boost | MVP |
| **3 Equipment Slots** | Hero-specific Weapon, shared Armor, shared Accessory | MVP |
| **Feature-Gated Onboarding** | Systems unlock progressively over 20+ hours | MVP |
| **Echoes Mode** | Replay zones at +100% difficulty for better rewards | MVP |
| **Weekly Boss Rush** | Random boss gauntlet (5-10 bosses) for legendary loot | MVP |
| **Ascension** | Infinite stat scaling after 10x Punarjanma | Post-launch |
| **Co-op Solo Raids** | Phantom Ally system (AI benched heroes assist) | Post-launch |
| **Tirtha Mode (NG+)** | Hard mode with exclusive rewards | Post-launch |

---

## 6. ECONOMY & CURRENCIES

### 3-Tier Currency System

| Currency | Earned From | Spent On | Tradeable |
|---|---|---|---|
| **Rupees (Gold)** | Combat, quests, Bazaar sales | Basic items, herbs, Bazaar purchases | NPC shop only |
| **Soul Stones** | Achievements, daily rewards, rebirth | Perks, rare items, ashram upgrades | Cannot buy/sell |
| **Divine Fragments** | Weekly Boss Rush, events | Exclusive cosmetics, rare auras | Cannot buy/sell |

### Resource Chain

```
Farming (herbs)
    │
    ▼
Alchemy ──────► Pills (Breakthrough, XP, Stat, Healing)
    │
    ▼
Combat (monster drops: scales, bones, ores)
    │
    ▼
Forge ─────────► Equipment upgrades (+1 to +15)
    │                  │
    ▼                  ▼
Gem Socketing ──► Stat bonuses (Navaratna gems from fishing/Bazaar)
```

---

## 7. FEATURE-GATED ONBOARDING

| Playtime | Systems Unlocked |
|---|---|
| **0-15 min** | Tutorial combat (Swing, Block, Magic, Heal). Zone 1 (Aryavarta Grasslands) entrance. Basic exploration. |
| **15-60 min** | Parry, Duck, Defend, Heavy Swing. First stat distribution. Ashram introduction. |
| **1-2 hrs** | Status Ailments tutorial (Rakta, Vajra). Zone 2 (Dandaka) unlocked. |
| **2-4 hrs** | Farming, Fishing, Ashram upgrades. First Tribulation boss (reach Qi Gathering). |
| **4-8 hrs** | Alchemy unlocked. Spirit Beasts introduction. Divine Combo unlocked. |
| **8-15 hrs** | First Punarjanma available. Rebirth perks. Aura system unlocked. |
| **15-20 hrs** | Zone 3 (Mount Meru). Forge upgrades. Soul Stones introduction. |
| **20-25 hrs** | Tournament of Souls unlocked. Echoes Mode unlocked. |
| **25+ hrs** | Weekly Boss Rush. Multiple Punarjanma cycles. Endgame optimization. |

---

## 8. SCREEN-BY-SCREEN WIREFRAMES

### Screen 1: Title Screen

```
┌─────────────────────────────┐
│                             │
│   ╔═══════════════════════╗ │
│   ║   MYTHIKA             ║ │
│   ║ Echoes of the Divine  ║ │
│   ╚═══════════════════════╝ │
│                             │
│     [Animated Mount Meru]    │
│     [16-bit pixel stars]    │
│     [Saffron sky gradient]  │
│                             │
│   ┌─────────────────────┐  │
│   │   TAP TO BEGIN      │  │
│   └─────────────────────┘  │
│                             │
│   ┌─────────────────────┐  │
│   │  CONTINUE (75%)     │  │
│   ├─────────────────────┤  │
│   │  NEW GAME           │  │
│   ├─────────────────────┤  │
│   │  SETTINGS           │  │
│   └─────────────────────┘  │
│                             │
│   [8-bit Veena melody]     │
└─────────────────────────────┘
```

### Screen 2: Character Creation

```
┌─────────────────────────────┐
│ ← Back          MYTHIKA     │
│─────────────────────────────│
│  Choose Your Path (Varna)   │
│                             │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │KSHATRIYA│ │ RISHI │ │ YOGI ││
│  │Physical│ │ Magic │ │Hybrid││
│  └──────┘ └──────┘ └──────┘│
│                             │
│  Name: [______________]     │
│                             │
│  Stats (10 points):         │
│  Prana (HP):   [====  ] +  │
│  Chitta (MP):  [===   ] +  │
│  Bala (STR):   [==    ] +  │
│  Chal (AGI):   [=     ] +  │
│  Vidya (MAG):  [==    ] +  │
│  Kavach (DEF): [=     ] +  │
│                             │
│  ┌─────────────────────┐   │
│  │   BEGIN JOURNEY     │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### Screen 3: Ashram (Home Base)

```
┌─────────────────────────────┐
│  Cultivation: Qi Gathering  │
│  ═══[████████░░░░]═══ 65%  │
│  Prana: 80/100 | Gold: 245 │
│─────────────────────────────│
│                             │
│  [Your Hermitage]           │
│  Level 3 | Aura: +5% CP/s  │
│                             │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │TRAVEL│ │CULTI-│ │ASHRA│  │
│  │      │ │VATE  │ │(Farm)│  │
│  └─────┘ └─────┘ └─────┘  │
│                             │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ALCHEMY│ │FORGE │ │SPIRIT│  │
│  │      │ │      │ │BEAST│  │
│  └─────┘ └─────┘ └─────┘  │
│                             │
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │BAZAAR│ │TOUR- │ │GANGA│  │
│  │(Shop)│ │NAMENT│ │(Hero)│  │
│  └─────┘ └─────┘ └─────┘  │
│                             │
│  Bottom Nav: [Ashram]       │
│  [Travel] [Party] [More]    │
└─────────────────────────────┘
```

### Screen 4: Travel Map

```
┌─────────────────────────────┐
│  Prana: ████████░░ 80/100  │
│─────────────────────────────│
│                             │
│  [Region Map - Pixel Art]    │
│                             │
│  ┌─────────────────────┐   │
│  │  ★ Aryavarta (Lv1-9)│   │
│  │  Grasslands (100%)  │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  ★ Dandaka (Lv10-19)│   │
│  │  Forest (45%)       │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  ★ Mount Meru (Lv20+)│  │
│  │  [LOCKED - Complete │   │
│  │   Dandaka]           │   │
│  └─────────────────────┘   │
│                             │
│  [LOCKED] ★ Kshira Sagar   │
│  [LOCKED] ★ Patala         │
│  [LOCKED] ★ Swarga         │
└─────────────────────────────┘
```

### Screen 5: Zone Exploration

```
┌─────────────────────────────┐
│  Prana: ██████░░░░ 60/100  │
│  Zone: Dandaka Forest       │
│  Exploration: 45%           │
│─────────────────────────────│
│                             │
│  [Pixel art scene: dark     │
│   forest clearing]          │
│                             │
│  "Ancient trees block the   │
│   sun. You hear growling."  │
│                             │
│  ┌─────────────────────┐   │
│  │  [Explore] (5 Prana) │   │
│  ├─────────────────────┤   │
│  │  [Rest] (recover)   │   │
│  ├─────────────────────┤   │
│  │  [Fish] (near water)│   │
│  ├─────────────────────┤   │
│  │  [Return to Ashram] │   │
│  └─────────────────────┘   │
│                             │
│  Recent: Wolf slain (+25XP)│
│  Found: Soul Key x1         │
└─────────────────────────────┘
```

### Screen 6: Combat Screen

```
┌─────────────────────────────┐
│  Rakshasa  Lv.3   HP: 45/45│
│  [Bleed x1]                 │
│─────────────────────────────│
│                             │
│       ╔═══════════╗        │
│       ║   👹       ║        │
│       ║  Rakshasa  ║        │
│       ╚═══════════╝        │
│                             │
│  ┌─────────────────────┐   │
│  │  Arjuna  HP: ██████░│   │
│  │          MP: ███░░░░│   │
│  │  Combo Gauge: ██░░░ │   │
│  └─────────────────────┘   │
│                             │
│  [Action Bar - Bottom 1/3] │
│  ┌────┐ ┌────┐ ┌────┐ ┌──┐│
│  │⚔️  │ │💥  │ │🏹  │ │✨││
│  │SWING│ │HEAVY│ │BOW │ │MAG││
│  └────┘ └────┘ └────┘ └──┘│
│  ┌────┐ ┌────┐ ┌────┐ ┌──┐│
│  │🛡️  │ │💨  │ │🏃  │ │💊││
│  │BLOCK│ │DUCK │ │RUN │ │HE││
│  └────┘ └────┘ └────┘ └──┘│
│                             │
│  [DIVINE COMBO READY!]      │
│  (only when gauge = 100)    │
│                             │
│  Party: [Arjuna] [Bhima]   │
│         [Karna]             │
└─────────────────────────────┘
```

### Screen 7: Party / Hero Management

```
┌─────────────────────────────┐
│  ← Back         PARTY       │
│─────────────────────────────│
│                             │
│  [Hero 1] Arjuna  Qi Gath. │
│  ⚔️ STR: 12  🏹 AGI: 8    │
│  Ailment: Bleed             │
│  Weapon: Gandiva (+5 ATK)   │
│  Armor:  Leather (+3 DEF)  │
│  Amulet: Ruby (+2 MAG)     │
│  [Equip] [Skills] [Info]    │
│─────────────────────────────│
│  [Hero 2] Bhima   Qi Gath. │
│  ⚔️ STR: 18  🛡️ DEF: 10   │
│  Ailment: Stun              │
│  [Equip] [Skills] [Info]    │
│─────────────────────────────│
│  [Hero 3] Karna  Foundation │
│  ⚔️ STR: 14  🧠 MAG: 12   │
│  Ailment: Burn              │
│  [Equip] [Skills] [Info]    │
│                             │
│  [GANGA - View Heroes]      │
│  [LOCKED] Hanuman           │
│  [LOCKED] Draupadi          │
└─────────────────────────────┘
```

### Screen 8: Alchemy Screen

```
┌─────────────────────────────┐
│  ← Back        ALCHEMY     │
│─────────────────────────────│
│                             │
│  Qi: 1,247  |  Herbs: 12   │
│                             │
│  Available Recipes:         │
│                             │
│  ┌─────────────────────┐   │
│  │  XP Pill            │   │
│  │  +500 Cultivation   │   │
│  │  Requires: Tulsi x3 │   │
│  │  [Craft]            │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  Breakthrough Pill   │   │
│  │  +15% Tribulation    │   │
│  │  Requires: Ashwa x5  │   │
│  │  + Brahmi x3         │   │
│  │  [Craft] [Lock:      │   │
│  │   not enough herbs]  │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  Stat Pill (STR)    │   │
│  │  +1 STR permanent   │   │
│  │  Requires: Tulsi x10│   │
│  │  + Qi x100          │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### Screen 9: Cultivation / Breakthrough Screen

```
┌─────────────────────────────┐
│  ← Back     CULTIVATION     │
│─────────────────────────────│
│                             │
│  Current Realm: Qi Gathering│
│  Stage: Peak (Lv.19)        │
│  Cultivation Base: ████ 95% │
│                             │
│  ┌─────────────────────┐   │
│  │  [Cultivate]         │   │
│  │  +5% Base per hour   │   │
│  │  (offline: 8h cap)   │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  BREAKTHROUGH to    │   │
│  │  FOUNDATION         │   │
│  │                     │   │
│  │  Requirements:      │   │
│  │  ✓ Base at 100%    │   │
│  │  ✗ Breakthrough    │   │
│  │    Pill (0/1)      │   │
│  │  ✗ Defeat          │   │
│  │  Tribulation Boss  │   │
│  └─────────────────────┘   │
│                             │
│  Ashram Aura: +12% CP/s    │
│  Qi Generation: 5/sec      │
└─────────────────────────────┘
```

### Screen 10: Punarjanma (Rebirth) Screen

```
┌─────────────────────────────┐
│  ← Back     PUNARJANMA      │
│─────────────────────────────│
│                             │
│  Current Life: 1st          │
│  Soul Stones: 1,247        │
│  Realm: Core Formation      │
│                             │
│  [PUNARJANMA] — Reset to   │
│   Mortal Lv.1, keep:       │
│   ✓ Equipment              │
│   ✓ Currencies (Gold, Qi)  │
│   ✓ Perks                  │
│   ✓ Ashram upgrades        │
│   ✓ Alchemy recipes        │
│   ✗ Level / Realm          │
│   ✗ Zone progression       │
│                             │
│  ┌─────────────────────┐   │
│  │  PERKS 1            │   │
│  │  Berserker Lv.3     │   │
│  │  (+50% phys dmg)    │   │
│  │  Fast Learner Lv.2  │   │
│  │  (+25% XP)          │   │
│  │  Thick Skin Lv.1    │   │
│  │  (-5% dmg taken)    │   │
│  └─────────────────────┘   │
│                             │
│  [PERKS 2] [ASCENSION]     │
│  (locked: need 1000 SS)    │
│                             │
│  [REBIRTH NOW]              │
└─────────────────────────────┘
```

### Screen 11: Spirit Beast Screen

```
┌─────────────────────────────┐
│  ← Back    SPIRIT BEASTS   │
│─────────────────────────────│
│                             │
│  ┌─────────────────────┐   │
│  │  🦅 Garuda          │   │
│  │  Level: 5           │   │
│  │  Passive: +10%      │   │
│  │  exploration speed   │   │
│  │  Active: Dive Bomb   │   │
│  │  (2x AGI damage)     │   │
│  │  [Summoned]          │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  🐂 Nandi           │   │
│  │  Level: 3           │   │
│  │  Passive: +8% DEF   │   │
│  │  Active: Stampede    │   │
│  │  (stun all enemies)  │   │
│  │  [Not summoned]      │   │
│  │  [Equip]             │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  🐍 Naga            │   │
│  │  [LOCKED - Dandaka  │   │
│  │   Temple]            │   │
│  └─────────────────────┘   │
│                             │
│  Each hero can equip 1     │
│  Spirit Beast for combat   │
└─────────────────────────────┘
```

### Screen 12: Ashram Upgrades (Abode)

```
┌─────────────────────────────┐
│  ← Back   ASHRAM UPGRADES  │
│─────────────────────────────│
│                             │
│  Ashram Level: 3            │
│  Next Level: 500 Gold      │
│  ┌─────────────────────┐   │
│  │  [UPGRADE]           │   │
│  │  Cost: 500 Gold      │   │
│  │  Effect:             │   │
│  │  +5% Cultivation spd  │   │
│  │  +3 Qi/sec           │   │
│  └─────────────────────┘   │
│                             │
│  Available Upgrades:        │
│  ┌─────┐ ┌─────┐ ┌─────┐ │
│  │GARDEN│ │ALTAR│ │STORE│ │
│  │Lv.2  │ │Lv.1 │ │Lv.0 │ │
│  │(farming│ │(prayer│ │(keep│ │
│  │ speed)│ │bonus)│ │items)│ │
│  └─────┘ └─────┘ └─────┘ │
│                             │
│  Ashram Aura: +12% CP/s    │
│  (combined from all ups)   │
└─────────────────────────────┘
```

---

## 9. CLASS & CUSTOMIZATION

### Class Paths (Choose at Character Creation)

| Path | Focus | Starting Bonus | Elite Classes (Unlockable) |
|---|---|---|---|
| **Kshatriya** | Physical damage, high HP, tanking | +5 STR, +20 HP | Knight (+10% dmg), Assassin (+2x first crit) |
| **Rishi** | Magic damage, high MP, spells | +5 MAG, +20 MP | Dark Wizard (+75% spell), Light Wizard (+1 milestone) |
| **Yogi** | Hybrid, balanced stats | +3 STR, +3 MAG | Battle Wizard (dual cast+weapon), Paladin (heal+shield) |

### 24 Auras (8 per Class Path)

**All auras usable by any class** — class path determines which auras get **+50% effectiveness boost**.

**Kshatriya Auras:** Lion's Might (+STR), Eagle Eye (+crit%), Bear's Endurance (+HP), Tiger's Fury (+ATK on low HP), Bull Charge (+stun chance), Wolf Pack (+party ATK), Falcon Dive (+airborne dmg), Elephant Stomp (+AoE dmg)

**Rishi Auras:** Serpent's Wisdom (+MAG), Lotus Regeneration (+MP/turn), Phoenix Flame (+burn dmg), Moonlight Heal (+heal power), Star Fall (+magic AoE), River Flow (+speed), Forest Veil (+dodge), Sand Storm (+blind chance)

**Yogi Auras:** Turtle Shell (+DEF), Crane Grace (+dodge), Monkey Trick (+AGI), Dragon Breath (+all element dmg), Butterfly Dream (+dream rewards), Mountain Still (+defense while idle), Ocean Depth (+MP), Sky Beyond (+XP gain)

**Equip Limit:** 3 auras at start, +1 per 3 rebirths (max 6 at 10 rebirths)

### Equipment (3 Slots)

| Slot | Hero-Specific? | Example | Upgrade Path |
|---|---|---|---|
| **Weapon** | Yes — each hero has 1-2 unique weapons | Arjuna: Gandiva / Bow of Light | +1 to +15 via Forge, each level +5% ATK |
| **Armor** | Shared — light/medium/heavy weight classes | Leather (light), Chain (medium), Plate (heavy) | Same |
| **Accessory** | Shared — amulets, rings | Ruby Amulet (+MAG), Emerald Ring (+crit) | Same |

**Rarity:** Normal → Rare → Epic → Legendary → Divine  
**Gem Socketing:** Navaratna gems (Ruby, Emerald, Sapphire, Topaz, Diamond, etc.) drop from bosses/fishing. Each adds a specific stat bonus.

---

## 10. ENDGAME LOOP

### Post-Completion Activities

| Mode | Unlock | Description | Reward |
|---|---|---|---|
| **Echoes Mode** | Complete all 3 zones once | Replay zones at +100% difficulty, +75% rewards | Rare materials, Legendary gear |
| **Weekly Boss Rush** | Reach Core Formation | Random 5-10 boss gauntlet, no healing between fights | Divine Fragments, exclusive auras |
| **Punarjanma Cycles** | Reach Nascent Soul | Reset to Mortal with perks, repeat faster each cycle | Soul Stones, permanent stat bonuses |
| **Tirtha Mode (NG+)** | Post-launch | New zone with exclusive equipment | Cosmetic skins, new recipes |

### Ascension (Post-10x Punarjanma)

- +2% to all stats per Ascension tier
- Unlimited scaling
- Each tier requires more Cultivation Base than the last (diminishing returns, not a cap)

---

## 11. SAVE SYSTEM

| Feature | Implementation |
|---|---|
| **Primary save** | Local JSON file in app's document directory |
| **Save slots** | 3 manual save slots + auto-save (last 3 checkpoints) |
| **Save frequency** | Auto-save after every battle, every zone transition, every breakthrough |
| **Rebirth persistence** | Rebirth saves to a separate "rebirth history" log (append-only) |
| **Cloud backup** | v1.1 feature — iCloud (iOS) / Google Drive (Android) |
| **Device transfer** | Manual export/import via file sharing |
| **Save corruption** | Checksum per save file; auto-detect and offer backup restore |
| **Offline functionality** | Full offline play. Cloud sync is optional and explicit (manual trigger) |

---

## 12. FILE STRUCTURE

```
Mythika/
├── Assets/
│   ├── PixelArt/
│   │   ├── Heroes/           # 48x48 sprites (Arjuna, Bhima, Karna)
│   │   │   ├── idle.png, walk.png, swing.png, heavy.png, bow.png, skill.png, hit.png, death.png
│   │   ├── Enemies/          # 32x32 to 64x64 (Rakshasa, Wolf, Banshee, etc.)
│   │   ├── Zones/            # 16x16 tilesets (Aryavarta, Dandaka, Meru)
│   │   ├── UI/               # Buttons, panels, icons, action bar
│   │   ├── Items/            # Weapon, armor, consumable icons
│   │   ├── Effects/          # Spell animations, particles, Divine Combo VFX
│   │   └── Misc/             # Logos, title screen, loading screens
│   ├── Audio/
│   │   ├── BGM/              # 3 zone tracks, 1 battle track, 1 boss track
│   │   ├── SFX/              # Combat swings, magic, UI clicks, breakthroughs
│   │   └── Ambient/          # Forest ambience, cave echoes, ashram calm
│   ├── Scripts/
│   │   ├── Combat/           # Turn engine, timing taps, ailments, combos
│   │   ├── Heroes/           # Hero data, skills, progression
│   │   ├── Cultivation/      # Realm system, breakthroughs, idle cultivation
│   │   ├── Exploration/      # Zone generation, random encounters
│   │   ├── Systems/          # Rebirth, alchemy, farming, fishing, forge
│   │   ├── UI/               # All screen controllers, menus
│   │   └── Data/             # Save/load, JSON parsing, localization
│   ├── Data/
│   │   ├── heroes.json       # 3 hero definitions
│   │   ├── enemies.json      # ~30 monster definitions
│   │   ├── zones.json        # 3 zone configurations
│   │   ├── perks.json        # Rebirth perk tree
│   │   ├── auras.json        # 24 aura definitions
│   │   ├── items.json        # Equipment definitions
│   │   ├── classes.json      # Class tree definitions
│   │   ├── cultivation.json  # Realm progression data
│   │   ├── alchemy.json      # Pill recipes
│   │   ├── spirit_beasts.json# 3 beast definitions
│   │   └── strings_en.json   # English text (localization-ready)
│   │   └── strings_hi.json   # Hindi text
│   └── Scenes/
│       ├── TitleScene
│       ├── CharacterCreateScene
│       ├── AshramScene
│       ├── TravelMapScene
│       ├── ZoneExplorationScene
│       ├── CombatScene
│       ├── PartyScene
│       ├── CultivationScene
│       ├── AlchemyScene
│       ├── PunarjanmaScene
│       ├── SpiritBeastScene
│       ├── ForgeScene
│       ├── TournamentScene
│       ├── BazaarScene
│       ├── FarmScene
│       ├── FishingScene
│       └── SettingsScene
```

---

## 13. SUMMARY OF FEATURE SOURCES

| Feature | Primary Source | Adaptation |
|---|---|---|
| Turn-based timing taps | **Exp Minima** | Core combat loop |
| Status Ailment tag-team | **DragonSword: Awakening** | Vedic ailments + Divine Combo |
| 6 Stats + Milestones | **Exp Minima** | HP, MP, STR, AGI, MAG, DEF |
| Class system | **Exp Minima** | Kshatriya / Rishi / Yogi |
| Punarjanma (Rebirth) | **Exp Minima** | 3-tier perks, Soul Stones |
| Exploration with Prana | **Exp Minima** | Zone exploration with random encounters |
| Dream system | **Exp Minima** | Sleep for visions/buffs |
| Auras (24) | **Exp Minima** | Equippable passive modifiers |
| Farming + Fishing | **Exp Minima** | Offline growth + mini-game |
| No gacha / earnable heroes | **DragonSword: Awakening** | Story-based hero unlocks |
| Divine Combos (Signal Skills) | **DragonSword: Awakening** | Combo Gauge system |
| Familiars (Spirit Beasts) | **DragonSword: Awakening** | 3 beasts: Garuda, Nandi, Naga |
| Crafting + Forge | **DragonSwords 2** | Upgrades, gem socketing |
| Bazaar (NPC shop) | **DragonSwords 2** | Randomized inventory per visit |
| Tournament of Souls (Arena) | **DragonSwords 2** | Procedural AI opponents |
| Cultivation Realms | **Ideal Taoist / Overmortal** | Merge of level + realm progression |
| Idle Cultivation | **Overmortal / Ideal Taoist** | Offline base generation |
| Alchemy / Pill Refining | **Overmortal** | Herb → Pill crafting chain |
| Breakthrough Tribulations | **Ideal Taoist / Overmortal** | Boss fights for realm advancement |
| Ashram (Abode) Upgrades | **Overmortal** | Base building for stat bonuses |
| Parry / Block / Duck / Defense | **User Request** | Extended combat options |
| Echoes Mode + Boss Rush + Ascension | **User Request** | Three endgame pillars |

---

## 18 FLAWS FIXED FROM REVIEW

| # | Original Flaw | Applied Fix |
|---|---|---|
| 1 | Scope too large (5 zones/heroes) | Reduced to **3 zones, 3 heroes** for realistic MVP |
| 2 | Dual progression (levels vs. realms) | **Merged into one**: Realms = level cap + sub-stages |
| 3 | 20 Divine Combo animations unfeasible | Modular: **3 Signal Skills**, sequenced dynamically |
| 4 | AI Ghosts fight player's own team | **Procedural opponents** scaled to player level |
| 5 | Bazaar pricing exploitable | **Fixed NPC shop** with randomized per-zone inventory |
| 6 | Monetization model contradictory | Premium **$7.99 + optional cosmetic DLC** (clear model) |
| 7 | Equipment identity crisis | Hybrid: **hero-specific weapon**, shared armor/accessory |
| 8 | Benched heroes gain no XP | **All heroes get 100% XP** (no bench penalty) |
| 9 | Alchemy real-time wall | Herbs grow on **in-game time**, basic herbs buyable with gold |
| 10 | 16/24 auras locked per playthrough | All auras **cross-class usable** (+50% boost for own class) |
| 11 | Cloud save complexity | **Local-only at launch**, cloud sync is v1.1 feature |
| 12 | Hindi text overflow in UI | **Flexible text containers**, test with Hindi lorem ipsum |
| 13 | Only 10-20 hours playtime | Narrowed XP curve = **28-37 hours base**, +side content |
| 14 | Spirit beast scope (5+ animations) | **3 beasts, passive-only at launch** (no evolution stages) |
| 15 | Divine Combo too frequent | **Combo Gauge** (0-100, decays -5/turn, triggers ~every 6 turns) |
| 16 | No respec option for class | Added **Respec at Ashram** (costs gold, scalable) |
| 17 | Rebirth gear overpowered at Lv.1 | Gear has **realm requirements** (not level). Rebirth resets level but gear scales down |
| 18 | Missing New Game+ mode | Added **Tirtha Mode** (NG+) with exclusive rewards (post-launch) |

---

*This plan is ready for implementation. Recommended engine: Unity 2D or Godot. Target: 12-18 months for MVP with a team of 2-3 developers.*
