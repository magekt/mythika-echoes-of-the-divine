const ALCHEMY_RECIPES = {
  xpPill: {
    id: 'xpPill', name: 'XP Pill',
    desc: '+500 Cultivation Base',
    ingredients: { tulsi: 3 },
    effect: { cultivationBase: 500 },
    reqAshram: 1
  },
  breakthroughPill: {
    id: 'breakthroughPill', name: 'Breakthrough Pill',
    desc: '+15% Tribulation success chance',
    ingredients: { ashwa: 5, brahmi: 3 },
    effect: { tribulationBonus: 15 },
    reqAshram: 2
  },
  strengthPill: {
    id: 'strengthPill', name: 'Strength Pill',
    desc: '+1 STR permanently',
    ingredients: { tulsi: 10, ashwa: 5 },
    effect: { str: 1 },
    reqAshram: 3
  },
  wisdomPill: {
    id: 'wisdomPill', name: 'Wisdom Pill',
    desc: '+1 MAG permanently',
    ingredients: { brahmi: 10, tulsi: 5 },
    effect: { mag: 1 },
    reqAshram: 3
  },
  vitalityPill: {
    id: 'vitalityPill', name: 'Vitality Pill',
    desc: '+10 Max HP permanently',
    ingredients: { ashwa: 10, brahmi: 5 },
    effect: { hp: 10 },
    reqAshram: 3
  },
  pranaElixir: {
    id: 'pranaElixir', name: 'Prana Elixir',
    desc: '+200 Prana',
    ingredients: { tulsi: 5, brahmi: 5 },
    effect: { prana: 200 },
    reqAshram: 1
  },
  divineAmrita: {
    id: 'divineAmrita', name: 'Divine Amrita',
    desc: '+5 DF (Divine Fragments)',
    ingredients: { tulsi: 10, brahmi: 10, ashwa: 10 },
    effect: { divineFragments: 5 },
    reqAshram: 4
  },
  ascensionPill: {
    id: 'ascensionPill', name: 'Ascension Pill',
    desc: '+50 Max HP permanently',
    ingredients: { ashwa: 15, brahmi: 10, tulsi: 10 },
    effect: { hp: 50 },
    reqAshram: 5
  },
  elixirOfImmortality: {
    id: 'elixirOfImmortality', name: 'Elixir of Immortality',
    desc: '+100 Max HP, +5 all stats permanently',
    ingredients: { tulsi: 20, brahmi: 20, ashwa: 20 },
    effect: { hp: 100, str: 5, mag: 5, cultivationBase: 2000 },
    reqAshram: 6
  },
  pranaCrystal: {
    id: 'pranaCrystal', name: 'Prana Crystal',
    desc: '+1000 Prana instantly',
    ingredients: { tulsi: 8, brahmi: 8 },
    effect: { prana: 1000 },
    reqAshram: 4
  },
  wisdomElixir: {
    id: 'wisdomElixir', name: 'Wisdom Elixir',
    desc: '+2 MAG permanently, +500 Cultivation Base',
    ingredients: { brahmi: 15, tulsi: 8, ashwa: 5 },
    effect: { mag: 2, cultivationBase: 500 },
    reqAshram: 4
  },
  fortitudePill: {
    id: 'fortitudePill', name: 'Fortitude Pill',
    desc: '+2 STR permanently, +500 Cultivation Base',
    ingredients: { ashwa: 15, tulsi: 8, brahmi: 5 },
    effect: { str: 2, cultivationBase: 500 },
    reqAshram: 4
  },
  divineGrace: {
    id: 'divineGrace', name: 'Divine Grace',
    desc: '+30% Tribulation success chance, +1000 Cultivation Base',
    ingredients: { tulsi: 25, brahmi: 25, ashwa: 25 },
    effect: { tribulationBonus: 30, cultivationBase: 1000 },
    reqAshram: 7
  }
};

const HERB_GROWTH = {
  tulsi:  { name: 'Tulsi',   growTime: 60,  buyCost: 5,  sellPrice: 2 },
  brahmi: { name: 'Brahmi',  growTime: 120, buyCost: 10, sellPrice: 4 },
  ashwa:  { name: 'Ashwa',   growTime: 180, buyCost: 15, sellPrice: 6 }
};
