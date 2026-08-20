const RARITY = {
  common:    { name: 'Common',    color: '#8a8aa0', mult: 1.0, dropWeight: 60 },
  uncommon:  { name: 'Uncommon',  color: '#30c830', mult: 1.3, dropWeight: 25 },
  rare:      { name: 'Rare',      color: '#3080c8', mult: 1.7, dropWeight: 12 },
  legendary: { name: 'Legendary', color: '#e8a030', mult: 2.2, dropWeight: 3 }
};

const EQUIPMENT_POOL = {
  weapons: [
    { id: 'bow', base: { name: 'Bow', subtype: 'bow', atk: 5 }, zones: ['aryavarta'] },
    { id: 'mace', base: { name: 'Mace', subtype: 'mace', atk: 7 }, zones: ['aryavarta'] },
    { id: 'spear', base: { name: 'Spear', subtype: 'spear', atk: 6 }, zones: ['aryavarta'] },
    { id: 'longbow', base: { name: 'Longbow', subtype: 'bow', atk: 12 }, zones: ['dandaka'] },
    { id: 'flail', base: { name: 'Flail', subtype: 'mace', atk: 14 }, zones: ['dandaka'] },
    { id: 'trident', base: { name: 'Trident', subtype: 'spear', atk: 13 }, zones: ['dandaka'] },
    { id: 'frostsword', base: { name: 'Frost Blade', subtype: 'spear', atk: 18 }, zones: ['meru'] },
    { id: 'infernoaxe', base: { name: 'Inferno Axe', subtype: 'mace', atk: 20 }, zones: ['meru'] },
    { id: 'stormbow', base: { name: 'Storm Bow', subtype: 'bow', atk: 22 }, zones: ['meru'] },
    { id: 'serpentblade', base: { name: 'Serpent Blade', subtype: 'spear', atk: 26 }, zones: ['patala'] },
    { id: 'soulscythe', base: { name: 'Soul Scythe', subtype: 'mace', atk: 28 }, zones: ['patala'] },
    { id: 'netherbow', base: { name: 'Nether Bow', subtype: 'bow', atk: 30 }, zones: ['patala'] },
    { id: 'celestialblade', base: { name: 'Celestial Blade', subtype: 'spear', atk: 35 }, zones: ['svarga'] },
    { id: 'divinemace', base: { name: 'Divine Mace', subtype: 'mace', atk: 38 }, zones: ['svarga'] },
    { id: 'heavenbow', base: { name: 'Heaven Bow', subtype: 'bow', atk: 40 }, zones: ['svarga'] }
  ],
  armors: [
    { id: 'leather', base: { name: 'Leather', def: 3 }, zones: ['aryavarta'] },
    { id: 'chain', base: { name: 'Chain Mail', def: 6 }, zones: ['aryavarta'] },
    { id: 'scale', base: { name: 'Scale Mail', def: 9 }, zones: ['dandaka'] },
    { id: 'plate', base: { name: 'Plate Armor', def: 12 }, zones: ['dandaka'] },
    { id: 'frostplate', base: { name: 'Frost Plate', def: 16 }, zones: ['meru'] },
    { id: 'mithril', base: { name: 'Mithril Mail', def: 20 }, zones: ['meru'] },
    { id: 'shadowveil', base: { name: 'Shadow Veil', def: 24 }, zones: ['patala'] },
    { id: 'asuraplate', base: { name: 'Asura Plate', def: 28 }, zones: ['patala'] },
    { id: 'celestialrobe', base: { name: 'Celestial Robe', def: 32 }, zones: ['svarga'] },
    { id: 'divinearmor', base: { name: 'Divine Armor', def: 36 }, zones: ['svarga'] }
  ],
  accessories: [
    { id: 'ruby', base: { name: 'Ruby Amulet', mag: 3 }, zones: ['aryavarta'] },
    { id: 'emerald', base: { name: 'Emerald Ring', mag: 4, crit: 2 }, zones: ['aryavarta'] },
    { id: 'sapphire', base: { name: 'Sapphire Pendant', mag: 6 }, zones: ['dandaka'] },
    { id: 'topaz', base: { name: 'Topaz Crown', mag: 8, def: 2 }, zones: ['dandaka'] },
    { id: 'amethyst', base: { name: 'Amulet of Power', mag: 10, str: 3 }, zones: ['meru'] },
    { id: 'diamond', base: { name: 'Diamond Crown', mag: 12, def: 3 }, zones: ['meru'] },
    { id: 'obsidian', base: { name: 'Obsidian Talisman', mag: 15, hp: 20 }, zones: ['patala'] },
    { id: 'moonstone', base: { name: 'Moonstone Pendant', mag: 18, hp: 30 }, zones: ['patala'] },
    { id: 'starlight', base: { name: 'Starlight Amulet', mag: 22, crit: 5 }, zones: ['svarga'] },
    { id: 'divine', base: { name: 'Divine Crown', mag: 25, def: 5 }, zones: ['svarga'] }
  ]
};

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

function generateLoot(zoneId, enemyLevel) {
  const loot = [];
  const dropChance = 0.35;
  
  if (Math.random() > dropChance) return loot;
  
  const rarityRoll = Math.random() * 100;
  let rarity = 'common';
  let cumulative = 0;
  for (const [key, val] of Object.entries(RARITY)) {
    cumulative += val.dropWeight;
    if (rarityRoll < cumulative) { rarity = key; break; }
  }
  
  if (rarity === 'common' && Math.random() < 0.3) {
    const uncommonChance = Progression.getLootBonus() * 0.2;
    if (Math.random() < uncommonChance) rarity = 'uncommon';
  }
  
  const types = ['weapons', 'armors', 'accessories'];
  const type = types[Math.floor(Math.random() * types.length)];
  const pool = EQUIPMENT_POOL[type].filter(e => e.zones.includes(zoneId));
  
  if (pool.length === 0) return loot;
  
  const template = pool[Math.floor(Math.random() * pool.length)];
  const rarityData = RARITY[rarity];
  const levelScale = 1 + (enemyLevel - 1) * 0.08;
  const difficultyBonus = Progression.getLootBonus();
  
  const item = {
    id: template.id + '_' + Date.now(),
    templateId: template.id,
    name: template.base.name,
    type: type === 'weapons' ? 'weapon' : type === 'armors' ? 'armor' : 'accessory',
    rarity: rarity,
    rarityName: rarityData.name,
    rarityColor: rarityData.color
  };
  
  if (template.base.atk) item.atk = Math.floor(template.base.atk * rarityData.mult * levelScale * difficultyBonus);
  if (template.base.def) item.def = Math.floor(template.base.def * rarityData.mult * levelScale * difficultyBonus);
  if (template.base.mag) item.mag = Math.floor(template.base.mag * rarityData.mult * levelScale * difficultyBonus);
  if (template.base.crit) item.crit = template.base.crit;
  if (template.base.hp) item.hp = Math.floor(template.base.hp * rarityData.mult * difficultyBonus);
  if (template.base.subtype) item.subtype = template.base.subtype;
  
  loot.push(item);
  return loot;
}

function getLootColor(rarity) {
  return RARITY[rarity] ? RARITY[rarity].color : RARITY.common.color;
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
