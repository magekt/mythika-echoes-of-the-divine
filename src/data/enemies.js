const ENEMY_ABILITIES = {
  bite: { name: 'Bite', dmg: 1.2, ailment: null, desc: 'Sharp fangs tear flesh' },
  poisonBite: { name: 'Poison Bite', dmg: 1.0, ailment: 'visha', desc: 'Venomous fangs inject toxin' },
  howl: { name: 'Howl', dmg: 0, buff: 'atkBuff', value: 1.2, desc: 'Fearsome roar boosts attack' },
  webSpray: { name: 'Web Spray', dmg: 0.8, ailment: 'vajra', desc: 'Sticky webs stun prey' },
  crush: { name: 'Crush', dmg: 1.5, ailment: null, desc: 'Massive force flattens foe' },
  shadowBolt: { name: 'Shadow Bolt', dmg: 1.3, ailment: 'shila', desc: 'Dark magic freezes target' },
  lifeDrain: { name: 'Life Drain', dmg: 1.1, heal: 0.3, desc: 'Steals life force from foe' },
  tailSwipe: { name: 'Tail Swipe', dmg: 1.4, ailment: null, desc: 'Powerful tail sweeps area' },
  frostBreath: { name: 'Frost Breath', dmg: 1.2, ailment: 'shila', desc: 'Icy breath freezes foe' },
  fireBreath: { name: 'Fire Breath', dmg: 1.3, ailment: 'agni', desc: 'Scorching flames ignite foe' },
  thunderStrike: { name: 'Thunder Strike', dmg: 1.5, ailment: 'vajra', desc: 'Lightning smites enemy' },
  venomSpit: { name: 'Venom Spit', dmg: 0.9, ailment: 'visha', desc: 'Toxic spit corrodes flesh' },
  soulSiphon: { name: 'Soul Siphon', dmg: 1.0, ailment: null, heal: 0.4, desc: 'Drains spiritual energy' },
  hellfire: { name: 'Hellfire', dmg: 1.4, ailment: 'agni', desc: 'Infernal flames burn bright' },
  charm: { name: 'Charm', dmg: 0.8, ailment: 'confuse', desc: 'Bewildering gaze confuses foe' },
  divineSmite: { name: 'Divine Smite', dmg: 1.6, ailment: 'vajra', desc: 'Celestial power strikes true' },
  cosmicRays: { name: 'Cosmic Rays', dmg: 1.3, ailment: null, desc: 'Starlight pierces darkness' },
  heavenFall: { name: 'Heaven Fall', dmg: 1.8, ailment: null, desc: 'Sky collapses on foe' }
};

const ENEMIES = {
  bandit:      { name: 'Bandit',          hp: 30,  str: 8,  agi: 5,  mag: 2,  def: 4,  ailment: 'none',    xp: 30,  gold: 5,  minLvl: 1, abilities: ['bite'] },
  wolf:        { name: 'Wolf',            hp: 25,  str: 9,  agi: 7,  mag: 1,  def: 4,  ailment: 'none',    xp: 40,  gold: 3,  minLvl: 2, abilities: ['bite', 'howl'] },
  giantSpider: { name: 'Giant Spider',    hp: 40,  str: 10, agi: 6,  mag: 4,  def: 5,  ailment: 'visha',   xp: 50,  gold: 6,  minLvl: 4, abilities: ['poisonBite', 'webSpray'] },
  rakshasa:    { name: 'Rakshasa',        hp: 55,  str: 12, agi: 8,  mag: 7,  def: 7,  ailment: 'none',    xp: 80,  gold: 10, minLvl: 6, abilities: ['crush', 'lifeDrain'] },
  wildBoar:    { name: 'Wild Boar',       hp: 50,  str: 11, agi: 4,  mag: 1,  def: 6,  ailment: 'none',    xp: 36,  gold: 4,  minLvl: 2, abilities: ['bite', 'crush'] },
  snake:       { name: 'Cobra',           hp: 22,  str: 6,  agi: 8,  mag: 3,  def: 3,  ailment: 'visha',   xp: 44,  gold: 4,  minLvl: 3, abilities: ['poisonBite', 'venomSpit'] },
  wraith:      { name: 'Wraith',          hp: 45,  str: 6,  agi: 9,  mag: 12, def: 5,  ailment: 'shila',   xp: 35,  gold: 8,  minLvl: 5, abilities: ['shadowBolt', 'soulSiphon'] },
  darkElf:     { name: 'Dark Elf',        hp: 65,  str: 11, agi: 14, mag: 10, def: 6,  ailment: 'visha',   xp: 50,  gold: 12, minLvl: 8, abilities: ['poisonBite', 'shadowBolt'] },
  shadowMage:  { name: 'Shadow Mage',     hp: 48,  str: 5,  agi: 10, mag: 14, def: 4,  ailment: 'shila',   xp: 42,  gold: 10, minLvl: 7, abilities: ['shadowBolt', 'lifeDrain'] },
  treant:      { name: 'Treant',          hp: 90,  str: 14, agi: 3,  mag: 8,  def: 12, ailment: 'none',    xp: 48,  gold: 12, minLvl: 9, abilities: ['crush', 'tailSwipe'] },
  asuraWarrior:{ name: 'Asura Warrior',   hp: 85,  str: 17, agi: 9,  mag: 7,  def: 12, ailment: 'none',    xp: 60,  gold: 15, minLvl: 10, abilities: ['crush', 'hellfire'] },
  orc:         { name: 'Orc',             hp: 70,  str: 15, agi: 5,  mag: 4,  def: 10, ailment: 'none',    xp: 45,  gold: 10, minLvl: 9, abilities: ['bite', 'crush'] },
  ogre:        { name: 'Ogre',            hp: 100, str: 19, agi: 4,  mag: 3,  def: 14, ailment: 'none',    xp: 70,  gold: 18, minLvl: 12, abilities: ['crush', 'tailSwipe'] },
  iceElemental:{ name: 'Ice Elemental',   hp: 65,  str: 8,  agi: 6,  mag: 16, def: 10, ailment: 'shila',   xp: 55,  gold: 14, minLvl: 14, abilities: ['frostBreath', 'shadowBolt'] },
  fireElemental:{name:'Fire Elemental',   hp: 60,  str: 12, agi: 8,  mag: 18, def: 8,  ailment: 'agni',    xp: 58,  gold: 16, minLvl: 15, abilities: ['fireBreath', 'hellfire'] },
  naga:        { name: 'Naga',            hp: 75,  str: 12, agi: 12, mag: 10, def: 8,  ailment: 'visha',   xp: 55,  gold: 14, minLvl: 11, abilities: ['poisonBite', 'venomSpit'] },
  dragonEmerald:{name:'Emerald Dragon',   hp: 250, str: 24, agi: 12, mag: 20, def: 18, ailment: 'vayu',    xp: 200, gold: 50, minLvl: 20, abilities: ['fireBreath', 'tailSwipe', 'frostBreath'] },
  asura:       { name: 'Asura Lord',      hp: 140, str: 22, agi: 10, mag: 14, def: 16, ailment: 'agni',    xp: 120, gold: 30, minLvl: 22, abilities: ['hellfire', 'crush', 'lifeDrain'] },
  hellHound:   { name: 'Hell Hound',      hp: 100, str: 20, agi: 16, mag: 6,  def: 10, ailment: 'agni',    xp: 100, gold: 25, minLvl: 24, abilities: ['bite', 'fireBreath'] },
  succubus:    { name: 'Succubus',        hp: 85,  str: 10, agi: 18, mag: 20, def: 8,  ailment: 'vayu',    xp: 110, gold: 28, minLvl: 26, abilities: ['charm', 'soulSiphon'] },
  kaliya:      { name: 'Kaliya',          hp: 400, str: 28, agi: 14, mag: 22, def: 20, ailment: 'visha',   xp: 350, gold: 80, minLvl: 28, abilities: ['poisonBite', 'venomSpit', 'tailSwipe'] },
  celestialGuardian:{name:'Celestial Guardian',hp:180,str:26,agi:16,mag:18,def:20, ailment:'vajra',  xp: 200, gold: 40, minLvl: 30, abilities: ['divineSmite', 'thunderStrike'] },
  fallenDeva:  { name: 'Fallen Deva',     hp: 160, str: 20, agi: 20, mag: 24, def: 16, ailment: 'shila',   xp: 220, gold: 45, minLvl: 32, abilities: ['shadowBolt', 'lifeDrain', 'charm'] },
  darkApsara:  { name: 'Dark Apsara',     hp: 120, str: 14, agi: 26, mag: 20, def: 12, ailment: 'vayu',    xp: 180, gold: 35, minLvl: 30, abilities: ['charm', 'cosmicRays'] },
  seraphim:    { name: 'Seraphim',        hp: 150, str: 18, agi: 22, mag: 26, def: 18, ailment: 'vajra',   xp: 240, gold: 50, minLvl: 35, abilities: ['divineSmite', 'cosmicRays', 'heavenFall'] },
  vishnuDuta:  { name: 'Vishnu Duta',     hp: 200, str: 24, agi: 14, mag: 22, def: 22, ailment: 'none',    xp: 260, gold: 55, minLvl: 36, abilities: ['divineSmite', 'heavenFall'] },
  tapasvi:     { name: 'Ascetic Tapasvi', hp: 180, str: 26, agi: 16, mag: 24, def: 20, ailment: 'agni',   xp: 280, gold: 55, minLvl: 45, abilities: ['hellfire', 'crush'] },
  rudra:       { name: 'Rudra Sentinel',  hp: 220, str: 30, agi: 18, mag: 20, def: 24, ailment: 'vayu',   xp: 320, gold: 65, minLvl: 48, abilities: ['thunderStrike', 'crush', 'howl'] },
  brahmarishi: { name: 'Brahmarishi Adept', hp: 170, str: 22, agi: 20, mag: 32, def: 18, ailment: 'vajra', xp: 340, gold: 70, minLvl: 50, abilities: ['divineSmite', 'cosmicRays', 'charm'] },
  mahadeva:    { name: 'Mahadeva Herald', hp: 260, str: 32, agi: 22, mag: 30, def: 26, ailment: 'vajra', xp: 400, gold: 90, minLvl: 54, abilities: ['divineSmite', 'hellfire', 'heavenFall'] },
  pralaya:     { name: 'Pralaya Avatar',  hp: 520, str: 40, agi: 24, mag: 36, def: 30, ailment: 'agni',   xp: 800, gold: 200, minLvl: 58, abilities: ['heavenFall', 'hellfire', 'divineSmite', 'crush'] },
  indra:       { name: 'Indra',           hp: 300, str: 30, agi: 20, mag: 28, def: 24, ailment: 'vajra',   xp: 300, gold: 60, minLvl: 38, abilities: ['thunderStrike', 'heavenFall', 'divineSmite'] }
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
    abilities: e.abilities || [],
    xp: Math.floor(e.xp * scale),
    gold: Math.floor(e.gold * scale)
  };
}
