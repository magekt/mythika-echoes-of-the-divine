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
    { id: 'heavenbow', base: { name: 'Heaven Bow', subtype: 'bow', atk: 40 }, zones: ['svarga'] },
    { id: 'tapasbow', base: { name: 'Tapas Bow', subtype: 'bow', atk: 46 }, zones: ['tapobhumi'] },
    { id: 'rudrahammer', base: { name: 'Rudra Hammer', subtype: 'mace', atk: 50 }, zones: ['tapobhumi'] },
    { id: 'voidblade', base: { name: 'Void Blade', subtype: 'spear', atk: 48 }, zones: ['tapobhumi'] },
    { id: 'obsidiancleaver', base: { name: 'Obsidian Cleaver', subtype: 'mace', atk: 24 }, zones: ['meru'] },
    { id: 'voidlance', base: { name: 'Void Lance', subtype: 'spear', atk: 32 }, zones: ['patala'] },
    { id: 'heavenlychakram', base: { name: 'Heavenly Chakram', subtype: 'spear', atk: 34 }, zones: ['svarga'] },
    { id: 'ashvamedha', base: { name: 'Ashvamedha Axe', subtype: 'mace', atk: 36 }, zones: ['svarga'] }
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
    { id: 'divinearmor', base: { name: 'Divine Armor', def: 36 }, zones: ['svarga'] },
    { id: 'tapasrobe', base: { name: 'Tapas Robe', def: 42 }, zones: ['tapobhumi'] },
    { id: 'mahadevaplates', base: { name: 'Mahadeva Plate', def: 46 }, zones: ['tapobhumi'] },
    { id: 'jadevest', base: { name: 'Jade Vest', def: 11 }, zones: ['dandaka'] },
    { id: 'titaniumshell', base: { name: 'Titanium Shell', def: 25 }, zones: ['patala'] }
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
    { id: 'divine', base: { name: 'Divine Crown', mag: 25, def: 5 }, zones: ['svarga'] },
    { id: 'pralayaamulet', base: { name: 'Pralaya Amulet', mag: 30, hp: 40 }, zones: ['tapobhumi'] },
    { id: 'voidcrown', base: { name: 'Void Crown', mag: 32, crit: 7 }, zones: ['tapobhumi'] },
    { id: 'sageRing', base: { name: 'Sage Ring', mag: 7, crit: 2 }, zones: ['dandaka'] },
    { id: 'voidessence', base: { name: 'Void Essence', mag: 20, hp: 15 }, zones: ['tapobhumi'] }
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
    elixirMana:   { name: 'Elixir of Mana', type: 'consumable', mp: 50,  cost: 70,  desc: 'Restores 50 MP' },
    fishStew:     { name: 'Fish Stew',     type: 'consumable', heal: 60,  cost: 25,  desc: 'Restores 60 HP' },
    herbPoultice: { name: 'Herb Poultice', type: 'consumable', cleanse: true, cost: 40, desc: 'Removes all ailments' }
  },
  // --- Phase 29: Hero Gifts (GFT-01) ---
  // Gift catalog sized to zones + cultivation realms + story journeys:
  // 6 zone-flavored + 6 realm-flavored + 7 story-flavored = 19 gifts.
  // Gifts are type 'gift' (never 'used' via applyItemEffect); they leave
  // inventory only through BondSystem.giveGift -> Economy.removeItemByName.
  // No shop sells gifts (no gift-vending). Each gift declares zones[] (loot
  // sourcing) and optionally minTier (top gifts locked behind Sworn+).
  gifts: {
    g_sungrass:     { name: 'Sungrass Garland',           type: 'gift', giftKey: 'g_sungrass',     cost: 0, zones: ['aryavarta'], flavor: 'zone',  desc: 'Woven from the golden plains of Aryavarta' },
    g_dandakaHoney: { name: 'Dandaka Wild Honey',         type: 'gift', giftKey: 'g_dandakaHoney', cost: 0, zones: ['dandaka'],   flavor: 'zone',  desc: 'Dark, fragrant honey from the whispering forest' },
    g_meruCrystal:  { name: 'Meru Frost Crystal',         type: 'gift', giftKey: 'g_meruCrystal',  cost: 0, zones: ['meru'],      flavor: 'zone',  desc: 'A crystal that hums with peak-cold clarity' },
    g_serpentPearl: { name: 'Patala Serpent Pearl',       type: 'gift', giftKey: 'g_serpentPearl', cost: 0, zones: ['patala'],    flavor: 'zone',  minTier: 'Sworn', desc: 'A pearl guarded by the serpent court' },
    g_celestialSilk:{ name: 'Svarga Celestial Silk',      type: 'gift', giftKey: 'g_celestialSilk',cost: 0, zones: ['svarga'],    flavor: 'zone',  minTier: 'Sworn', desc: 'Silk that holds the light of the devas' },
    g_ashenEmber:   { name: 'Tapobhumi Ashen Ember',      type: 'gift', giftKey: 'g_ashenEmber',   cost: 0, zones: ['tapobhumi'], flavor: 'zone',  minTier: 'Sworn', desc: 'An ember that never cools, from the burning ground' },
    g_harvestSweets:{ name: 'Manushya Harvest Sweets',    type: 'gift', giftKey: 'g_harvestSweets',cost: 0, zones: ['aryavarta'], flavor: 'realm', realm: 'manushya',  desc: 'Sweets of the mortal harvest festival' },
    g_prayerBeads:  { name: 'Sadhaka Prayer Beads',       type: 'gift', giftKey: 'g_prayerBeads',  cost: 0, zones: ['dandaka'],   flavor: 'realm', realm: 'sadhaka',   desc: 'Beads worn smooth by a seeker\'s vows' },
    g_sandalIncense:{ name: 'Yogi Sandal Incense',        type: 'gift', giftKey: 'g_sandalIncense',cost: 0, zones: ['meru'],      flavor: 'realm', realm: 'yogi',      desc: 'Incense for breath held past counting' },
    g_rejuvenElixir:{ name: 'Siddha Rejuvenating Elixir', type: 'gift', giftKey: 'g_rejuvenElixir',cost: 0, zones: ['patala'],    flavor: 'realm', realm: 'siddha',    desc: 'An elixir of the perfected adepts' },
    g_goldenLotus:  { name: 'Mukta Golden Lotus',         type: 'gift', giftKey: 'g_goldenLotus',  cost: 0, zones: ['svarga'],    flavor: 'realm', realm: 'mukta',     desc: 'A lotus that blooms for the liberated' },
    g_stillnessBell:{ name: 'Paramukta Stillness Bell',   type: 'gift', giftKey: 'g_stillnessBell',cost: 0, zones: ['tapobhumi'], flavor: 'realm', realm: 'paramukta', minTier: 'Sworn', desc: 'A bell whose note is silence itself' },
    g_bowstring:    { name: 'Gandiva Bowstring',          type: 'gift', giftKey: 'g_bowstring',    cost: 0, zones: ['aryavarta', 'meru'], flavor: 'story', story: 'arjunaResolve',      desc: 'A spare string, waxed for the peerless bow' },
    g_armorOil:     { name: 'Surya Armor Oil',            type: 'gift', giftKey: 'g_armorOil',     cost: 0, zones: ['aryavarta', 'patala'], flavor: 'story', story: 'karnaburden',  desc: 'Sun-blessed oil for divine armor' },
    g_oathBand:     { name: 'Kshatriya Oath Band',        type: 'gift', giftKey: 'g_oathBand',     cost: 0, zones: ['dandaka', 'svarga'],   flavor: 'story', story: 'covenantKshatriya', desc: 'A warrior\'s oath-band, knotted once' },
    g_mantraScroll: { name: 'Rishi Mantra Scroll',        type: 'gift', giftKey: 'g_mantraScroll', cost: 0, zones: ['dandaka', 'svarga'],   flavor: 'story', story: 'covenantRishi',    desc: 'A scroll coiled with quiet mantras' },
    g_fangCharm:    { name: 'Wolf-Pack Fang Charm',       type: 'gift', giftKey: 'g_fangCharm',    cost: 0, zones: ['dandaka', 'meru'],     flavor: 'story', story: 'beastWolfPact',   desc: 'A fang given freely by the pack' },
    g_pilgrimAsh:   { name: 'Pilgrim\'s Tapobhumi Ash',   type: 'gift', giftKey: 'g_pilgrimAsh',   cost: 0, zones: ['tapobhumi'], flavor: 'story', story: 'paramuktaPilgrimage', minTier: 'Sworn', desc: 'Ash of one who walked barefoot beyond Mukta' },
    g_dharmaScale:  { name: 'Crossroads Scale of Dharma', type: 'gift', giftKey: 'g_dharmaScale',  cost: 0, zones: ['svarga', 'tapobhumi'], flavor: 'story', story: 'karmicCrossroads',   minTier: 'Sworn', desc: 'A scale that weighs mercy against wrath' }
  }
};

// --- Phase 29: Hero Gifts — per-hero liked rosters (giftKey arrays only) ---
// Personality-matched, 10 per hero, spanning early-to-late tiers. Tier locks
// live on the gift defs (minTier), not here.
const HERO_GIFTS = {
  arjuna:   ['g_bowstring', 'g_sungrass', 'g_prayerBeads', 'g_sandalIncense', 'g_meruCrystal', 'g_mantraScroll', 'g_oathBand', 'g_goldenLotus', 'g_stillnessBell', 'g_dharmaScale'],
  bhima:    ['g_dandakaHoney', 'g_harvestSweets', 'g_sungrass', 'g_oathBand', 'g_fangCharm', 'g_rejuvenElixir', 'g_serpentPearl', 'g_meruCrystal', 'g_pilgrimAsh', 'g_ashenEmber'],
  karna:    ['g_armorOil', 'g_sungrass', 'g_oathBand', 'g_celestialSilk', 'g_goldenLotus', 'g_meruCrystal', 'g_stillnessBell', 'g_serpentPearl', 'g_dharmaScale', 'g_ashenEmber'],
  draupadi: ['g_celestialSilk', 'g_mantraScroll', 'g_goldenLotus', 'g_sandalIncense', 'g_serpentPearl', 'g_prayerBeads', 'g_dandakaHoney', 'g_harvestSweets', 'g_dharmaScale', 'g_stillnessBell'],
  hanuman:  ['g_dandakaHoney', 'g_harvestSweets', 'g_fangCharm', 'g_prayerBeads', 'g_sandalIncense', 'g_sungrass', 'g_rejuvenElixir', 'g_bowstring', 'g_pilgrimAsh', 'g_celestialSilk']
};

function getItemCost(item) {
  return item.cost || 0;
}

const EquipmentSystem = {
  slots: {
    weapon: 'weaponEquipped',
    armor: 'armorEquipped',
    accessory: 'accessoryEquipped'
  },

  normalizeHero: function(hero) {
    if (!hero || typeof hero !== 'object') return;
    for (const type of Object.keys(this.slots)) {
      const slot = this.slots[type];
      const item = hero[slot];
      if (!item || typeof item !== 'object' || Array.isArray(item) || item.type !== type ||
          (type === 'weapon' && item.subtype && item.subtype !== hero.weaponType)) {
        hero[slot] = null;
      }
    }
    // Equipped slot objects are the canonical gear source. Old cache fields
    // mirrored those values and caused the Party equip route to double-count.
    for (const field of ['equipAtk', 'equipDef', 'equipAccMag', 'equipArmorMag', 'equipAccDef', 'equipAccHp', 'equipCrit']) {
      delete hero[field];
    }
  },

  normalize: function() {
    for (const hero of Array.isArray(G.state.party) ? G.state.party : []) this.normalizeHero(hero);
  },

  equip: function(hero, item) {
    if (!hero || !Array.isArray(G.state.party) || G.state.party.indexOf(hero) < 0) {
      return { ok: false, reason: 'invalid-hero' };
    }
    if (!item || typeof item !== 'object' || !this.slots[item.type]) {
      return { ok: false, reason: 'invalid-item' };
    }
    if (!Array.isArray(G.state.inventory)) return { ok: false, reason: 'invalid-inventory' };
    const inventoryIndex = G.state.inventory.indexOf(item);
    if (inventoryIndex < 0) return { ok: false, reason: 'not-owned' };
    if (item.type === 'weapon' && item.subtype && item.subtype !== hero.weaponType) {
      return { ok: false, reason: 'incompatible-weapon' };
    }

    const slot = this.slots[item.type];
    const replaced = hero[slot];
    G.state.inventory.splice(inventoryIndex, 1);
    if (replaced && typeof replaced === 'object' && !Array.isArray(replaced)) G.state.inventory.push(replaced);
    hero[slot] = item;
    this.normalizeHero(hero);
    return { ok: true, slot: slot, item: item };
  },

  unequip: function(hero, type) {
    if (!hero || !Array.isArray(G.state.party) || G.state.party.indexOf(hero) < 0 || !this.slots[type]) {
      return { ok: false, reason: 'invalid-hero-or-slot' };
    }
    const slot = this.slots[type];
    const item = hero[slot];
    if (!item || typeof item !== 'object' || Array.isArray(item)) return { ok: false, reason: 'empty-slot' };
    if (!Array.isArray(G.state.inventory)) G.state.inventory = [];
    hero[slot] = null;
    G.state.inventory.push(item);
    this.normalizeHero(hero);
    return { ok: true, item: item };
  }
};

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
  
  const margaChance = Progression.perkValue('marga') / 100;
  if (Math.random() < margaChance && rarity !== 'legendary') {
    rarity = rarity === 'common' ? 'uncommon' : rarity === 'uncommon' ? 'rare' : 'legendary';
  }
  if (rarity === 'common' && Math.random() < 0.3) {
    const uncommonChance = Progression.getLootBonus() * 0.2;
    if (Math.random() < uncommonChance) rarity = 'uncommon';
  }
  var siddhiBonus = 1 + Progression.perkValue('siddhi') / 100;
  
  const types = ['weapons', 'armors', 'accessories'];
  const type = types[Math.floor(Math.random() * types.length)];
  const pool = EQUIPMENT_POOL[type].filter(e => e.zones.includes(zoneId));
  
  if (pool.length === 0) return loot;
  
  const template = pool[Math.floor(Math.random() * pool.length)];
  const rarityData = RARITY[rarity];
  const levelScale = 1 + (enemyLevel - 1) * 0.08;
  const difficultyBonus = Progression.getLootBonus() * siddhiBonus;
  
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

  // --- Phase 29: Hero Gifts — additive gift drop (no gift-vending) ---
  // ~12% chance of a zone-appropriate gift alongside equipment. Never alters
  // the equipment roll above; unknown zones or absent catalog yield no gift.
  try {
    if (Math.random() < 0.12 && ITEMS && ITEMS.gifts && typeof ITEMS.gifts === 'object') {
      const candidates = Object.keys(ITEMS.gifts).filter(function(key) {
        const g = ITEMS.gifts[key];
        return g && Array.isArray(g.zones) && g.zones.indexOf(zoneId) !== -1;
      });
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const def = ITEMS.gifts[pick];
        if (def && typeof def.name === 'string') {
          loot.push({ name: def.name, type: 'gift', giftKey: pick, qty: 1, rarity: 'common', rarityName: 'Common' });
        }
      }
    }
  } catch (e) {}

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
  if (item.cleanse && hero.ailments) hero.ailments = {};
}
