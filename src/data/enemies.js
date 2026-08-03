const ENEMIES = {
  bandit:      { name: 'Bandit',          hp: 30,  str: 8,  agi: 5,  mag: 2,  def: 4,  ailment: 'none',    xp: 30,  gold: 5,  minLvl: 1 },
  wolf:        { name: 'Wolf',            hp: 25,  str: 9,  agi: 7,  mag: 1,  def: 4,  ailment: 'none',    xp: 40,  gold: 3,  minLvl: 2 },
  giantSpider: { name: 'Giant Spider',    hp: 40,  str: 10, agi: 6,  mag: 4,  def: 5,  ailment: 'visha',   xp: 50,  gold: 6,  minLvl: 4 },
  rakshasa:    { name: 'Rakshasa',        hp: 55,  str: 12, agi: 8,  mag: 7,  def: 7,  ailment: 'none',    xp: 80,  gold: 10, minLvl: 6 },
  wildBoar:    { name: 'Wild Boar',       hp: 50,  str: 11, agi: 4,  mag: 1,  def: 6,  ailment: 'none',    xp: 36,  gold: 4,  minLvl: 2 },
  snake:       { name: 'Cobra',           hp: 22,  str: 6,  agi: 8,  mag: 3,  def: 3,  ailment: 'visha',   xp: 44,  gold: 4,  minLvl: 3 },
  wraith:      { name: 'Wraith',          hp: 45,  str: 6,  agi: 9,  mag: 12, def: 5,  ailment: 'shila',   xp: 35,  gold: 8,  minLvl: 5 },
  darkElf:     { name: 'Dark Elf',        hp: 65,  str: 11, agi: 14, mag: 10, def: 6,  ailment: 'visha',   xp: 50,  gold: 12, minLvl: 8 },
  shadowMage:  { name: 'Shadow Mage',     hp: 48,  str: 5,  agi: 10, mag: 14, def: 4,  ailment: 'shila',   xp: 42,  gold: 10, minLvl: 7 },
  treant:      { name: 'Treant',          hp: 90,  str: 14, agi: 3,  mag: 8,  def: 12, ailment: 'none',    xp: 48,  gold: 12, minLvl: 9 },
  asuraWarrior:{ name: 'Asura Warrior',   hp: 85,  str: 17, agi: 9,  mag: 7,  def: 12, ailment: 'none',    xp: 60,  gold: 15, minLvl: 10 },
  orc:         { name: 'Orc',             hp: 70,  str: 15, agi: 5,  mag: 4,  def: 10, ailment: 'none',    xp: 45,  gold: 10, minLvl: 9 },
  ogre:        { name: 'Ogre',            hp: 100, str: 19, agi: 4,  mag: 3,  def: 14, ailment: 'none',    xp: 70,  gold: 18, minLvl: 12 },
  iceElemental:{ name: 'Ice Elemental',   hp: 65,  str: 8,  agi: 6,  mag: 16, def: 10, ailment: 'shila',   xp: 55,  gold: 14, minLvl: 14 },
  fireElemental:{name:'Fire Elemental',   hp: 60,  str: 12, agi: 8,  mag: 18, def: 8,  ailment: 'agni',    xp: 58,  gold: 16, minLvl: 15 },
  naga:        { name: 'Naga',            hp: 75,  str: 12, agi: 12, mag: 10, def: 8,  ailment: 'visha',   xp: 55,  gold: 14, minLvl: 11 },
  dragonEmerald:{name:'Emerald Dragon',   hp: 250, str: 24, agi: 12, mag: 20, def: 18, ailment: 'vayu',    xp: 200, gold: 50, minLvl: 20 },
  asura:       { name: 'Asura Lord',      hp: 140, str: 22, agi: 10, mag: 14, def: 16, ailment: 'agni',    xp: 120, gold: 30, minLvl: 22 },
  hellHound:   { name: 'Hell Hound',      hp: 100, str: 20, agi: 16, mag: 6,  def: 10, ailment: 'agni',    xp: 100, gold: 25, minLvl: 24 },
  succubus:    { name: 'Succubus',        hp: 85,  str: 10, agi: 18, mag: 20, def: 8,  ailment: 'vayu',    xp: 110, gold: 28, minLvl: 26 },
  kaliya:      { name: 'Kaliya',          hp: 400, str: 28, agi: 14, mag: 22, def: 20, ailment: 'visha',   xp: 350, gold: 80, minLvl: 28 },
  celestialGuardian:{name:'Celestial Guardian',hp:180,str:26,agi:16,mag:18,def:20, ailment:'vajra',  xp: 200, gold: 40, minLvl: 30 },
  fallenDeva:  { name: 'Fallen Deva',     hp: 160, str: 20, agi: 20, mag: 24, def: 16, ailment: 'shila',   xp: 220, gold: 45, minLvl: 32 },
  darkApsara:  { name: 'Dark Apsara',     hp: 120, str: 14, agi: 26, mag: 20, def: 12, ailment: 'vayu',    xp: 180, gold: 35, minLvl: 30 },
  seraphim:    { name: 'Seraphim',        hp: 150, str: 18, agi: 22, mag: 26, def: 18, ailment: 'vajra',   xp: 240, gold: 50, minLvl: 35 },
  vishnuDuta:  { name: 'Vishnu Duta',     hp: 200, str: 24, agi: 14, mag: 22, def: 22, ailment: 'none',    xp: 260, gold: 55, minLvl: 36 },
  indra:       { name: 'Indra',           hp: 300, str: 30, agi: 20, mag: 28, def: 24, ailment: 'vajra',   xp: 300, gold: 60, minLvl: 38 }
};

const ZONE_ENEMIES = {
  aryavarta:  ['bandit', 'wolf', 'giantSpider', 'rakshasa', 'wildBoar', 'snake'],
  dandaka:    ['wraith', 'darkElf', 'giantSpider', 'naga', 'shadowMage', 'treant'],
  meru:       ['asuraWarrior', 'orc', 'ogre', 'dragonEmerald', 'iceElemental', 'fireElemental'],
  patala:     ['asura', 'naga', 'rakshasa', 'kaliya', 'hellHound', 'succubus'],
  svarga:     ['celestialGuardian', 'fallenDeva', 'darkApsara', 'indra', 'seraphim', 'vishnuDuta']
};

function createEnemyState(id, level, zoneTier) {
  const e = ENEMIES[id];
  const zoneMult = zoneTier || 1;
  const scale = (1 + (level - e.minLvl) * 0.18) * zoneMult;
  return {
    id: id, name: e.name,
    hp: Math.floor(e.hp * scale),
    maxHp: Math.floor(e.hp * scale),
    mp: Math.floor((e.mag || 1) * scale * 0.4),
    maxMp: Math.floor((e.mag || 1) * scale * 0.4),
    str: Math.floor(e.str * scale),
    agi: Math.floor(e.agi * scale),
    mag: Math.floor(e.mag * scale),
    def: Math.floor(e.def * scale),
    level: level,
    ailments: {},
    ailment: e.ailment,
    xp: Math.floor(e.xp * scale),
    gold: Math.floor(e.gold * scale)
  };
}
