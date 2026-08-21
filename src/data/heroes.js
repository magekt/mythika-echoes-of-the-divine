const HEROES = {
  arjuna: {
    id: 'arjuna', name: 'Arjuna', title: 'The Peerless Archer',
    weapon: 'Gandiva', weaponType: 'bow',
    hp: 80, mp: 30, str: 12, agi: 14, mag: 8, def: 8,
    ailment: 'rakta', ailmentName: 'Bleed',
    role: 'Ranged DPS',
    desc: 'Master archer of the Pandavas, wields the divine bow Gandiva.',
    skills: [
      { name: 'Gandiva Shot', desc: 'Powerful arrow that causes Bleed', dmg: 1.2, ailment: 'rakta', cost: 0 },
      { name: 'Rain of Arrows', desc: 'Barrage of arrows, high crit chance', dmg: 0.8, hits: 3, cost: 8 }
    ],
    signalSkill: { name: 'Pashupatastra', desc: 'The destroyer\'s arrow', dmg: 3.0 }
  },
  bhima: {
    id: 'bhima', name: 'Bhima', title: 'The Mighty',
    weapon: 'Gada', weaponType: 'mace',
    hp: 120, mp: 20, str: 18, agi: 6, mag: 4, def: 14,
    ailment: 'vajra', ailmentName: 'Stun',
    role: 'Tank',
    desc: 'The strongest of the Pandavas, wields the iron mace.',
    skills: [
      { name: 'Gada Slam', desc: 'Ground slam that Stuns enemies', dmg: 1.0, ailment: 'vajra', cost: 0 },
      { name: 'Iron Fortress', desc: 'Raise defense massively', dmg: 0, defBuff: 2.0, cost: 6 }
    ],
    signalSkill: { name: 'Vajra Gada', desc: 'Thunderous mace strike', dmg: 2.5 }
  },
  karna: {
    id: 'karna', name: 'Karna', title: 'The Sun Warrior',
    weapon: 'Vel', weaponType: 'spear',
    hp: 90, mp: 35, str: 14, agi: 10, mag: 12, def: 10,
    ailment: 'agni', ailmentName: 'Burn',
    role: 'Burst DPS',
    desc: 'Son of Surya, gifted with impenetrable armor and the divine spear.',
    skills: [
      { name: 'Vel Thrust', desc: 'Spear thrust that Burns', dmg: 1.1, ailment: 'agni', cost: 0 },
      { name: 'Solar Flare', desc: 'Sun-powered blast', dmg: 2.0, cost: 12 }
    ],
    signalSkill: { name: 'Vijaya Dhanush', desc: 'The bow of the gods', dmg: 3.5 }
  },
  draupadi: {
    id: 'draupadi', name: 'Draupadi', title: 'The Divine Queen',
    weapon: 'Mantra', weaponType: 'staff',
    hp: 70, mp: 50, str: 6, agi: 8, mag: 18, def: 6,
    ailment: 'shila', ailmentName: 'Freeze',
    role: 'Support Mage',
    desc: 'The queen of Indraprastha, blessed with divine wisdom and foresight.',
    skills: [
      { name: 'Mantra Bind', desc: 'Magical bind that Freezes', dmg: 1.0, ailment: 'shila', cost: 0, mag: true },
      { name: 'Divine Boon', desc: 'Heal party for 20% HP', dmg: -0.2, heal: 0.2, cost: 8, mag: true }
    ],
    signalSkill: { name: 'Panchali\'s Blessing', desc: 'Full party heal and buff', dmg: 0 }
  },
  hanuman: {
    id: 'hanuman', name: 'Hanuman', title: 'The Vanara Devotee',
    weapon: 'Gada', weaponType: 'mace',
    hp: 100, mp: 25, str: 16, agi: 16, mag: 6, def: 12,
    ailment: 'vajra', ailmentName: 'Stun',
    role: 'Agile Fighter',
    desc: 'The mighty vanara, devoted to Rama with unparalleled strength and speed.',
    skills: [
      { name: 'Mace Flurry', desc: 'Rapid mace strikes with high Stun chance', dmg: 0.9, ailment: 'vajra', hits: 2, cost: 0 },
      { name: 'Mountain Leap', desc: 'Leap attack dealing massive damage', dmg: 2.5, cost: 10 }
    ],
    signalSkill: { name: 'Vajra Deha', desc: 'Diamond body - immense damage', dmg: 4.0 }
  }
};

const HERO_IDS = Object.keys(HEROES);

function createHeroState(id) {
  const h = HEROES[id];
  const heroWeapon = Object.values(ITEMS.weapons).find(i => i.name === h.weapon);
  const heroArmor = ITEMS.armors.leather;
  const heroAcc = ITEMS.accessories.simpleAmulet;
  // Siddhi perks (ojas/prajna) scale base vitality and wisdom.
  const ojasMul = 1 + Progression.perkValue('ojas') / 100;
  const prajnaMul = 1 + Progression.perkValue('prajna') / 100;
  return {
    id: h.id, name: h.name, title: h.title,
    weapon: h.weapon, weaponType: h.weaponType,
    hp: Math.floor(h.hp * ojasMul), maxHp: Math.floor(h.hp * ojasMul),
    mp: h.mp, maxMp: h.mp,
    str: h.str, agi: h.agi, mag: Math.floor(h.mag * prajnaMul), def: h.def,
    ailment: h.ailment, ailmentName: h.ailmentName,
    role: h.role, desc: h.desc,
    skills: JSON.parse(JSON.stringify(h.skills)),
    signalSkill: { ...h.signalSkill },
    level: 1, xp: 0,
    weaponLvl: 1, armorLvl: 1, accessoryLvl: 1,
    weaponEquipped: heroWeapon ? { name: heroWeapon.name, atk: heroWeapon.atk, type: 'weapon', rarity: 'common', rarityName: 'Common' } : null,
    armorEquipped: heroArmor ? { name: heroArmor.name, def: heroArmor.def, type: 'armor', rarity: 'common', rarityName: 'Common' } : null,
    accessoryEquipped: heroAcc ? { name: heroAcc.name, mag: heroAcc.mag, type: 'accessory', rarity: 'common', rarityName: 'Common' } : null,
    equipAtk: 0,
    equipDef: 0,
    equipAccMag: 0,
    active: true
  };
}

function calcHeroStats(hero) {
  const lvlBonus = (hero.level - 1) * 0.1;
  const hpBonus = (hero.equipAccHp || 0);
  return {
    maxHp: Math.floor(hero.hp * (1 + lvlBonus) + hero.weaponLvl * 2 + hpBonus),
    maxMp: Math.floor(hero.mp * (1 + lvlBonus) + hero.accessoryLvl),
    str: Math.floor(hero.str * (1 + lvlBonus) + hero.weaponLvl * 0.5 + (hero.equipAtk || 0) * 0.5),
    agi: Math.floor(hero.agi * (1 + lvlBonus)),
    mag: Math.floor(hero.mag * (1 + lvlBonus) + hero.accessoryLvl * 0.5 + (hero.equipAccMag || 0) * 0.5 + (hero.equipArmorMag || 0) * 0.5),
    def: Math.floor(hero.def * (1 + lvlBonus) + hero.armorLvl * 0.8 + (hero.equipDef || 0) * 0.8 + (hero.equipAccDef || 0) * 0.8)
  };
}
