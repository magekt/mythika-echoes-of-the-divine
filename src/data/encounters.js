// Encounter registry — static data for narrative encounters.
// Each encounter has a pool ('zone' or 'travel'), level/karma bounds, flag prerequisites,
// a prompt, and choice entries with rewards, flags, and optional karma deltas.
// Tone: devas/nagas/yakshas/rishis are testing, generous, or sovereign — never demeaned (REQ-003).

const ENCOUNTERS = {
  nagaBargain: {
    id: 'nagaBargain',
    name: 'Naga at the Ford',
    icon: '\uD83D\uDC0D',
    pool: 'zone',
    zones: ['dandaka'],
    weight: 10,
    lvlMin: 1, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    prompt: 'A great naga coils across the forest ford, scales catching the light like coins. It regards you with ancient eyes and speaks: "Share what you carry, or prove your strength — both paths open before you."',
    choices: [
      {
        text: 'Share your gold',
        preview: 'Lose 50 gold, gain karma and experience',
        reward: { gold: -50, karma: 3, xp: 60 },
        flags: { 'enc_nagaBargain': 'share' }
      },
      {
        text: 'Demand passage',
        preview: 'Press past the naga for gold and experience',
        reward: { xp: 90, gold: 30 },
        flags: { 'enc_nagaBargain': 'force' }
      }
    ]
  },
  marutCrossing: {
    id: 'marutCrossing',
    name: 'Marut Storm-Path',
    icon: '\u26A1',
    pool: 'travel',
    zones: ['aryavarta', 'dandaka'],
    weight: 10,
    lvlMin: 1, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    prompt: 'The Maruts — storm-wielding devas — split the clouds above the road. One leans down from the thunderhead and offers: "We carry the swift. The slow find their own gold. Choose."',
    choices: [
      {
        text: 'Ride the gale',
        preview: 'Swift passage, karma and experience',
        reward: { xp: 100, karma: 1 },
        flags: { 'enc_marutCrossing': 'ride' }
      },
      {
        text: 'Walk the long road',
        preview: 'Safe, slower road; gold found along the way',
        reward: { gold: 40 },
        flags: { 'enc_marutCrossing': 'walk' }
      }
    ]
  },

  rishiBoon: {
    id: 'rishiBoon',
    name: 'Rishi\'s Hermitage',
    icon: '\uD83D\uDDD4\uFE0F',
    pool: 'zone',
    zones: ['aryavarta', 'dandaka', 'meru'],
    weight: 8,
    lvlMin: 5, lvlMax: 99,
    karmaMin: 10, karmaMax: null,
    flagsReq: {},
    prompt: 'A venerable rishi sits beneath a banyan tree, eyes closed in meditation. As you approach, he opens one eye: "Your karma speaks well of you. I offer a boon — but choose wisely, for a rishi\'s gifts carry weight."',
    choices: [
      {
        text: 'Ask for wisdom',
        preview: 'Gain prana and experience',
        reward: { prana: 80, xp: 120 },
        flags: { 'enc_rishiBoon': 'wisdom' }
      },
      {
        text: 'Ask for protection',
        preview: 'Gain defense and karma',
        reward: { def: 2, karma: 2, xp: 60 },
        flags: { 'enc_rishiBoon': 'protection' }
      }
    ]
  },

  asuraWhisper: {
    id: 'asuraWhisper',
    name: 'Asura\'s Whisper',
    icon: '\uD83D\uDD25',
    pool: 'zone',
    zones: ['patala', 'dandaka'],
    weight: 8,
    lvlMin: 8, lvlMax: 99,
    karmaMin: null, karmaMax: 5,
    flagsReq: {},
    prompt: 'A shadow detaches from the treeline. An asura, wreathed in smoke, speaks in a voice like silk over steel: "I sense the hunger in you. Take this dark blessing — power enough to crush your enemies, at a small cost."',
    choices: [
      {
        text: 'Accept the dark blessing',
        preview: 'Gain strength but lose karma',
        reward: { str: 3, karma: -3, xp: 100 },
        flags: { 'enc_asuraWhisper': 'accepted' }
      },
      {
        text: 'Refuse and pray',
        preview: 'Gain karma and prana',
        reward: { karma: 4, prana: 40, xp: 50 },
        flags: { 'enc_asuraWhisper': 'refused' }
      }
    ]
  },

  yakshaRiddle: {
    id: 'yakshaRiddle',
    name: 'Yaksha\'s Riddle',
    icon: '\uD83E\uDDEA',
    pool: 'zone',
    zones: ['meru', 'svarga'],
    weight: 8,
    lvlMin: 10, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    prompt: 'A yaksha materializes from the mountain stone, gemstones glittering in its crown. "Answer me this: what walks on four legs in the morning, two at noon, and three in the evening?答 correctly, and I shall reward you."',
    choices: [
      {
        text: '"Man — crawling, walking, then with a cane"',
        preview: 'Correct answer: gain gold and experience',
        reward: { gold: 120, xp: 150 },
        flags: { 'enc_yakshaRiddle': 'correct' }
      },
      {
        text: '"I do not know"',
        preview: 'Honesty: gain karma and a small gift',
        reward: { karma: 3, prana: 30, xp: 40 },
        flags: { 'enc_yakshaRiddle': 'honest' }
      }
    ]
  },

  devaBlessing: {
    id: 'devaBlessing',
    name: 'Deva\'s Blessing',
    icon: '\u2728',
    pool: 'travel',
    zones: ['aryavarta', 'dandaka', 'meru', 'svarga'],
    weight: 8,
    lvlMin: 5, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    prompt: 'A deva descends from the heavens in a shower of golden light. "You have walked far and fought well. I offer you my blessing — but blessings are not given freely. What do you seek?"',
    choices: [
      {
        text: 'Blessing of vitality',
        preview: 'Restore health and gain max HP',
        reward: { hp: 30, maxHp: 10, xp: 80 },
        flags: { 'enc_devBlessing': 'vitality' }
      },
      {
        text: 'Blessing of fortune',
        preview: 'Gain gold and karma',
        reward: { gold: 80, karma: 2, xp: 80 },
        flags: { 'enc_devBlessing': 'fortune' }
      }
    ]
  },

  tapasPilgrim: {
    id: 'tapasPilgrim',
    name: 'Tapas Pilgrim\'s Fire',
    icon: '\uD83D\uDD25',
    pool: 'travel',
    zones: ['meru', 'svarga', 'tapobhumi'],
    weight: 8,
    lvlMin: 15, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    prompt: 'A pilgrim sits in the flames of a sacred fire, performing tapas. The fire does not burn. "I have sat here for a hundred years," the pilgrim says. "Will you sit with me and share the warmth of discipline?"',
    choices: [
      {
        text: 'Sit in the fire',
        preview: 'Gain cultivation base and prana',
        reward: { cultivationBase: 15, prana: 60, xp: 100 },
        flags: { 'enc_tapasPilgrim': 'sat' }
      },
      {
        text: 'Offer water',
        preview: 'Gain karma and gold',
        reward: { karma: 3, gold: 40, xp: 60 },
        flags: { 'enc_tapasPilgrim': 'water' }
      }
    ]
  },

  nagaElder: {
    id: 'nagaElder',
    name: 'Naga Elder\'s Gratitude',
    icon: '\uD83D\uDC0D',
    pool: 'zone',
    zones: ['patala', 'dandaka'],
    weight: 6,
    lvlMin: 10, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: { 'enc_nagaBargain': 'share' },
    prompt: 'An ancient naga elder emerges from the deep waters. "I heard of your generosity at the ford. My族 remembers kindness. Pray for mercy, and I shall grant you a treasure from the deep."',
    choices: [
      {
        text: 'Pray for mercy',
        preview: 'Gain a rare item and karma',
        reward: { karma: 5, xp: 200, item: 'naga_scale' },
        flags: { 'enc_nagaElder': 'mercy' }
      },
      {
        text: 'Ask for strength',
        preview: 'Gain strength and experience',
        reward: { str: 2, xp: 150 },
        flags: { 'enc_nagaElder': 'strength' }
      }
    ]
  }
};

// --- Pool / prerequisite helpers ---

/**
 * Check whether an encounter is available given context.
 * @param {object} enc  — ENCOUNTERS entry
 * @param {object} ctx  — { zoneId, level, karma }
 * @returns {boolean}
 */
function encounterAvailable(enc, ctx) {
  if (!enc || !ctx) return false;
  const flags = (G.state && G.state.flags) || {};
  const seen = (G.state.encounters && G.state.encounters.seen) || {};

  // Already seen — never re-trigger
  if (seen[enc.id]) return false;

  // Pool match
  if (enc.pool === 'zone') {
    if (!enc.zones.includes(ctx.zoneId)) return false;
  }
  // Travel encounters are NOT eligible in zoneExploration — only via rollTravel

  // Level bounds
  if (ctx.level < enc.lvlMin || ctx.level > enc.lvlMax) return false;

  // Karma bounds
  if (enc.karmaMin != null && ctx.karma < enc.karmaMin) return false;
  if (enc.karmaMax != null && ctx.karma > enc.karmaMax) return false;

  // Flag prerequisites
  if (enc.flagsReq && Object.keys(enc.flagsReq).length > 0) {
    for (const [k, v] of Object.entries(enc.flagsReq)) {
      if (v === true) {
        if (!flags[k]) return false;
      } else {
        if (flags[k] !== v) return false;
      }
    }
  }

  return true;
}

/**
 * Return eligible unseen zone encounters for a given zone.
 * @param {string} zoneId
 * @returns {Array} filtered ENCOUNTERS entries
 */
function getZoneEncounters(zoneId) {
  if (!G.state) return [];
  const level = maxPartyLevel();
  const karma = G.state.karma || 0;
  return Object.values(ENCOUNTERS).filter(enc =>
    enc.pool === 'zone' && encounterAvailable(enc, { zoneId, level, karma })
  );
}

/**
 * Return eligible unseen travel encounters for a lane (fromZone → toZone).
 * An encounter is eligible if either fromZone or toZone is in its zones list.
 * @param {string} fromZone
 * @param {string} toZone
 * @returns {Array}
 */
function getTravelEncounters(fromZone, toZone) {
  if (!G.state) return [];
  const level = maxPartyLevel();
  const karma = G.state.karma || 0;
  return Object.values(ENCOUNTERS).filter(enc => {
    if (enc.pool !== 'travel') return false;
    if (!enc.zones.includes(fromZone) && !enc.zones.includes(toZone)) return false;
    return encounterAvailable(enc, { zoneId: fromZone, level, karma });
  });
}

/**
 * Weight-based random pick from a list. Returns one entry or null.
 * @param {Array} list
 * @returns {object|null}
 */
function pickWeighted(list) {
  if (!list || list.length === 0) return null;
  let total = 0;
  for (const e of list) total += (e.weight || 1);
  let roll = Math.random() * total;
  for (const e of list) {
    roll -= (e.weight || 1);
    if (roll <= 0) return e;
  }
  return list[list.length - 1];
}

/** Helper: highest level across all party heroes. */
function maxPartyLevel() {
  const party = G.state.party || [];
  let max = 1;
  for (const h of party) {
    if (h && h.level > max) max = h.level;
  }
  return max;
}
