const ZONES = {
  aryavarta: {
    id: 'aryavarta', name: 'Aryavarta Grasslands',
    desc: 'Golden plains and sacred groves. The journey begins here.',
    reqLevel: 1, reqZone: null,
    minLvl: 1, maxLvl: 9,
    realm: 'manushya',
    enemies: ['bandit', 'wolf', 'giantSpider', 'rakshasa', 'wildBoar', 'snake'],
    boss: { id: 'rakshasa', name: 'Rakshasa Chieftain', level: 8, hpMul: 3 },
    explorationMax: 100,
    bgColor: '#0a1a20'
  },
  dandaka: {
    id: 'dandaka', name: 'Dandaka Forest',
    desc: 'A dark enchanted forest where shadows whisper.',
    reqLevel: 5, reqZone: 'aryavarta',
    minLvl: 5, maxLvl: 14,
    realm: 'sadhaka',
    enemies: ['wraith', 'darkElf', 'giantSpider', 'naga', 'shadowMage', 'treant'],
    boss: { id: 'darkElf', name: 'Dark Elf Prince', level: 18, hpMul: 4 },
    explorationMax: 100,
    bgColor: '#0a0a1a'
  },
  meru: {
    id: 'meru', name: 'Mount Meru',
    desc: 'The cosmic peak where elemental trials await.',
    reqLevel: 12, reqZone: 'dandaka',
    minLvl: 12, maxLvl: 21,
    realm: 'yogi',
    enemies: ['asuraWarrior', 'orc', 'ogre', 'iceElemental', 'fireElemental', 'dragonEmerald'],
    boss: { id: 'dragonEmerald', name: 'Emerald Dragon', level: 25, hpMul: 5 },
    explorationMax: 100,
    bgColor: '#1a1a3a'
  },
  patala: {
    id: 'patala', name: 'Patala (Underworld)',
    desc: 'The underworld of serpents and forgotten souls.',
    reqLevel: 20, reqZone: 'meru',
    minLvl: 20, maxLvl: 29,
    realm: 'siddha',
    enemies: ['asura', 'naga', 'rakshasa', 'kaliya', 'hellHound', 'succubus'],
    boss: { id: 'kaliya', name: 'Kaliya, the Serpent King', level: 35, hpMul: 5 },
    explorationMax: 100,
    bgColor: '#1a0510'
  },
  svarga: {
    id: 'svarga', name: 'Svarga (Celestial)',
    desc: 'The celestial realm of the devas.',
    reqLevel: 25, reqZone: 'patala',
    minLvl: 25, maxLvl: 40,
    realm: 'mukta',
    enemies: ['celestialGuardian', 'fallenDeva', 'darkApsara', 'indra', 'seraphim', 'vishnuDuta'],
    boss: { id: 'indra', name: 'Indra, the Storm Lord', level: 45, hpMul: 5 },
    explorationMax: 100,
    bgColor: '#1a2040'
  },
  tapobhumi: {
    id: 'tapobhumi', name: 'Tapobhumi (Austerity)',
    desc: 'The burning ground beyond Svarga, where ascendants are forged anew.',
    reqLevel: 50, reqZone: 'svarga',
    minLvl: 41, maxLvl: 60,
    realm: 'mukta',
    enemies: ['tapasvi', 'rudra', 'brahmarishi', 'mahadeva', 'seraphim', 'pralaya'],
    boss: { id: 'pralaya', name: 'Pralaya, the Dissolver', level: 58, hpMul: 6 },
    explorationMax: 100,
    bgColor: '#2a1030'
  }
};

function getZoneTier(zoneId) {
  const zone = ZONES[zoneId];
  const reqLevel = zone.reqLevel || 1;
  if (reqLevel >= 50) return 3.2;
  if (reqLevel >= 40) return 2.7;
  if (reqLevel >= 30) return 2.2;
  if (reqLevel >= 20) return 1.7;
  if (reqLevel >= 10) return 1.3;
  return 1.0;
}

function getZoneEnemy(zoneId, playerLevel) {
  const zone = ZONES[zoneId];
  const pool = zone.enemies;
  const e = pool[Math.floor(Math.random() * pool.length)];
  const minLvl = Math.max(zone.minLvl, Math.floor(playerLevel * 0.8));
  const lvl = Math.min(minLvl + Math.floor(Math.random() * 3), zone.maxLvl);
  return createEnemyState(e, lvl, getZoneTier(zoneId));
}

function getZoneBoss(zoneId) {
  const zone = ZONES[zoneId];
  const b = zone.boss;
  const e = createEnemyState(b.id, b.level, getZoneTier(zoneId));
  e.maxHp *= b.hpMul;
  e.hp = e.maxHp;
  e.name = b.name;
  e.isBoss = true;
  e.xp *= 3;
  e.gold *= 5;
  return e;
}
