// Stat gloss system: first-time players see a 1-line gloss under each stat
// abbreviation in character creation. Once seen, the gloss is suppressed.

const GLOSS_MAP = {
  STR: 'Strength — melee attack power',
  AGI: 'Agility — faster turns, more dodge',
  MAG: 'Magic — spell power and max MP',
  DEF: 'Defense — reduces incoming damage',
  HP:  'Health — total hit points',
  MP:  'Mana — fuel for skills',
  CRT: 'Critical — chance of double damage'
};

const GlossSystem = {
  gloss: function(label) {
    return GLOSS_MAP[label] || null;
  },
  shouldShow: function(label) {
    return GLOSS_MAP[label] && !(G.state.glossSeen && G.state.glossSeen[label]);
  },
  markAllSeen: function() {
    G.state.glossSeen = G.state.glossSeen || {};
    for (const k of Object.keys(GLOSS_MAP)) G.state.glossSeen[k] = true;
  },
  markLabelsSeen: function(labels) {
    G.state.glossSeen = G.state.glossSeen || {};
    for (const k of labels) if (GLOSS_MAP[k]) G.state.glossSeen[k] = true;
  }
};
