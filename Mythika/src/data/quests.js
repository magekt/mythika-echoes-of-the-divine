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
