const CLASS_DATA = {
  kshatriya: {
    id: 'kshatriya', name: 'Kshatriya', desc: 'Path of the Warrior',
    focus: 'Physical damage, high HP, tanking',
    startBonus: { str: 5, hp: 20 },
    eliteClasses: [
      { id: 'knight',    name: 'Knight',    desc: '+10% damage, +7.5% HP',        bonus: { dmgPct: 10, hpPct: 7.5 } },
      { id: 'assassin',  name: 'Assassin',  desc: '+12 AGI, +75 HP, first crit 2x', bonus: { agi: 12, hp: 75, firstCrit2x: true } },
      { id: 'gladiator', name: 'Gladiator', desc: '+15% CRIT rate, +10% ATK',       bonus: { critPct: 15, dmgPct: 10 } },
      { id: 'warlord',   name: 'Warlord',   desc: '+15% max HP for whole party',    bonus: { partyHpPct: 15 } }
    ]
  },
  rishi: {
    id: 'rishi', name: 'Rishi', desc: 'Path of the Sage',
    focus: 'Magic damage, high MP, spells',
    startBonus: { mag: 5, mp: 20 },
    eliteClasses: [
      { id: 'darkWizard', name: 'Dark Wizard', desc: '+75% spell damage (1/combat)', bonus: { spellDmgPct: 75 } },
      { id: 'lightWizard',name: 'Light Wizard',desc: '+1 Magic Milestone',           bonus: { magicMilestone: 1 } },
      { id: 'elementalist',name:'Elementalist',desc: '+20% elemental spell damage',  bonus: { elementalDmgPct: 20 } },
      { id: 'mystic',     name: 'Mystic',     desc: 'Ailments last 2 turns longer',   bonus: { ailmentDuration: 2 } }
    ]
  },
  yogi: {
    id: 'yogi', name: 'Yogi', desc: 'Path of the Mystic',
    focus: 'Hybrid, balanced stats, versatility',
    startBonus: { str: 3, mag: 3 },
    eliteClasses: [
      { id: 'battleWizard',name:'Battle Wizard',desc:'Dual cast while using weapon', bonus: { dualCast: true } },
      { id: 'paladin',    name: 'Paladin', desc: 'Dual cast while healing',        bonus: { healDualCast: true } },
      { id: 'guardian',   name: 'Guardian', desc: '+20% DEF, heal 10% HP each turn', bonus: { defPct: 20, regenHpPct: 10 } },
      { id: 'sage',       name: 'Sage',     desc: '+30% MP, MP regen in combat',      bonus: { mpPct: 30, mpRegen: 1 } }
    ]
  }
};
