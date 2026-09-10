const QUEST_CHAINS = {
  aryavarta: [
    {
      id: 'chain_ary_beginner',
      name: 'Aryavarta Initiation',
      desc: 'Prove your worth in the grasslands',
      steps: [
        { id: 'ary_step1', name: 'First Blood', desc: 'Defeat 3 bandits', type: 'kill', target: 'bandit', count: 3, reward: { gold: 20, xp: 30 } },
        { id: 'ary_step2', name: 'Wolf Pack', desc: 'Defeat 5 wolves', type: 'kill', target: 'wolf', count: 5, reward: { gold: 40, xp: 60 } },
        { id: 'ary_step3', name: 'Spider Nest', desc: 'Defeat 3 giant spiders', type: 'kill', target: 'giantSpider', count: 3, reward: { gold: 60, xp: 100 } }
      ],
      finalReward: { gold: 100, xp: 200, karma: 2, item: 'uncommon_weapon' }
    },
    {
      id: 'chain_ary_hunter',
      name: 'Grassland Hunter',
      desc: 'Master the hunt in Aryavarta',
      prerequisite: 'chain_ary_beginner',
      steps: [
        { id: 'ary_hunt1', name: 'Boar Hunt', desc: 'Defeat 4 wild boars', type: 'kill', target: 'wildBoar', count: 4, reward: { gold: 50, xp: 80 } },
        { id: 'ary_hunt2', name: 'Serpent Clearing', desc: 'Defeat 5 snakes', type: 'kill', target: 'snake', count: 5, reward: { gold: 60, xp: 100 } },
        { id: 'ary_hunt3', name: 'Chieftain Challenge', desc: 'Defeat the Rakshasa Chieftain', type: 'boss', target: 'rakshasa', count: 1, reward: { gold: 150, xp: 250 } }
      ],
      finalReward: { gold: 200, xp: 400, karma: 3, item: 'rare_weapon' }
    }
  ],
  dandaka: [
    {
      id: 'chain_dan_explorer',
      name: 'Forest Explorer',
      desc: 'Navigate the dangers of Dandaka',
      prerequisite: 'chain_ary_hunter',
      steps: [
        { id: 'dan_exp1', name: 'Wraith Watch', desc: 'Defeat 3 wraiths', type: 'kill', target: 'wraith', count: 3, reward: { gold: 60, xp: 100 } },
        { id: 'dan_exp2', name: 'Elf Trouble', desc: 'Defeat 4 dark elves', type: 'kill', target: 'darkElf', count: 4, reward: { gold: 80, xp: 140 } },
        { id: 'dan_exp3', name: 'Shadow Mage', desc: 'Defeat 3 shadow mages', type: 'kill', target: 'shadowMage', count: 3, reward: { gold: 100, xp: 180 } }
      ],
      finalReward: { gold: 250, xp: 500, karma: 3, item: 'rare_armor' }
    },
    {
      id: 'chain_dan_guardian',
      name: 'Forest Guardian',
      desc: 'Become protector of Dandaka',
      prerequisite: 'chain_dan_explorer',
      steps: [
        { id: 'dan_guard1', name: 'Treant Trial', desc: 'Defeat 3 treants', type: 'kill', target: 'treant', count: 3, reward: { gold: 100, xp: 200 } },
        { id: 'dan_guard2', name: 'Naga Hunt', desc: 'Defeat 4 nagas', type: 'kill', target: 'naga', count: 4, reward: { gold: 120, xp: 240 } },
        { id: 'dan_guard3', name: 'Prince Falls', desc: 'Defeat the Dark Elf Prince', type: 'boss', target: 'darkElf', count: 1, reward: { gold: 250, xp: 400 } }
      ],
      finalReward: { gold: 400, xp: 800, karma: 4, item: 'rare_accessory' }
    }
  ],
  meru: [
    {
      id: 'chain_mer_ascend',
      name: 'Meru Ascension',
      desc: 'Climb the cosmic peak',
      prerequisite: 'chain_dan_guardian',
      steps: [
        { id: 'mer_asc1', name: 'Asura Assault', desc: 'Defeat 5 asura warriors', type: 'kill', target: 'asuraWarrior', count: 5, reward: { gold: 150, xp: 300 } },
        { id: 'mer_asc2', name: 'Orc Siege', desc: 'Defeat 4 orcs', type: 'kill', target: 'orc', count: 4, reward: { gold: 180, xp: 350 } },
        { id: 'mer_asc3', name: 'Ogre Slayer', desc: 'Defeat 3 ogres', type: 'kill', target: 'ogre', count: 3, reward: { gold: 200, xp: 400 } }
      ],
      finalReward: { gold: 500, xp: 1000, karma: 5, item: 'legendary_weapon' }
    },
    {
      id: 'chain_mer_elemental',
      name: 'Elemental Mastery',
      desc: 'Conquer the elemental trials',
      prerequisite: 'chain_mer_ascend',
      steps: [
        { id: 'mer_elem1', name: 'Frost Challenge', desc: 'Defeat 3 ice elementals', type: 'kill', target: 'iceElemental', count: 3, reward: { gold: 200, xp: 400 } },
        { id: 'mer_elem2', name: 'Fire Trial', desc: 'Defeat 3 fire elementals', type: 'kill', target: 'fireElemental', count: 3, reward: { gold: 220, xp: 450 } },
        { id: 'mer_elem3', name: 'Dragon\'s End', desc: 'Defeat the Emerald Dragon', type: 'boss', target: 'dragonEmerald', count: 1, reward: { gold: 500, xp: 800 } }
      ],
      finalReward: { gold: 800, xp: 1500, karma: 6, item: 'legendary_armor' }
    }
  ],
  patala: [
    {
      id: 'chain_pat_descent',
      name: 'Underworld Descent',
      desc: 'Brave the depths of Patala',
      prerequisite: 'chain_mer_elemental',
      steps: [
        { id: 'pat_desc1', name: 'Asura Purge', desc: 'Defeat 4 asura lords', type: 'kill', target: 'asura', count: 4, reward: { gold: 250, xp: 500 } },
        { id: 'pat_desc2', name: 'Hellhound Hunt', desc: 'Defeat 5 hell hounds', type: 'kill', target: 'hellHound', count: 5, reward: { gold: 280, xp: 550 } },
        { id: 'pat_desc3', name: 'Succubus Slaying', desc: 'Defeat 3 succubi', type: 'kill', target: 'succubus', count: 3, reward: { gold: 300, xp: 600 } }
      ],
      finalReward: { gold: 1000, xp: 2000, karma: 7, item: 'legendary_accessory' }
    },
    {
      id: 'chain_pat_serpent',
      name: 'Serpent King',
      desc: 'Challenge the ruler of Patala',
      prerequisite: 'chain_pat_descent',
      steps: [
        { id: 'pat_serp1', name: 'Naga purge', desc: 'Defeat 4 nagas', type: 'kill', target: 'naga', count: 4, reward: { gold: 350, xp: 700 } },
        { id: 'pat_serp2', name: 'Rakshasa Elite', desc: 'Defeat 3 elite rakshasa', type: 'kill', target: 'rakshasa', count: 3, reward: { gold: 400, xp: 800 } },
        { id: 'pat_serp3', name: 'Kaliya\'s Fall', desc: 'Defeat Kaliya, the Serpent King', type: 'boss', target: 'kaliya', count: 1, reward: { gold: 800, xp: 1500 } }
      ],
      finalReward: { gold: 1500, xp: 3000, karma: 10, item: 'legendary_weapon' }
    }
  ],
  svarga: [
    {
      id: 'chain_svg_celestial',
      name: 'Celestial Ascent',
      desc: 'Enter the realm of the devas',
      prerequisite: 'chain_pat_serpent',
      steps: [
        { id: 'svg_asc1', name: 'Guardian Trial', desc: 'Defeat 5 celestial guardians', type: 'kill', target: 'celestialGuardian', count: 5, reward: { gold: 500, xp: 1000 } },
        { id: 'svg_asc2', name: 'Deva Downfall', desc: 'Defeat 4 fallen devas', type: 'kill', target: 'fallenDeva', count: 4, reward: { gold: 600, xp: 1200 } },
        { id: 'svg_asc3', name: 'Apsara Ascension', desc: 'Defeat 3 dark apsaras', type: 'kill', target: 'darkApsara', count: 3, reward: { gold: 700, xp: 1400 } }
      ],
      finalReward: { gold: 2000, xp: 5000, karma: 15, item: 'legendary_weapon' }
    },
    {
      id: 'chain_svg_godslayer',
      name: 'Godslayer',
      desc: 'Challenge Indra himself',
      prerequisite: 'chain_svg_celestial',
      steps: [
        { id: 'svg_god1', name: 'Seraphim Slaying', desc: 'Defeat 3 seraphim', type: 'kill', target: 'seraphim', count: 3, reward: { gold: 800, xp: 1800 } },
        { id: 'svg_god2', name: 'Vishnu\'s Test', desc: 'Defeat 2 vishnu duta', type: 'kill', target: 'vishnuDuta', count: 2, reward: { gold: 1000, xp: 2000 } },
        { id: 'svg_god3', name: 'Storm Lord Falls', desc: 'Defeat Indra, the Storm Lord', type: 'boss', target: 'indra', count: 1, reward: { gold: 2000, xp: 5000 } }
      ],
      finalReward: { gold: 5000, xp: 10000, karma: 25, item: 'legendary_accessory' }
    }
  ],
  tapobhumi: [
    {
      id: 'chain_tapo_austerity',
      name: 'Austerity Trial',
      desc: 'Endure the burning ground',
      prerequisite: 'chain_svg_godslayer',
      steps: [
        { id: 'tapo_aust1', name: 'Tapasvi Trial', desc: 'Defeat 5 ascetic tapasvi', type: 'kill', target: 'tapasvi', count: 5, reward: { gold: 1200, xp: 2500 } },
        { id: 'tapo_aust2', name: 'Rudra Hunt', desc: 'Defeat 4 rudra sentinels', type: 'kill', target: 'rudra', count: 4, reward: { gold: 1500, xp: 3000 } },
        { id: 'tapo_aust3', name: 'Brahma Path', desc: 'Defeat 3 brahmarishi adepts', type: 'kill', target: 'brahmarishi', count: 3, reward: { gold: 1800, xp: 3500 } }
      ],
      finalReward: { gold: 6000, xp: 12000, karma: 30, item: 'legendary_weapon' }
    },
    {
      id: 'chain_tapo_dissolution',
      name: 'Pralaya Dissolution',
      desc: 'Face the dissolver of worlds',
      prerequisite: 'chain_tapo_austerity',
      steps: [
        { id: 'tapo_dis1', name: 'Herald Hunt', desc: 'Defeat 3 mahadeva heralds', type: 'kill', target: 'mahadeva', count: 3, reward: { gold: 2000, xp: 4000 } },
        { id: 'tapo_dis2', name: 'Seraphim Remnant', desc: 'Defeat 3 seraphim', type: 'kill', target: 'seraphim', count: 3, reward: { gold: 2500, xp: 5000 } },
        { id: 'tapo_dis3', name: 'Pralaya Falls', desc: 'Defeat Pralaya, the Dissolver', type: 'boss', target: 'pralaya', count: 1, reward: { gold: 5000, xp: 12000 } }
      ],
      finalReward: { gold: 10000, xp: 20000, karma: 50, item: 'legendary_accessory' }
    }
  ]
};

const QUESTS = {
  aryavarta: [
    { id: 'ary_kill_bandits', name: 'Bandit Bane', desc: 'Defeat 5 bandits in Aryavarta', type: 'kill', target: 'bandit', count: 5, reward: { gold: 30, xp: 50, karma: 1 } },
    { id: 'ary_kill_wolves', name: 'Wolf Hunter', desc: 'Defeat 3 wolves in Aryavarta', type: 'kill', target: 'wolf', count: 3, reward: { gold: 20, xp: 40 } },
    { id: 'ary_kill_spiders', name: 'Spider Nest', desc: 'Defeat 3 giant spiders in Aryavarta', type: 'kill', target: 'giantSpider', count: 3, reward: { gold: 40, xp: 60, karma: 1 } },
    { id: 'ary_kill_rakshasa', name: 'Chieftain Down', desc: 'Defeat the Rakshasa Chieftain', type: 'boss', target: 'rakshasa', count: 1, reward: { gold: 100, xp: 150, karma: 2 } },
    { id: 'ary_collect_hp', name: 'Herb Gathering', desc: 'Collect 5 HP Potions', type: 'collect', target: 'HP Potion', count: 5, reward: { gold: 30, xp: 30 } }
  ],
  dandaka: [
    { id: 'dan_kill_wraiths', name: 'Wraith Warden', desc: 'Defeat 5 wraiths in Dandaka', type: 'kill', target: 'wraith', count: 5, reward: { gold: 50, xp: 80, karma: 1 } },
    { id: 'dan_kill_elves', name: 'Elven Menace', desc: 'Defeat 3 dark elves in Dandaka', type: 'kill', target: 'darkElf', count: 3, reward: { gold: 60, xp: 100 } },
    { id: 'dan_kill_nagas', name: 'Serpent Slayer', desc: 'Defeat 4 nagas in Dandaka', type: 'kill', target: 'naga', count: 4, reward: { gold: 70, xp: 110, karma: 1 } },
    { id: 'dan_kill_boss', name: 'Prince of Darkness', desc: 'Defeat the Dark Elf Prince', type: 'boss', target: 'darkElf', count: 1, reward: { gold: 150, xp: 200, karma: 2, df: 1 } },
    { id: 'dan_reach_realm', name: 'Path of Sadhaka', desc: 'Reach Sadhaka realm', type: 'realm', target: 'sadhaka', count: 1, reward: { gold: 100, xp: 150, karma: 1 } }
  ],
  meru: [
    { id: 'mer_kill_asura', name: 'Asura Annihilation', desc: 'Defeat 5 asura warriors on Meru', type: 'kill', target: 'asuraWarrior', count: 5, reward: { gold: 100, xp: 200, karma: 1 } },
    { id: 'mer_kill_ogres', name: 'Ogre Exterminator', desc: 'Defeat 3 ogres on Meru', type: 'kill', target: 'ogre', count: 3, reward: { gold: 120, xp: 220 } },
    { id: 'mer_kill_orcs', name: 'Orc Clearing', desc: 'Defeat 4 orcs on Meru', type: 'kill', target: 'orc', count: 4, reward: { gold: 110, xp: 200, karma: 1 } },
    { id: 'mer_kill_dragon', name: 'Dragon Slayer', desc: 'Defeat the Emerald Dragon', type: 'boss', target: 'dragonEmerald', count: 1, reward: { gold: 300, xp: 500, karma: 3, df: 2 } },
    { id: 'mer_reach_realm', name: 'Yogi Ascent', desc: 'Reach Yogi realm', type: 'realm', target: 'yogi', count: 1, reward: { gold: 200, xp: 300, karma: 2 } }
  ],
  patala: [
    { id: 'pat_kill_asura', name: 'Underworld Purge', desc: 'Defeat 5 asura in Patala', type: 'kill', target: 'asura', count: 5, reward: { gold: 150, xp: 300, karma: 1 } },
    { id: 'pat_kill_naga', name: 'Naga Nightmare', desc: 'Defeat 4 nagas in Patala', type: 'kill', target: 'naga', count: 4, reward: { gold: 160, xp: 320 } },
    { id: 'pat_kill_rakshasa', name: 'Rakshasa Rampage', desc: 'Defeat 4 rakshasa elites in Patala', type: 'kill', target: 'rakshasa', count: 4, reward: { gold: 170, xp: 340, karma: 1 } },
    { id: 'pat_kill_boss', name: 'Lord of the Pit', desc: 'Defeat Kaliya, the Serpent King', type: 'boss', target: 'kaliya', count: 1, reward: { gold: 400, xp: 600, karma: 3, df: 3 } },
    { id: 'pat_reach_realm', name: 'Siddha Aspirant', desc: 'Reach Siddha realm', type: 'realm', target: 'siddha', count: 1, reward: { gold: 300, xp: 400, karma: 2 } }
  ],
  svarga: [
    { id: 'svg_kill_guardian', name: 'Heavenly Trial', desc: 'Defeat 5 celestial guardians', type: 'kill', target: 'celestialGuardian', count: 5, reward: { gold: 250, xp: 500, karma: 2 } },
    { id: 'svg_kill_deva', name: 'Deva Downfall', desc: 'Defeat 4 fallen devas in Svarga', type: 'kill', target: 'fallenDeva', count: 4, reward: { gold: 300, xp: 550 } },
    { id: 'svg_kill_apsara', name: 'Apsara Ascension', desc: 'Defeat 3 dark apsaras', type: 'kill', target: 'darkApsara', count: 3, reward: { gold: 350, xp: 600, karma: 2 } },
    { id: 'svg_kill_boss', name: 'Godslayer', desc: 'Defeat Indra, the Storm Lord', type: 'boss', target: 'indra', count: 1, reward: { gold: 800, xp: 1000, karma: 5, df: 5 } },
    { id: 'svg_reach_realm', name: 'Mukta Ascension', desc: 'Reach Mukta realm', type: 'realm', target: 'mukta', count: 1, reward: { gold: 500, xp: 800, karma: 3 } }
  ],
  tapobhumi: [
    { id: 'tap_kill_tapasvi', name: 'Ascetic Purge', desc: 'Defeat 5 ascetic tapasvi in Tapobhumi', type: 'kill', target: 'tapasvi', count: 5, reward: { gold: 400, xp: 800, karma: 3 } },
    { id: 'tap_kill_rudra', name: 'Storm Sentinel', desc: 'Defeat 4 rudra sentinels in Tapobhumi', type: 'kill', target: 'rudra', count: 4, reward: { gold: 450, xp: 900, karma: 3 } },
    { id: 'tap_kill_mahadeva', name: 'Herald Hunt', desc: 'Defeat 3 mahadeva heralds in Tapobhumi', type: 'kill', target: 'mahadeva', count: 3, reward: { gold: 500, xp: 1000, karma: 4 } },
    { id: 'tap_kill_boss', name: 'Dissolver Falls', desc: 'Defeat Pralaya, the Dissolver', type: 'boss', target: 'pralaya', count: 1, reward: { gold: 1200, xp: 2000, karma: 8, df: 8 } },
    { id: 'tap_reach_realm', name: 'Paramukta Awakening', desc: 'Reach Paramukta realm', type: 'realm', target: 'paramukta', count: 1, reward: { gold: 800, xp: 1500, karma: 5 } }
  ]
};

function getZoneQuests(zoneId) {
  return QUESTS[zoneId] || [];
}

function getAllQuests() {
  const all = [];
  for (const zoneId of Object.keys(QUESTS)) {
    for (const q of QUESTS[zoneId]) {
      all.push(q);
    }
  }
  return all;
}
