const REALMS = [
  { id: 'manushya',     name: 'Manushya',     stages: 3,  maxLvl: 9,  baseCp: 0 },
  { id: 'sadhaka',      name: 'Sadhaka',      stages: 4,  maxLvl: 19, baseCp: 100 },
  { id: 'yogi',         name: 'Yogi',         stages: 4,  maxLvl: 29, baseCp: 500 },
  { id: 'siddha',       name: 'Siddha',       stages: 4,  maxLvl: 39, baseCp: 1500 },
  { id: 'mukta',        name: 'Mukta',        stages: 4,  maxLvl: 50, baseCp: 5000 },
  { id: 'paramukta',    name: 'Paramukta',    stages: 4,  maxLvl: 60, baseCp: 15000 }
];

const CULTIVATION_RATES = {
  basePerSec: 0.5,
  ashramBonus: 0.05,
  offlineCap: 28800
};

function getRealmIndex(id) {
  return REALMS.findIndex(r => r.id === id);
}

function getRealmByLevel(lvl) {
  for (let i = REALMS.length - 1; i >= 0; i--) {
    if (lvl <= REALMS[i].maxLvl) return REALMS[i];
  }
  return REALMS[0];
}

function getCultivationPerSecond(ashramLvl) {
  return CULTIVATION_RATES.basePerSec + (ashramLvl - 1) * CULTIVATION_RATES.ashramBonus;
}

function getCultivationForLevel(lvl) {
  return lvl * lvl * 10 + 50;
}

function getPranaPerSecond(ashramLvl) {
  let base = 1 + (ashramLvl - 1) * 0.5;
  if (G.state.enlightenmentBuff) {
    base *= G.state.enlightenmentBuff;
  }
  return base;
}
