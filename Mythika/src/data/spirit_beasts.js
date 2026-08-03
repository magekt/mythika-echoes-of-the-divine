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

function createBeastState(id) {
  const b = SPIRIT_BEASTS[id];
  if (!b) return null;
  return {
    id, name: b.name, tier: b.tier,
    hp: b.hp, maxHp: b.hp,
    str: b.str, agi: b.agi, def: b.def, mag: b.mag,
    skill: b.skill, desc: b.desc,
    level: 1, xp: 0, active: false
  };
}

function getBeastBonus(beast) {
  if (!beast) return {};
  const l = beast.level;
  return {
    hp: beast.hp + l * 2,
    str: beast.str + l,
    agi: beast.agi + l,
    def: beast.def + l,
    mag: beast.mag + l
  };
}
