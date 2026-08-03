const ITEMS = {
  weapons: {
    bow:      { name: 'Hunter\'s Bow',       type: 'weapon', subtype: 'bow',    atk: 5,  cost: 50 },
    mace:     { name: 'Iron Mace',           type: 'weapon', subtype: 'mace',   atk: 7,  cost: 60 },
    spear:    { name: 'Bronze Spear',        type: 'weapon', subtype: 'spear',  atk: 6,  cost: 55 },
    gandiva:  { name: 'Gandiva',             type: 'weapon', subtype: 'bow',    atk: 12, cost: 0, unique: true },
    gada:     { name: 'Gada',                type: 'weapon', subtype: 'mace',   atk: 15, cost: 0, unique: true },
    vel:      { name: 'Vel',                 type: 'weapon', subtype: 'spear',  atk: 13, cost: 0, unique: true },
    longbow:  { name: 'Longbow of Vayu',     type: 'weapon', subtype: 'bow',    atk: 20, cost: 500, desc: 'Wind-imbued bow' },
    flail:    { name: 'War Flail',           type: 'weapon', subtype: 'mace',   atk: 22, cost: 550, desc: 'Heavy chain flail' },
    trident:  { name: 'Trishula',            type: 'weapon', subtype: 'spear',  atk: 21, cost: 520, desc: 'Three-pronged divine spear' },
    astrBow:  { name: 'Astral Bow',          type: 'weapon', subtype: 'bow',    atk: 30, cost: 0, unique: true, desc: 'Bow of the celestial realm' },
    vajra:    { name: 'Vajra',               type: 'weapon', subtype: 'mace',   atk: 35, cost: 0, unique: true, desc: 'Indra\'s thunderbolt' },
    brahma:   { name: 'Brahmastra',          type: 'weapon', subtype: 'spear',  atk: 33, cost: 0, unique: true, desc: 'The ultimate divine weapon' }
  },
  armors: {
    leather:    { name: 'Leather Armor',     type: 'armor',  def: 3,  cost: 30 },
    chain:      { name: 'Chain Mail',        type: 'armor',  def: 6,  cost: 80 },
    plate:      { name: 'Plate Armor',       type: 'armor',  def: 10, cost: 150 },
    divine:     { name: 'Divine Vest',       type: 'armor',  def: 15, cost: 500 },
    mysticRobe: { name: 'Mystic Robe',       type: 'armor',  def: 12, cost: 350, mag: 4, desc: 'Enchanted with protective wards' },
    asuraPlate: { name: 'Asura Plate',       type: 'armor',  def: 20, cost: 800, desc: 'Forged in the underworld fires' },
    kavacha:    { name: 'Kavacha',           type: 'armor',  def: 28, cost: 0, unique: true, desc: 'Karna\'s impenetrable armor' }
  },
  accessories: {
    simpleAmulet:   { name: 'Simple Amulet',     type: 'accessory', mag: 2,  cost: 20 },
    rubyAmulet:     { name: 'Ruby Amulet',       type: 'accessory', mag: 5,  cost: 100 },
    emeraldRing:    { name: 'Emerald Ring',      type: 'accessory', mag: 4,  cost: 80, crit: 3 },
    sapphirePendant:{ name: 'Sapphire Pendant',  type: 'accessory', mag: 8,  cost: 300 },
    diamondCrown:   { name: 'Diamond Crown',     type: 'accessory', mag: 12, cost: 600, def: 3, desc: 'Crown of celestial light' },
    moonPendant:    { name: 'Moon Pendant',      type: 'accessory', mag: 10, cost: 500, hp: 25, desc: 'Glows with lunar energy' },
    rudraksha:      { name: 'Rudraksha Mala',    type: 'accessory', mag: 15, cost: 0, unique: true, desc: 'Shiva\'s sacred beads' }
  },
  consumables: {
    hpPotion:     { name: 'HP Potion',      type: 'consumable', heal: 30,  cost: 15,  desc: 'Restores 30 HP' },
    mpPotion:     { name: 'MP Potion',      type: 'consumable', heal: 15,  cost: 12,  desc: 'Restores 15 MP' },
    revivalLeaf:  { name: 'Revival Leaf',   type: 'consumable', revive: 50, cost: 100, desc: 'Revives with 50% HP' },
    greaterHPPotion:{name:'Greater HP Potion',type:'consumable', heal: 100, cost: 80,  desc: 'Restores 100 HP' },
    elixirMana:   { name: 'Elixir of Mana', type: 'consumable', mp: 50,  cost: 70,  desc: 'Restores 50 MP' }
  }
};

function getItemCost(item) {
  return item.cost || 0;
}

function applyItemEffect(item, hero) {
  if (item.heal) hero.hp = Math.min(hero.maxHp, hero.hp + item.heal);
  if (item.mp) hero.mp = Math.min(hero.maxMp, hero.mp + item.mp);
  if (item.revive && hero.hp <= 0) hero.hp = Math.floor(hero.maxHp * item.revive / 100);
  if (item.cultivationBase) CultivationSystem.addCultivationBase(item.cultivationBase);
  if (item.tribulationBonus) {
    if (!G.state.flags) G.state.flags = {};
    G.state.flags.tribulationBonus = (G.state.flags.tribulationBonus || 0) + item.tribulationBonus;
  }
  if (item.str) hero.str += item.str;
  if (item.mag) hero.mag += item.mag;
  if (item.hp) { hero.maxHp += item.hp; hero.hp = Math.min(hero.hp + item.hp, hero.maxHp); }
  if (item.prana) CultivationSystem.addPrana(item.prana);
  if (item.divineFragments) Economy.addDivineFragments(item.divineFragments);
}
