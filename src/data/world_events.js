// World Event data — static templates for periodic time-bound events across eligible zones.
// Each template defines a zone, duration, cooldown, rewards, and presentation for the map layer.

const WORLD_EVENTS = [
  /* ---- Aryavarta Grasslands ---- */
  {
    id: 'rakshasa_raid',
    zoneId: 'aryavarta',
    label: 'Rakshasa Raid',
    desc: 'A warband of rakshasa raids the golden plains, burning sacred groves in their wake.',
    icon: '\u2694\uFE0F',
    markerColor: '#B22222',
    duration: 3600,
    cooldown: 7200,
    resolveReward: { gold: 35, karma: 1, divineFragments: 0 },
    expiryLabel: 'Raid subsided',
    resolveLabel: 'Raiders repelled'
  },
  {
    id: 'marut_storm',
    zoneId: 'aryavarta',
    label: 'Marut Tempest',
    desc: 'A sudden storm summoned by maruts tears across the grasslands, scattering herds and livestock.',
    icon: '\uD83C\uDF2A\uFE0F',
    markerColor: '#7B68EE',
    duration: 2700,
    cooldown: 10800,
    resolveReward: { gold: 25, karma: 2, divineFragments: 0 },
    expiryLabel: 'Storm passes',
    resolveLabel: 'Storm harnessed'
  },

  /* ---- Dandaka Forest ---- */
  {
    id: 'naga_migration',
    zoneId: 'dandaka',
    label: 'Naga Migration',
    desc: 'River serpents surge through the Dandaka fords, flooding paths and revealing hidden depths.',
    icon: '\uD83D\uDC0D',
    markerColor: '#4A6FA5',
    duration: 5400,
    cooldown: 9000,
    resolveReward: { gold: 45, karma: 2, divineFragments: 0 },
    expiryLabel: 'Serpents submerge',
    resolveLabel: 'Passage secured'
  },
  {
    id: 'shadow_bloom',
    zoneId: 'dandaka',
    label: 'Shadow Bloom',
    desc: 'Witchlights bloom beneath the dark canopy, drawing forest spirits to the faint light.',
    icon: '\uD83C\uDF38',
    markerColor: '#8A2BE2',
    duration: 7200,
    cooldown: 14400,
    resolveReward: { gold: 30, karma: 3, divineFragments: 1 },
    expiryLabel: 'Blooms wither',
    resolveLabel: 'Light gathered'
  },

  /* ---- Mount Meru ---- */
  {
    id: 'elemental_surge',
    zoneId: 'meru',
    label: 'Elemental Surge',
    desc: 'Ice and fire elementals clash on the cosmic peak, reshaping the rocky terrain.',
    icon: '\u2744\uFE0F',
    markerColor: '#00CED1',
    duration: 3600,
    cooldown: 7200,
    resolveReward: { gold: 60, karma: 2, divineFragments: 1 },
    expiryLabel: 'Elements calm',
    resolveLabel: 'Surges quelled'
  },
  {
    id: 'dragon_wake',
    zoneId: 'meru',
    label: 'Dragon\u2019s Wake',
    desc: 'The emerald dragon stirs from its mountain lair, hunting across the snowfields.',
    icon: '\uD83D\uDC09',
    markerColor: '#228B22',
    duration: 6300,
    cooldown: 12600,
    resolveReward: { gold: 75, karma: 3, divineFragments: 0 },
    expiryLabel: 'Wyrm settles',
    resolveLabel: 'Dragon appeased'
  },

  /* ---- Patala ---- */
  {
    id: 'asura_incursion',
    zoneId: 'patala',
    label: 'Asura Incursion',
    desc: 'Asura warbands crawl from the underworld, threatening the boundary between realms.',
    icon: '\uD83D\uDC79',
    markerColor: '#8B0000',
    duration: 4500,
    cooldown: 9000,
    resolveReward: { gold: 55, karma: 2, divineFragments: 1 },
    expiryLabel: 'Incursion recedes',
    resolveLabel: 'Intrusion sealed'
  },
  {
    id: 'river_of_memory',
    zoneId: 'patala',
    label: 'River of Memory',
    desc: 'The soul-river overflows its banks, releasing fragments of forgotten memories.',
    icon: '\uD83C\uDF0A',
    markerColor: '#4169E1',
    duration: 7200,
    cooldown: 14400,
    resolveReward: { gold: 40, karma: 4, divineFragments: 2 },
    expiryLabel: 'Waters recede',
    resolveLabel: 'Memories reclaimed'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WORLD_EVENTS };
}
