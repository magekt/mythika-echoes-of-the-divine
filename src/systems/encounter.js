// EncounterSystem — encounter lifecycle, reward routing, flag/ledger management.
// EncounterTrigger — pure-roll pickers for zone and travel encounters.
// All rewards route through canonical APIs (Economy, Progression, CultivationSystem, QuestSystem, AchievementSystem).

const EncounterSystem = {};

const EncounterTrigger = {
  NARRATIVE_CHANCE: 0.3   // default probability; overridden in UAT tests
};

// --- EncounterSystem.init ---

EncounterSystem.init = function() {
  if (!G.state.encounters || typeof G.state.encounters !== 'object' || Array.isArray(G.state.encounters)) {
    G.state.encounters = {};
  }
  if (!G.state.encounters.seen || typeof G.state.encounters.seen !== 'object' || Array.isArray(G.state.encounters.seen)) {
    G.state.encounters.seen = {};
  }
};

// --- EncounterSystem.start ---

/**
 * Start an encounter: validate it exists and hasn't been seen.
 * @param {string} id
 * @returns {object|null} encounter object or null if unknown/already seen
 */
EncounterSystem.start = function(id) {
  this.init();
  if (!id || !ENCOUNTERS || !ENCOUNTERS[id]) return null;
  if (this.isSeen(id)) return null;
  return ENCOUNTERS[id];
};

// --- EncounterSystem.isSeen ---

EncounterSystem.isSeen = function(id) {
  this.init();
  return !!G.state.encounters.seen[id];
};

// --- EncounterSystem.getMarker ---

/**
 * Get the story marker for a given encounter id.
 * @param {string} id
 * @returns {string|undefined} the marker value from G.state.flags
 */
EncounterSystem.getMarker = function(id) {
  if (!id) return undefined;
  return (G.state.flags || {})['enc_' + id];
};

// --- EncounterSystem.getChoices ---

/**
 * Return choices filtered by choice-level flagsReq.
 * @param {string} id
 * @returns {Array} filtered choices, or [] if unknown
 */
EncounterSystem.getChoices = function(id) {
  const enc = ENCOUNTERS && ENCOUNTERS[id];
  if (!enc || !enc.choices) return [];
  const flags = (G.state && G.state.flags) || {};
  return enc.choices.filter(choice => {
    if (!choice.flagsReq || Object.keys(choice.flagsReq).length === 0) return true;
    for (const [k, v] of Object.entries(choice.flagsReq)) {
      if (v === true) {
        if (!flags[k]) return false;
      } else {
        if (flags[k] !== v) return false;
      }
    }
    return true;
  });
};

// --- EncounterSystem.choose ---

/**
 * Apply a choice's rewards via canonical APIs, write flags and ledger.
 * @param {string} id — encounter id
 * @param {number} choiceIdx — index into the FULL choices array (before filtering)
 * @returns {object|false} result object or false if invalid
 */
EncounterSystem.choose = function(id, choiceIdx) {
  this.init();
  const enc = ENCOUNTERS && ENCOUNTERS[id];
  if (!enc || !enc.choices) return false;
  if (this.isSeen(id)) return false;

  const choice = enc.choices[choiceIdx];
  if (!choice) return false;

  // Defense-in-depth: if the choice has flagsReq, verify it's visible
  if (choice.flagsReq && Object.keys(choice.flagsReq).length > 0) {
    const flags = (G.state && G.state.flags) || {};
    for (const [k, v] of Object.entries(choice.flagsReq)) {
      if (v === true) {
        if (!flags[k]) return false;
      } else {
        if (flags[k] !== v) return false;
      }
    }
  }

  // --- Canonical reward routing (matches journey.js lines 84-101) ---
  const r = choice.reward || {};
  const granted = [];

  if (r.gold) { Economy.addGold(r.gold); granted.push({ type: 'gold', amount: r.gold }); }
  if (r.karma) { Economy.addKarma(r.karma); granted.push({ type: 'karma', amount: r.karma }); }
  if (r.xp) { Progression.addPartyXP(r.xp); granted.push({ type: 'xp', amount: r.xp }); }
  if (r.prana) { CultivationSystem.addPrana(r.prana); granted.push({ type: 'prana', amount: r.prana }); }
  if (r.cultivationBase) { CultivationSystem.addCultivationBase(r.cultivationBase); granted.push({ type: 'cultivationBase', amount: r.cultivationBase }); }
  if (r.divineFragments) { Economy.addDivineFragments(r.divineFragments); granted.push({ type: 'divineFragments', amount: r.divineFragments }); }
  if (r.hp) {
    for (const h of (G.state.party || [])) { h.maxHp += r.hp; h.hp += r.hp; }
    granted.push({ type: 'hp', amount: r.hp });
  }
  if (r.str) { for (const h of (G.state.party || [])) h.str += r.str; granted.push({ type: 'str', amount: r.str }); }
  if (r.agi) { for (const h of (G.state.party || [])) h.agi += r.agi; granted.push({ type: 'agi', amount: r.agi }); }
  if (r.mag) { for (const h of (G.state.party || [])) h.mag += r.mag; granted.push({ type: 'mag', amount: r.mag }); }
  if (r.def) { for (const h of (G.state.party || [])) h.def += r.def; granted.push({ type: 'def', amount: r.def }); }

  // Item rewards
  if (r.items && Array.isArray(r.items)) {
    for (const item of r.items) {
      Economy.addItem(item);
      granted.push({ type: 'item', name: item.name, qty: item.qty });
    }
  }

  // Post-reward karma delta (separate from reward.karma)
  if (choice.karma) {
    Economy.addKarma(choice.karma);
    granted.push({ type: 'karmaBonus', amount: choice.karma });
  }

  // --- Write flags (story markers) ---
  if (choice.flags) {
    for (const [k, v] of Object.entries(choice.flags)) {
      G.state.flags[k] = v;
    }
  }

  // --- Mark seen in ledger ---
  const marker = choice.flags ? Object.values(choice.flags)[0] : choiceIdx;
  G.state.encounters.seen[id] = marker;

  // --- Achievement check ---
  if (typeof AchievementSystem !== 'undefined' && AchievementSystem.check) {
    AchievementSystem.check();
  }

  return {
    id: id,
    choiceIdx: choiceIdx,
    text: choice.text,
    granted: granted,
    marker: marker
  };
};

// --- EncounterSystem.setFlag ---

/**
 * Write a flag directly to G.state.flags.
 * @param {string} key
 * @param {*} value
 */
EncounterSystem.setFlag = function(key, value) {
  if (!G.state.flags) G.state.flags = {};
  G.state.flags[key] = value;
};

// --- EncounterTrigger.rollZone ---

/**
 * Pure-read: roll for a narrative encounter during zone exploration.
 * @param {string} zoneId
 * @returns {string|null} encounter id or null
 */
EncounterTrigger.rollZone = function(zoneId) {
  if (typeof ENCOUNTERS === 'undefined') return null;
  if (Math.random() > this.NARRATIVE_CHANCE) return null;
  const eligible = getZoneEncounters(zoneId);
  const picked = pickWeighted(eligible);
  return picked ? picked.id : null;
};

// --- EncounterTrigger.rollTravel ---

/**
 * Pure-read: roll for a narrative encounter during travel.
 * @param {string} fromZone
 * @param {string} toZone
 * @returns {string|null} encounter id or null
 */
EncounterTrigger.rollTravel = function(fromZone, toZone) {
  if (typeof ENCOUNTERS === 'undefined') return null;
  if (Math.random() > this.NARRATIVE_CHANCE) return null;
  const eligible = getTravelEncounters(fromZone, toZone);
  const picked = pickWeighted(eligible);
  return picked ? picked.id : null;
};
