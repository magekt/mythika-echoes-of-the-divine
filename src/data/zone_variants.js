// Living Zones variant table (Phase 28, ZON-01) — companion-gated encounter
// variants scaled by zone size and story fit. Small zones carry 1 variant,
// medium zones 2, large zones 3. Each variant names its story-relevant hero
// (or beast where fitting) and points at a standard base encounter for the
// same zone. Below-threshold players keep the standard encounter plus a
// teased hint — gating never blocks. No new zone IDs: only encounter IDs.
//
// Entries are appended into ENCOUNTERS at load (same object reuse as bonds.js
// precedent). Gating is enforced by encounterAvailable() via bondReq.

const ZONE_VARIANTS = [
  // --- aryavarta (small, 1): Bhima, Trusted 25, base rishiBoon ---
  {
    id: 'lz_aryavarta_bhima',
    name: "Bhima's Field Oath",
    icon: '🛡️',
    pool: 'zone',
    zones: ['aryavarta'],
    weight: 6,
    lvlMin: 5, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'bhima', affinityMin: 25 },
    baseId: 'rishiBoon',
    prompt: 'The rishi looks past you to Bhima and smiles. "Your bond walks beside you, strong one. Let the plains themselves witness what loyalty has grown here."',
    choices: [
      {
        text: 'Stand together in the field',
        preview: 'Gain experience and deepen Bhima\u2019s bond',
        reward: { xp: 140, gold: 40 },
        affinity: { bhima: 4 },
        flags: { 'enc_lz_aryavarta_bhima': 'stand' }
      },
      {
        text: 'Accept the rishi\u2019s grain blessing',
        preview: 'Gain gold and karma',
        reward: { gold: 90, karma: 2, xp: 60 },
        flags: { 'enc_lz_aryavarta_bhima': 'grain' }
      }
    ]
  },
  // --- tapobhumi (small, 1): Karna, Sworn 50, base tapasPilgrim ---
  {
    id: 'lz_tapobhumi_karna',
    name: "Karna's Ember Vigil",
    icon: '🔥',
    pool: 'zone',
    zones: ['tapobhumi'],
    weight: 6,
    lvlMin: 15, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'karna', affinityMin: 50 },
    baseId: 'tapasPilgrim',
    prompt: 'The pilgrim\u2019s fire bends toward Karna as if recognizing an old sun. "The sworn one carries dawn in his chest," the pilgrim murmurs. "Sit, and let austerity honor austerity."',
    choices: [
      {
        text: 'Keep the vigil with Karna',
        preview: 'Gain cultivation base and deepen Karna\u2019s bond',
        reward: { cultivationBase: 18, prana: 60, xp: 120 },
        affinity: { karna: 4 },
        flags: { 'enc_lz_tapobhumi_karna': 'vigil' }
      },
      {
        text: 'Offer water to the flames',
        preview: 'Gain karma and gold',
        reward: { karma: 3, gold: 60, xp: 60 },
        flags: { 'enc_lz_tapobhumi_karna': 'water' }
      }
    ]
  },
  // --- meru (medium, 2) ---
  {
    id: 'lz_meru_karna',
    name: "Karna's Summit Counsel",
    icon: '☀️',
    pool: 'zone',
    zones: ['meru'],
    weight: 6,
    lvlMin: 5, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'karna', affinityMin: 25 },
    baseId: 'rishiBoon',
    prompt: 'High on the mountain path, the rishi greets Karna by name. "The sun\u2019s son climbs with a trusted friend. Hear my counsel, both of you, for the peak tests pairs, not princes."',
    choices: [
      {
        text: 'Receive counsel together',
        preview: 'Gain prana, experience, deepen Karna\u2019s bond',
        reward: { prana: 90, xp: 130 },
        affinity: { karna: 4 },
        flags: { 'enc_lz_meru_karna': 'counsel' }
      },
      {
        text: 'Ask for mountain protection',
        preview: 'Gain defense and karma',
        reward: { def: 2, karma: 2, xp: 60 },
        flags: { 'enc_lz_meru_karna': 'protection' }
      }
    ]
  },
  {
    id: 'lz_meru_arjuna',
    name: "Arjuna's Riddle Answer",
    icon: '🏹',
    pool: 'zone',
    zones: ['meru'],
    weight: 6,
    lvlMin: 10, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'arjuna', affinityMin: 50 },
    baseId: 'yakshaRiddle',
    prompt: 'The yaksha\u2019s gem-crown turns toward Arjuna. "The peerless archer walks sworn beside you. Then let my riddle be worthy: answer for two, and be rewarded for two."',
    choices: [
      {
        text: 'Answer as one bond',
        preview: 'Gain gold, experience, deepen Arjuna\u2019s bond',
        reward: { gold: 130, xp: 160 },
        affinity: { arjuna: 4 },
        flags: { 'enc_lz_meru_arjuna': 'answered' }
      },
      {
        text: 'Admit the riddle defeats you',
        preview: 'Gain karma and a small gift',
        reward: { karma: 3, prana: 40, xp: 50 },
        flags: { 'enc_lz_meru_arjuna': 'humbled' }
      }
    ]
  },
  // --- svarga (medium, 2) ---
  {
    id: 'lz_svarga_hanuman',
    name: "Hanuman's Celestial Leap",
    icon: '🐒',
    pool: 'zone',
    zones: ['svarga'],
    weight: 6,
    lvlMin: 10, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'hanuman', affinityMin: 25 },
    baseId: 'yakshaRiddle',
    prompt: 'The yaksha laughs aloud as Hanuman lands lightly beside you. "The ocean-leaper graces Svarga! Trusted friend of a trusted friend — my gems shine brighter for it."',
    choices: [
      {
        text: 'Match wits with the yaksha',
        preview: 'Gain gold, experience, deepen Hanuman\u2019s bond',
        reward: { gold: 130, xp: 160 },
        affinity: { hanuman: 4 },
        flags: { 'enc_lz_svarga_hanuman': 'wits' }
      },
      {
        text: 'Bow to celestial honesty',
        preview: 'Gain karma and prana',
        reward: { karma: 3, prana: 40, xp: 50 },
        flags: { 'enc_lz_svarga_hanuman': 'bow' }
      }
    ]
  },
  {
    id: 'lz_svarga_draupadi',
    name: "Draupadi's Radiant Court",
    icon: '✨',
    pool: 'zone',
    zones: ['svarga'],
    weight: 6,
    lvlMin: 5, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'draupadi', affinityMin: 50 },
    baseId: 'devaBlessing',
    prompt: 'The deva descends, then pauses, beholding Draupadi. "The queen walks sworn beside you, and heaven itself stands straighter. Choose, favored pair — my blessing doubles in such company."',
    choices: [
      {
        text: 'Blessing of vitality, shared',
        preview: 'Restore health, deepen Draupadi\u2019s bond',
        reward: { hp: 35, maxHp: 10, xp: 90 },
        affinity: { draupadi: 4 },
        flags: { 'enc_lz_svarga_draupadi': 'vitality' }
      },
      {
        text: 'Blessing of fortune, shared',
        preview: 'Gain gold and karma',
        reward: { gold: 90, karma: 2, xp: 90 },
        flags: { 'enc_lz_svarga_draupadi': 'fortune' }
      }
    ]
  },
  // --- dandaka (large, 3) ---
  {
    id: 'lz_dandaka_arjuna',
    name: "Arjuna's Ford Compact",
    icon: '🐍',
    pool: 'zone',
    zones: ['dandaka'],
    weight: 6,
    lvlMin: 1, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'arjuna', affinityMin: 25 },
    baseId: 'nagaBargain',
    prompt: 'The great naga regards Arjuna\u2019s bow with respect. "The archer\u2019s trusted friend carries no hidden sting. For such company, my ford asks a gentler price."',
    choices: [
      {
        text: 'Seal the compact with gold',
        preview: 'Lose 40 gold, gain karma, experience, deepen Arjuna\u2019s bond',
        reward: { gold: -40, karma: 3, xp: 70 },
        affinity: { arjuna: 4 },
        flags: { 'enc_lz_dandaka_arjuna': 'compact' }
      },
      {
        text: 'Demand passage as before',
        preview: 'Press past for gold and experience',
        reward: { xp: 90, gold: 30 },
        flags: { 'enc_lz_dandaka_arjuna': 'force' }
      }
    ]
  },
  {
    id: 'lz_dandaka_draupadi',
    name: "Draupadi's Shadow Refusal",
    icon: '🔥',
    pool: 'zone',
    zones: ['dandaka'],
    weight: 6,
    lvlMin: 8, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'draupadi', affinityMin: 25 },
    baseId: 'asuraWhisper',
    prompt: 'The asura\u2019s smoke recoils from Draupadi\u2019s gaze. "The queen\u2019s trusted friend will not be bought," it hisses. "Then hear my offer, and let her witness your answer."',
    choices: [
      {
        text: 'Refuse beside Draupadi',
        preview: 'Gain karma, prana, deepen Draupadi\u2019s bond',
        reward: { karma: 4, prana: 50, xp: 60 },
        affinity: { draupadi: 4 },
        flags: { 'enc_lz_dandaka_draupadi': 'refused' }
      },
      {
        text: 'Accept the dark blessing',
        preview: 'Gain strength but lose karma',
        reward: { str: 3, karma: -3, xp: 100 },
        flags: { 'enc_lz_dandaka_draupadi': 'accepted' }
      }
    ]
  },
  {
    id: 'lz_dandaka_wolf',
    name: "Shadow Wolf's Grove Pact",
    icon: '🐺',
    pool: 'zone',
    zones: ['dandaka'],
    weight: 6,
    lvlMin: 10, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { beast: 'wolf', heartMin: 2 },
    baseId: 'nagaElder',
    prompt: 'The naga elder emerges — and stills, for your Shadow Wolf pads forward, moonlit and calm. "The pack walks with the honored," the elder breathes. "My gratitude runs deeper than the river."',
    choices: [
      {
        text: 'Accept the elder\u2019s treasure',
        preview: 'Gain a rare item and karma',
        reward: { karma: 5, xp: 220, item: 'naga_scale' },
        flags: { 'enc_lz_dandaka_wolf': 'treasure' }
      },
      {
        text: 'Ask for the pack\u2019s strength',
        preview: 'Gain strength and experience',
        reward: { str: 2, xp: 160 },
        flags: { 'enc_lz_dandaka_wolf': 'strength' }
      }
    ]
  },
  // --- patala (large, 3) ---
  {
    id: 'lz_patala_draupadi',
    name: "Draupadi's Underworld Lamp",
    icon: '🪔',
    pool: 'zone',
    zones: ['patala'],
    weight: 6,
    lvlMin: 8, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'draupadi', affinityMin: 25 },
    baseId: 'asuraWhisper',
    prompt: 'In the lightless deep, Draupadi\u2019s presence burns like a temple lamp. The whispering asura falters. "Even Patala cannot dim the queen\u2019s trusted friend. Choose — and choose in her light."',
    choices: [
      {
        text: 'Refuse in her light',
        preview: 'Gain karma, prana, deepen Draupadi\u2019s bond',
        reward: { karma: 4, prana: 50, xp: 60 },
        affinity: { draupadi: 4 },
        flags: { 'enc_lz_patala_draupadi': 'refused' }
      },
      {
        text: 'Accept the dark blessing',
        preview: 'Gain strength but lose karma',
        reward: { str: 3, karma: -3, xp: 100 },
        flags: { 'enc_lz_patala_draupadi': 'accepted' }
      }
    ]
  },
  {
    id: 'lz_patala_karna',
    name: "Karna's Serpent Debt",
    icon: '🐍',
    pool: 'zone',
    zones: ['patala'],
    weight: 6,
    lvlMin: 10, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { hero: 'karna', affinityMin: 50 },
    baseId: 'nagaElder',
    prompt: 'The naga elder rises higher at the sight of Karna. "The sun-warrior\u2019s sworn friend once showed mercy at my ford. The deep remembers. Pray, and take from my hoard."',
    choices: [
      {
        text: 'Pray for mercy with Karna',
        preview: 'Gain a rare item, karma, deepen Karna\u2019s bond',
        reward: { karma: 5, xp: 220, item: 'naga_scale' },
        affinity: { karna: 4 },
        flags: { 'enc_lz_patala_karna': 'mercy' }
      },
      {
        text: 'Ask for strength',
        preview: 'Gain strength and experience',
        reward: { str: 2, xp: 160 },
        flags: { 'enc_lz_patala_karna': 'strength' }
      }
    ]
  },
  {
    id: 'lz_patala_serpent',
    name: "Iron Serpent's Coil Oath",
    icon: '🐍',
    pool: 'zone',
    zones: ['patala'],
    weight: 6,
    lvlMin: 8, lvlMax: 99,
    karmaMin: null, karmaMax: null,
    flagsReq: {},
    bondReq: { beast: 'serpent', heartMin: 2 },
    baseId: 'asuraWhisper',
    prompt: 'Your Iron Serpent uncoils, scales ringing like temple bells, and the whispering asura draws back. "Blood of the deep stands against me," it snarls. "Then the dark offers more — or nothing."',
    choices: [
      {
        text: 'Stand with the serpent',
        preview: 'Gain karma, prana, and experience',
        reward: { karma: 4, prana: 50, xp: 70 },
        flags: { 'enc_lz_patala_serpent': 'stand' }
      },
      {
        text: 'Accept the dark blessing',
        preview: 'Gain strength but lose karma',
        reward: { str: 3, karma: -3, xp: 100 },
        flags: { 'enc_lz_patala_serpent': 'accepted' }
      }
    ]
  }
];

(function registerZoneVariants() {
  try {
    if (typeof ENCOUNTERS === 'undefined' || !ENCOUNTERS || typeof ENCOUNTERS !== 'object') return;
    for (const v of ZONE_VARIANTS) {
      if (!v || typeof v.id !== 'string') continue;
      if (Object.prototype.hasOwnProperty.call(ENCOUNTERS, v.id)) continue;
      ENCOUNTERS[v.id] = v;
    }
  } catch (e) {}
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ZONE_VARIANTS };
}
