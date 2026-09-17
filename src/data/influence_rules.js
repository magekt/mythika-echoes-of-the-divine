// Regional influence rules. Gameplay systems report completed actions to the
// Influence API; this table is the only place where those actions acquire a
// regional effect or control thresholds.
const CONTROL_THRESHOLDS = Object.freeze({
  50: 'contested',
  80: 'player'
});

function influenceRule(zoneId, delta) {
  return Object.freeze({
    zoneId: zoneId,
    delta: delta,
    thresholds: CONTROL_THRESHOLDS
  });
}

const INFLUENCE_RULES = {
  zone_complete: {
    aryavarta: influenceRule('aryavarta', 20),
    dandaka: influenceRule('dandaka', 20),
    meru: influenceRule('meru', 25),
    patala: influenceRule('patala', 25),
    svarga: influenceRule('svarga', 30),
    tapobhumi: influenceRule('tapobhumi', 30)
  },

  boss_defeat: {
    aryavarta: influenceRule('aryavarta', 15),
    dandaka: influenceRule('dandaka', 15),
    meru: influenceRule('meru', 20),
    patala: influenceRule('patala', 20),
    svarga: influenceRule('svarga', 25),
    tapobhumi: influenceRule('tapobhumi', 25)
  },

  encounter_choice: {
    nagaBargain_share: influenceRule('dandaka', 10),
    nagaBargain_force: influenceRule('dandaka', -5),
    nagaBargain_0: influenceRule('dandaka', 10),
    nagaBargain_1: influenceRule('dandaka', -5),
    marutCrossing_ride: influenceRule('aryavarta', 5),
    marutCrossing_walk: influenceRule('aryavarta', 10),
    marutCrossing_0: influenceRule('aryavarta', 5),
    marutCrossing_1: influenceRule('aryavarta', 10),
    vasukiTribute_offer: influenceRule('patala', 15),
    vasukiTribute_refuse: influenceRule('patala', -10),
    vasukiTribute_0: influenceRule('patala', 15),
    vasukiTribute_1: influenceRule('patala', -10)
  },

  journey_complete: {
    arjunaResolve: influenceRule('aryavarta', 10),
    karnaburden: influenceRule('aryavarta', 10),
    covenantKshatriya: influenceRule('dandaka', 12),
    covenantRishi: influenceRule('meru', 12),
    beastWolfPact: influenceRule('dandaka', 10),
    paramuktaPilgrimage: influenceRule('tapobhumi', 20),
    karmicCrossroads: influenceRule('svarga', 15)
  }
};

INFLUENCE_RULES.getRule = function(actionType, actionId) {
  if (typeof actionType !== 'string' || typeof actionId !== 'string') return null;
  if (!Object.prototype.hasOwnProperty.call(this, actionType)) return null;

  const actions = this[actionType];
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, actionId)) return null;
  return actions[actionId];
};

if (typeof window !== 'undefined') {
  window.INFLUENCE_RULES = INFLUENCE_RULES;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INFLUENCE_RULES };
}
