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
