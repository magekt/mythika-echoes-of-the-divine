const JOURNEYS = {
  arjunaResolve: {
    id: 'arjunaResolve',
    name: "Arjuna's Hesitation",
    desc: 'The Gandiva trembles before the first arrow. Face your doubt.',
    icon: '\u2694',
    hero: 'arjuna',
    personal: 'hero',
    nodes: [
      { id: 'n1', prompt: 'On the eve of battle, Krishna asks: will you strike for duty or for glory?', choices: [
        { text: 'For duty (Dharma)', next: 'n2a', reward: { karma: 2, xp: 100 }, auraHint: 'turtleShell' },
        { text: 'For glory (Kirti)', next: 'n2b', reward: { gold: 80, xp: 80 }, auraHint: 'lionsMight' }
      ]},
      { id: 'n2a', prompt: 'Discipline steadies your breath. A stillness answers.', choices: [
        { text: 'Embrace stillness', next: null, reward: { karma: 3, prana: 50 }, unlockAura: 'mountainStill' }
      ]},
      { id: 'n2b', prompt: 'The crowd roars in your mind. Power surges.', choices: [
        { text: 'Unleash it', next: null, reward: { gold: 120, xp: 150 }, unlockAura: 'lionsMight' }
      ]}
    ]
  },
  karnaburden: {
    id: 'karnaburden',
    name: "Karna's Armor",
    desc: 'Born with divine armor, burdened by a cursed vow.',
    icon: '\u2600',
    hero: 'karna',
    personal: 'hero',
    nodes: [
      { id: 'n1', prompt: 'Surya whispers: shed the Kavacha to gain freedom, or keep it and endure?', choices: [
        { text: 'Shed it — be free', next: 'n2a', reward: { agi: 2, karma: 2 } },
        { text: 'Keep it — endure', next: 'n2b', reward: { def: 3, hp: 15 } }
      ]},
      { id: 'n2a', prompt: 'Light pours from your skin. The burden lifts.', choices: [{ text: 'Rise anew', next: null, reward: { xp: 200, prana: 40 }, unlockAura: 'craneGrace' }]},
      { id: 'n2b', prompt: 'The metal fuses to your soul, unbreakable.', choices: [{ text: 'Stand firm', next: null, reward: { def: 4, hp: 20 }, unlockAura: 'turtleShell' }]}
    ]
  },
  covenantKshatriya: {
    id: 'covenantKshatriya',
    name: 'Oath of the Kshatriya',
    desc: 'The blade chooses a master. Prove your path.',
    icon: '\u2694',
    personal: 'class',
    path: 'kshatriya',
    nodes: [
      { id: 'n1', prompt: 'A rival challenges your honor. How do you answer?', choices: [
        { text: 'Challenge head-on', next: 'n2a', reward: { str: 2 } },
        { text: 'Set a trap', next: 'n2b', reward: { agi: 2 } }
      ]},
      { id: 'n2a', prompt: 'Steel meets steel. Your lineage watches.', choices: [{ text: 'Claim victory', next: null, reward: { karma: 2, xp: 150 }, unlockAura: 'tigersFury' }]},
      { id: 'n2b', prompt: 'Cunning wins the day, but whispers follow.', choices: [{ text: 'Accept the whispers', next: null, reward: { gold: 100, xp: 120 }, unlockAura: 'wolfPack' }]}
    ]
  },
  covenantRishi: {
    id: 'covenantRishi',
    name: 'Vow of the Rishi',
    desc: 'Mantras coil like serpents. Choose your study.',
    icon: '\u2727',
    personal: 'class',
    path: 'rishi',
    nodes: [
      { id: 'n1', prompt: 'Two scrolls: Agni (fire) and Soma (healing). Which do you unroll?', choices: [
        { text: 'Agni — to burn', next: 'n2a', reward: { mag: 2 } },
        { text: 'Soma — to heal', next: 'n2b', reward: { hp: 10, mp: 5 } }
      ]},
      { id: 'n2a', prompt: 'Flame writes itself across your palms.', choices: [{ text: 'Breathe fire', next: null, reward: { xp: 150 }, unlockAura: 'phoenixFlame' }]},
      { id: 'n2b', prompt: 'The lotus opens. Your touch cools fevers.', choices: [{ text: 'Heal the ashram', next: null, reward: { karma: 3, prana: 40 }, unlockAura: 'lotusRegen' }]}
    ]
  },
  beastWolfPact: {
    id: 'beastWolfPact',
    name: 'Pact of the Shadow Wolf',
    desc: 'Your wolf circles you — not as pet, but as mirror.',
    icon: '\u2603',
    personal: 'beast',
    beast: 'wolf',
    nodes: [
      { id: 'n1', prompt: 'The wolf offers its teeth. Do you take the hunt?', choices: [
        { text: 'Run with it', next: 'n2a', reward: { agi: 1, xp: 80 } },
        { text: 'Tame it', next: 'n2b', reward: { def: 2, hp: 10 } }
      ]},
      { id: 'n2a', prompt: 'You move as one. The forest blurs.', choices: [{ text: 'Howl together', next: null, reward: { karma: 2 }, evolveBoost: 'wolf' }]},
      { id: 'n2b', prompt: 'It bows, eyes amber and loyal.', choices: [{ text: 'Bind the pact', next: null, reward: { gold: 80 }, evolveBoost: 'wolf' }]}
    ]
  },
  paramuktaPilgrimage: {
    id: 'paramuktaPilgrimage',
    name: 'Pilgrimage Beyond Mukta',
    desc: 'Beyond liberation, the Tapobhumi burns. Will you walk it barefoot?',
    icon: '\u262F',
    personal: 'realm',
    realm: 'paramukta',
    nodes: [
      { id: 'n1', prompt: 'Tapobhumi asks a price: your memories or your strength?', choices: [
        { text: 'Give memories (-200 XP, +karma)', next: 'n2a', reward: { karma: 5, xp: -200 } },
        { text: 'Give strength (-10 HP)', next: 'n2b', reward: { hp: -10, karma: 3 } }
      ]},
      { id: 'n2a', prompt: 'Names fade, but purpose sharpens.', choices: [{ text: 'Step forward', next: null, reward: { prana: 100, divineFragments: 3 } }]},
      { id: 'n2b', prompt: 'Your knees bleed, the ground remembers.', choices: [{ text: 'Endure', next: null, reward: { def: 2, hp: 10, divineFragments: 3 } }]}
    ]
  },
  karmicCrossroads: {
    id: 'karmicCrossroads',
    name: 'Karmic Crossroads',
    desc: 'Every ten levels, the thread of fate frays.',
    icon: '\u2630',
    personal: 'level',
    minLevel: 10,
    nodes: [
      { id: 'n1', prompt: 'A child steals bread. The guard seeks justice. You intervene — how?', choices: [
        { text: 'Mercy (Karma path)', next: 'n2a', reward: { karma: 4, gold: -30 } },
        { text: 'Wrath (Gold path)', next: 'n2b', reward: { gold: 120, karma: -2 } }
      ]},
      { id: 'n2a', prompt: 'The child bows. A debt of gratitude is born.', choices: [{ text: 'Bless them', next: null, reward: { xp: 150, prana: 30 } }]},
      { id: 'n2b', prompt: 'Coin clinks. The guard looks away.', choices: [{ text: 'Walk away', next: null, reward: { gold: 80, xp: 100 } }]}
    ]
  }
};

function getAvailableJourneys(state) {
  const list = [];
  for (const j of Object.values(JOURNEYS)) {
    if (j.hero && state.player && state.player.id !== j.hero) continue;
    if (j.path) {
      const cls = state.player && (state.player.classId || state.player.className);
      // classId like 'kshatriya' — allow partial match
      if (!cls || !cls.toLowerCase().includes(j.path)) continue;
    }
    if (j.beast) {
      const has = (state.spiritBeasts || []).some(b => b.id === j.beast || b.evolutionForm === j.beast);
      if (!has) continue;
    }
    if (j.realm && state.realm !== j.realm) {
      // allow if realm progress indicates near unlock? keep strict for now
      continue;
    }
    if (j.minLevel && (!state.player || state.player.level < j.minLevel)) continue;
    list.push(j);
  }
  // Always show crossroads after Lv10, tapobhumi after Mukta
  return list;
}
