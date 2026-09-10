const AURAS = {
  // Kshatriya auras (physical)
  lionsMight:     { name: "Lion's Might",    path: 'kshatriya', desc: '+3 STR',               effect: { str: 3 } },
  eagleEye:       { name: "Eagle Eye",       path: 'kshatriya', desc: '+5% crit chance',      effect: { crit: 5 } },
  bearsEndurance: { name: "Bear's Endurance",path: 'kshatriya', desc: '+15 HP',               effect: { hp: 15 } },
  tigersFury:     { name: "Tiger's Fury",    path: 'kshatriya', desc: '+20% ATK when <30% HP',effect: { furyAtk: 20 } },
  bullCharge:     { name: 'Bull Charge',     path: 'kshatriya', desc: '+10% Stun chance',     effect: { stunChance: 10 } },
  wolfPack:       { name: 'Wolf Pack',       path: 'kshatriya', desc: '+5% party ATK',        effect: { partyAtk: 5 } },
  falconDive:     { name: 'Falcon Dive',     path: 'kshatriya', desc: '+15% Airborne dmg',    effect: { vayuDmg: 15 } },
  elephantStomp:  { name: 'Elephant Stomp',  path: 'kshatriya', desc: '+10% AoE dmg',         effect: { aoeDmg: 10 } },
  // Rishi auras (magic)
  serpentsWisdom: { name: "Serpent's Wisdom",path: 'rishi',     desc: '+3 MAG',               effect: { mag: 3 } },
  lotusRegen:     { name: 'Lotus Regen',     path: 'rishi',     desc: '+2 MP/turn',           effect: { mpRegen: 2 } },
  phoenixFlame:   { name: 'Phoenix Flame',   path: 'rishi',     desc: '+20% Burn damage',     effect: { agniDmg: 20 } },
  moonlightHeal:  { name: 'Moonlight Heal',  path: 'rishi',     desc: '+15% healing',         effect: { healPower: 15 } },
  starFall:       { name: 'Star Fall',       path: 'rishi',     desc: '+10% Magic AoE',       effect: { magicAoe: 10 } },
  riverFlow:      { name: 'River Flow',      path: 'rishi',     desc: '+5% speed/evasion',    effect: { speed: 5 } },
  forestVeil:     { name: 'Forest Veil',     path: 'rishi',     desc: '+8% dodge chance',     effect: { dodge: 8 } },
  sandStorm:      { name: 'Sand Storm',      path: 'rishi',     desc: '+10% blind chance',    effect: { blindChance: 10 } },
  // Yogi auras (hybrid)
  turtleShell:    { name: 'Turtle Shell',    path: 'yogi',      desc: '+3 DEF',               effect: { def: 3 } },
  craneGrace:     { name: 'Crane Grace',     path: 'yogi',      desc: '+5% dodge',            effect: { dodge: 5 } },
  monkeyTrick:    { name: 'Monkey Trick',    path: 'yogi',      desc: '+3 AGI',               effect: { agi: 3 } },
  dragonBreath:   { name: 'Dragon Breath',   path: 'yogi',      desc: '+10% all element dmg',  effect: { allElemDmg: 10 } },
  butterflyDream: { name: 'Butterfly Dream', path: 'yogi',      desc: '+25% dream rewards',   effect: { dreamReward: 25 } },
  mountainStill:  { name: 'Mountain Still',  path: 'yogi',      desc: '+3 DEF while idle',    effect: { idleDef: 3 } },
  oceanDepth:     { name: 'Ocean Depth',     path: 'yogi',      desc: '+10 MP',               effect: { mp: 10 } },
  skyBeyond:      { name: 'Sky Beyond',      path: 'yogi',      desc: '+10% XP gain',         effect: { xpBonus: 10 } }
};

function getClassAuras(classPath) {
  return Object.entries(AURAS).filter(([k,v]) => v.path === classPath);
}

AURAS.getTotal = function(key) {
  let total = 0;
  for (const id of (G.state.equippedAuras || [])) {
    const a = AURAS[id];
    if (a && a.effect && a.effect[key]) total += a.effect[key];
  }
  return total;
};
