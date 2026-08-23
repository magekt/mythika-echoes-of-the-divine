const SPIRIT_BEASTS = {
  wolf:      { name: 'Shadow Wolf',    tier: 1, hp: 20,  str: 3,  agi: 4,  def: 2,  mag: 0,  skill: 'Howl',       desc: 'Increases party ATK by 10% for 3 turns' },
  serpent:   { name: 'Iron Serpent',   tier: 1, hp: 15,  str: 2,  agi: 3,  def: 3,  mag: 2,  skill: 'Venom Bite',  desc: 'Poisons enemy, dealing 5 DMG/turn for 3 turns' },
  owl:       { name: 'Night Owl',      tier: 2, hp: 18,  str: 2,  agi: 6,  def: 1,  mag: 4,  skill: 'Dark Veil',   desc: 'Reduces enemy accuracy by 15% for 3 turns' },
  bear:      { name: 'Stone Bear',     tier: 2, hp: 35,  str: 5,  agi: 1,  def: 6,  mag: 1,  skill: 'Fortify',     desc: 'Raises party DEF by 20% for 3 turns' },
  fox:       { name: 'Celestial Fox',  tier: 3, hp: 22,  str: 3,  agi: 5,  def: 2,  mag: 6,  skill: 'Spirit Flame',desc: 'Deals 25 MAG fire damage' },
  dragon:    { name: 'Storm Dragon',   tier: 3, hp: 40,  str: 8,  agi: 4,  def: 5,  mag: 7,  skill: 'Tempest',     desc: 'Deals 40 AoE wind damage' },
  phoenix:   { name: 'Crimson Phoenix',tier: 3, hp: 30,  str: 4,  agi: 7,  def: 3,  mag: 9,  skill: 'Rebirth Flame',desc: 'Revives fallen ally with 30% HP once per combat' },
  turtle:    { name: 'Onyx Turtle',    tier: 2, hp: 45,  str: 2,  agi: 2,  def: 8,  mag: 3,  skill: 'Shell Guard',  desc: 'Shields ally absorbing 20 DMG for 2 turns' },
  tiger:     { name: 'White Tiger',    tier: 3, hp: 35,  str: 9,  agi: 6,  def: 4,  mag: 2,  skill: 'Rending Claw', desc: 'Deals 30 physical DMG and causes Bleed' },
  kitsune:   { name: 'Nine-Tailed Kitsune', tier: 4, hp: 28, str: 3, agi: 8, def: 2, mag: 10, skill: 'Mirage',      desc: 'Confuses enemy, skipping their next turn' }
};

const BEAST_EVOLUTIONS = {
  wolf: [
    { form: 'direWolf', name: 'Dire Wolf', level: 10, hp: 35, str: 6, agi: 7, def: 4, mag: 1, skill: 'Pack Howl', desc: 'Party ATK +20% for 3 turns', passive: 'critBoost', passiveDesc: '+5% crit chance' },
    { form: 'fenrir', name: 'Fenrir', level: 25, hp: 60, str: 12, agi: 10, def: 6, mag: 3, skill: 'Moonlight Howl', desc: 'Party ATK +30%, self heals 20% HP', passive: 'lifesteal', passiveDesc: 'Heal 10% of damage dealt' }
  ],
  serpent: [
    { form: 'nagaSerpent', name: 'Naga Serpent', level: 10, hp: 28, str: 4, agi: 6, def: 5, mag: 4, skill: 'Venom Storm', desc: 'Poisons all enemies for 8 DMG/turn', passive: 'poisonMaster', passiveDesc: '+50% poison damage' },
    { form: 'kingCobra', name: 'King Cobra', level: 25, hp: 50, str: 8, agi: 8, def: 7, mag: 6, skill: 'Death Coil', desc: 'Poisons enemy, heals self for 30% of damage', passive: 'venomImmunity', passiveDesc: 'Immune to poison' }
  ],
  owl: [
    { form: 'wisdomOwl', name: 'Wisdom Owl', level: 10, hp: 30, str: 3, agi: 9, def: 2, mag: 7, skill: 'Mind Shroud', desc: 'Enemy accuracy -25% for 3 turns', passive: 'manaRegen', passiveDesc: 'Regen 5 MP/turn' },
    { form: 'phoenixOwl', name: 'Phoenix Owl', level: 25, hp: 45, str: 5, agi: 12, def: 4, mag: 12, skill: 'Eternal Wisdom', desc: 'Revives with 50% HP when killed', passive: 'arcaneShield', passiveDesc: 'Absorb 15 magic damage' }
  ],
  bear: [
    { form: 'caveBear', name: 'Cave Bear', level: 10, hp: 60, str: 8, agi: 2, def: 10, mag: 2, skill: 'Stone Wall', desc: 'Party DEF +30% for 3 turns', passive: 'thickSkin', passiveDesc: 'Reduce damage by 10%' },
    { form: 'mountainBear', name: 'Mountain Bear', level: 25, hp: 100, str: 14, agi: 3, def: 16, mag: 4, skill: 'Avalanche', desc: 'AoE damage + party DEF +40%', passive: 'unbreakable', passiveDesc: 'Survive lethal damage once (50% HP)' }
  ],
  fox: [
    { form: 'spiritFox', name: 'Spirit Fox', level: 10, hp: 35, str: 5, agi: 8, def: 4, mag: 10, skill: 'Inferno Fox', desc: 'Deals 40 MAG fire damage', passive: 'fireAffinity', passiveDesc: '+25% fire damage' },
    { form: 'ninetails', name: 'Nine-Tailed Fox', level: 25, hp: 55, str: 8, agi: 12, def: 6, mag: 16, skill: 'Fox Fire Storm', desc: 'Deals 60 AoE fire damage + Burn', passive: 'multiTail', passiveDesc: 'Attack hits twice (50% damage)' }
  ],
  dragon: [
    { form: 'elderDragon', name: 'Elder Dragon', level: 10, hp: 70, str: 14, agi: 6, def: 8, mag: 12, skill: 'Storm Fury', desc: 'Deals 60 AoE wind damage', passive: 'dragonHeart', passiveDesc: '+20% max HP' },
    { form: 'stormLord', name: 'Storm Lord', level: 25, hp: 120, str: 20, agi: 10, def: 12, mag: 18, skill: 'Thundergod Wrath', desc: 'Deals 100 AoE thunder damage + Stun', passive: 'lightningReflexes', passiveDesc: '15% dodge chance' }
  ],
  phoenix: [
    { form: 'solarPhoenix', name: 'Solar Phoenix', level: 10, hp: 50, str: 7, agi: 10, def: 5, mag: 14, skill: 'Solar Flare', desc: 'Deals 50 MAG fire damage + Burn', passive: 'rebirthFlame', passiveDesc: 'Revive once at 30% HP' },
    { form: 'divinePhoenix', name: 'Divine Phoenix', level: 25, hp: 80, str: 12, agi: 14, def: 8, mag: 22, skill: 'Eternal Flame', desc: 'Full party revive + heal 50%', passive: 'immortalFlame', passiveDesc: 'Auto-revive at full HP once per battle' }
  ],
  turtle: [
    { form: 'crystalTurtle', name: 'Crystal Turtle', level: 10, hp: 75, str: 4, agi: 3, def: 14, mag: 5, skill: 'Crystal Barrier', desc: 'Shield ally for 50 damage', passive: 'shellArmor', passiveDesc: '+20% DEF' },
    { form: 'worldTurtle', name: 'World Turtle', level: 25, hp: 140, str: 6, agi: 4, def: 24, mag: 8, skill: 'Continental Shield', desc: 'Party immune to damage for 1 turn', passive: 'unyielding', passiveDesc: 'Cannot be one-shot' }
  ],
  tiger: [
    { form: 'shadowTiger', name: 'Shadow Tiger', level: 10, hp: 55, str: 14, agi: 10, def: 6, mag: 4, skill: 'Shadow Rend', desc: 'Deals 45 physical damage + Bleed', passive: 'predatorInstinct', passiveDesc: '+15% crit chance' },
    { form: 'divineTiger', name: 'Divine Tiger', level: 25, hp: 90, str: 22, agi: 14, def: 10, mag: 6, skill: 'Heavenly Claw', desc: 'Deals 80 physical damage + Stun', passive: 'furyStrike', passiveDesc: 'Criticals deal 2x damage' }
  ],
  kitsune: [
    { form: 'spiritKitsune', name: 'Spirit Kitsune', level: 10, hp: 45, str: 5, agi: 12, def: 4, mag: 16, skill: 'Illusion Army', desc: 'Confuses all enemies for 2 turns', passive: 'illusionMaster', passiveDesc: '20% dodge chance' },
    { form: 'celestialKitsune', name: 'Celestial Kitsune', level: 25, hp: 70, str: 8, agi: 16, def: 6, mag: 24, skill: 'Reality Warp', desc: 'Steals enemy buffs + applies confusion', passive: 'nineLives', passiveDesc: 'Survive 3 lethal hits per battle' }
  ]
};

function createBeastState(id) {
  const b = SPIRIT_BEASTS[id];
  if (!b) return null;
  return {
    id, name: b.name, tier: b.tier,
    hp: b.hp, maxHp: b.hp,
    str: b.str, agi: b.agi, def: b.def, mag: b.mag,
    skill: b.skill, desc: b.desc,
    level: 1, xp: 0, active: false,
    evolution: null, evolutionForm: null
  };
}

function getBeastBonus(beast) {
  if (!beast) return {};
  const l = beast.level;
  let bonus = {
    hp: beast.hp + l * 2,
    str: beast.str + l,
    agi: beast.agi + l,
    def: beast.def + l,
    mag: beast.mag + l
  };
  
  if (beast.evolutionForm) {
    const evo = BEAST_EVOLUTIONS[beast.id];
    if (evo) {
      const form = evo.find(f => f.form === beast.evolutionForm);
      if (form) {
        bonus.hp = form.hp + l * 3;
        bonus.str = form.str + l * 1.5;
        bonus.agi = form.agi + l * 1.5;
        bonus.def = form.def + l * 1.5;
        bonus.mag = form.mag + l * 1.5;
      }
    }
  }
  
  return bonus;
}

function getBeastEvolution(beastId, currentLevel) {
  const evolutions = BEAST_EVOLUTIONS[beastId];
  if (!evolutions) return null;
  const beast = (typeof G !== 'undefined' && G.state && G.state.spiritBeasts) ? G.state.spiritBeasts.find(b => b.id === beastId) : null;
  const stage = beast ? (beast.evolutionStage || 0) : 0;
  if (stage < evolutions.length && currentLevel >= evolutions[stage].level) return evolutions[stage];
  for (const evo of evolutions) if (currentLevel >= evo.level) return evo;
  return null;
}

function canEvolve(beast) {
  if (!beast) return false;
  const evolutions = BEAST_EVOLUTIONS[beast.id];
  if (!evolutions) return false;
  const stage = beast.evolutionStage || 0;
  if (stage >= evolutions.length) return false;
  return beast.level >= evolutions[stage].level;
}

function evolveBeast(beast) {
  if (!canEvolve(beast)) return null;
  const evolutions = BEAST_EVOLUTIONS[beast.id];
  const stage = beast.evolutionStage || 0;
  const evo = evolutions[stage];
  if (!evo || beast.level < evo.level) return null;
  beast.evolutionStage = stage + 1;
  beast.evolutionForm = evo.form;
  beast.name = evo.name;
  beast.hp = evo.hp;
  beast.maxHp = evo.hp;
  beast.str = evo.str;
  beast.agi = evo.agi;
  beast.def = evo.def;
  beast.mag = evo.mag;
  beast.skill = evo.skill;
  beast.desc = evo.desc;
  beast.passive = evo.passive;
  beast.passiveDesc = evo.passiveDesc;
  try {
    if (beast.id === 'wolf' || evo.form.includes('Wolf') || evo.form.includes('wolf')) {
      JourneySystem.start('beastWolfPact');
      Notify.show('New Journey: Pact of the Shadow Wolf!', 3, R.colors.gold);
    }
  } catch(e) {}
  return evo;
}
