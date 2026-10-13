// BOND_EVENTS — 3-event bond arc per hero (recruit / crisis / oath).
// Classic-script global, same entry shape as ENCOUNTERS so encounterScene
// builders render them without forks. Bond scenes trigger ONLY via
// BondSystem.bondAvailable / completeBond — NEVER add these ids to ENCOUNTERS
// or zone/travel pools.

var BOND_EVENTS = {
  bond_arjuna_recruit: {
    id: 'bond_arjuna_recruit', heroId: 'arjuna', arc: 'recruit', tierReq: null, bondEvent: true,
    name: 'Arjuna Joins the Cause', icon: '🏹',
    prompt: 'Arjuna lowers the great bow Gandiva and bows. "My aim has always been true, but an archer alone is only half a battle. Let me stand beside you, and judge my vow by my deeds."',
    choices: [
      { text: 'Welcome him as a brother-in-arms', preview: 'Arjuna +2 bond', reward: {}, affinity: { arjuna: 2 }, flags: { bond_arjuna_recruit: true } },
      { text: 'Ask him to teach the camp archery', preview: 'Arjuna +1 bond', reward: {}, affinity: { arjuna: 1 }, flags: { bond_arjuna_recruit: true } }
    ]
  },
  bond_arjuna_crisis: {
    id: 'bond_arjuna_crisis', heroId: 'arjuna', arc: 'crisis', tierReq: 'Trusted', bondEvent: true,
    name: "The Archer's Doubt", icon: '🏹',
    prompt: 'Before a moonlit grove Arjuna confesses his doubt: his arrows never miss, yet he fears striking without wisdom. "When the line between duty and pride blurs, how does a warrior choose?"',
    choices: [
      { text: 'Remind him duty guides the bow', preview: 'Arjuna +4 bond', reward: {}, affinity: { arjuna: 4 }, flags: { bond_arjuna_crisis: true } },
      { text: 'Offer quiet counsel by the fire', preview: 'Arjuna +2 bond', reward: {}, affinity: { arjuna: 2 }, flags: { bond_arjuna_crisis: true } }
    ]
  },
  bond_arjuna_oath: {
    id: 'bond_arjuna_oath', heroId: 'arjuna', arc: 'oath', tierReq: 'Sworn', bondEvent: true,
    name: "Oath of the Gandiva", icon: '🏹',
    prompt: 'Beneath a banner of dawn Arjuna raises Gandiva. "Not as master nor servant, but as comrade — I vow my arrows shall guard this company through every field we cross."',
    choices: [
      { text: 'Swear the oath of comradeship', preview: 'Arjuna +4 bond', reward: {}, affinity: { arjuna: 4 }, flags: { bond_arjuna_oath: true } },
      { text: 'Clasp his arm in fellowship', preview: 'Arjuna +1 bond', reward: {}, affinity: { arjuna: 1 }, flags: { bond_arjuna_oath: true } }
    ]
  },
  bond_bhima_recruit: {
    id: 'bond_bhima_recruit', heroId: 'bhima', arc: 'recruit', tierReq: null, bondEvent: true,
    name: 'Bhima Joins the Cause', icon: '🔨',
    prompt: 'Bhima plants his iron gada in the earth with a laugh that shakes the leaves. "Strength means little unless it shields others. Point me at the burden no one else can lift."',
    choices: [
      { text: 'Welcome his strength to the company', preview: 'Bhima +2 bond', reward: {}, affinity: { bhima: 2 }, flags: { bond_bhima_recruit: true } },
      { text: 'Ask him to guard the camp kitchen', preview: 'Bhima +1 bond', reward: {}, affinity: { bhima: 1 }, flags: { bond_bhima_recruit: true } }
    ]
  },
  bond_bhima_crisis: {
    id: 'bond_bhima_crisis', heroId: 'bhima', arc: 'crisis', tierReq: 'Trusted', bondEvent: true,
    name: 'Strength and Gentleness', icon: '🔨',
    prompt: 'After a battle Bhima sits apart, his great hands trembling. "I broke the enemy line — and a farmer\u2019s cart besides. When is strength a shelter, and when is it a storm?"',
    choices: [
      { text: 'Teach him the gentle guard stance', preview: 'Bhima +4 bond', reward: {}, affinity: { bhima: 4 }, flags: { bond_bhima_crisis: true } },
      { text: 'Share a meal and steady words', preview: 'Bhima +2 bond', reward: {}, affinity: { bhima: 2 }, flags: { bond_bhima_crisis: true } }
    ]
  },
  bond_bhima_oath: {
    id: 'bond_bhima_oath', heroId: 'bhima', arc: 'oath', tierReq: 'Sworn', bondEvent: true,
    name: 'Oath of the Shield', icon: '🔨',
    prompt: 'Bhima kneels and sets his gada across his knees. "I vow by bread shared and battles borne: while I stand, no comrade of this company shall fall alone."',
    choices: [
      { text: 'Swear the oath of comradeship', preview: 'Bhima +4 bond', reward: {}, affinity: { bhima: 4 }, flags: { bond_bhima_oath: true } },
      { text: 'Clasp his shoulder in fellowship', preview: 'Bhima +1 bond', reward: {}, affinity: { bhima: 1 }, flags: { bond_bhima_oath: true } }
    ]
  },
  bond_karna_recruit: {
    id: 'bond_karna_recruit', heroId: 'karna', arc: 'recruit', tierReq: null, bondEvent: true,
    name: 'Karna Joins the Cause', icon: '☀️',
    prompt: 'Karna of the sun-gifted armor regards you steadily. "The world weighed my birth and found it wanting. Weigh instead my spear and my word — both are yours if you will have them."',
    choices: [
      { text: 'Honor his word above his birth', preview: 'Karna +2 bond', reward: {}, affinity: { karna: 2 }, flags: { bond_karna_recruit: true } },
      { text: 'Ask him to drill the spear line', preview: 'Karna +1 bond', reward: {}, affinity: { karna: 1 }, flags: { bond_karna_recruit: true } }
    ]
  },
  bond_karna_crisis: {
    id: 'bond_karna_crisis', heroId: 'karna', arc: 'crisis', tierReq: 'Trusted', bondEvent: true,
    name: 'Loyalty and Giving', icon: '☀️',
    prompt: 'Karna holds his divine spear, torn between an old debt of loyalty and the company he now keeps. "Generosity is easy; faithfulness is hard. Tell me where a giver\u2019s duty truly lies."',
    choices: [
      { text: 'Counsel loyalty to the present company', preview: 'Karna +4 bond', reward: {}, affinity: { karna: 4 }, flags: { bond_karna_crisis: true } },
      { text: 'Listen through the night watch', preview: 'Karna +2 bond', reward: {}, affinity: { karna: 2 }, flags: { bond_karna_crisis: true } }
    ]
  },
  bond_karna_oath: {
    id: 'bond_karna_oath', heroId: 'karna', arc: 'oath', tierReq: 'Sworn', bondEvent: true,
    name: 'Oath of the Sun', icon: '☀️',
    prompt: 'At sunrise Karna lifts his spear to Surya\u2019s light. "As the sun gives without favor, I vow my strength to this company — a comrade\u2019s loyalty, freely given and never counted."',
    choices: [
      { text: 'Swear the oath of comradeship', preview: 'Karna +4 bond', reward: {}, affinity: { karna: 4 }, flags: { bond_karna_oath: true } },
      { text: 'Stand witness in fellowship', preview: 'Karna +1 bond', reward: {}, affinity: { karna: 1 }, flags: { bond_karna_oath: true } }
    ]
  },
  bond_draupadi_recruit: {
    id: 'bond_draupadi_recruit', heroId: 'draupadi', arc: 'recruit', tierReq: null, bondEvent: true,
    name: 'Draupadi Joins the Cause', icon: '👑',
    prompt: 'Draupadi, queen of resolve, meets your gaze without flinching. "I have seen courts fall silent before injustice. I bring counsel, foresight, and a will that does not bend."',
    choices: [
      { text: 'Welcome her counsel to the council', preview: 'Draupadi +2 bond', reward: {}, affinity: { draupadi: 2 }, flags: { bond_draupadi_recruit: true } },
      { text: 'Ask her to bless the company', preview: 'Draupadi +1 bond', reward: {}, affinity: { draupadi: 1 }, flags: { bond_draupadi_recruit: true } }
    ]
  },
  bond_draupadi_crisis: {
    id: 'bond_draupadi_crisis', heroId: 'draupadi', arc: 'crisis', tierReq: 'Trusted', bondEvent: true,
    name: 'Trial of Resolve', icon: '👑',
    prompt: 'Draupadi speaks of the day her question shook a silent court. "Resolve without wisdom is fire without a hearth. Help me temper mine, that it warms rather than burns."',
    choices: [
      { text: 'Vow the company will never stay silent', preview: 'Draupadi +4 bond', reward: {}, affinity: { draupadi: 4 }, flags: { bond_draupadi_crisis: true } },
      { text: 'Keep vigil and hear her counsel', preview: 'Draupadi +2 bond', reward: {}, affinity: { draupadi: 2 }, flags: { bond_draupadi_crisis: true } }
    ]
  },
  bond_draupadi_oath: {
    id: 'bond_draupadi_oath', heroId: 'draupadi', arc: 'oath', tierReq: 'Sworn', bondEvent: true,
    name: 'Oath of Resolve', icon: '👑',
    prompt: 'Draupadi binds a simple cord around her wrist. "By this knot I vow: my wisdom and my courage belong to this company. We rise together, or not at all — comrades to the end."',
    choices: [
      { text: 'Swear the oath of comradeship', preview: 'Draupadi +4 bond', reward: {}, affinity: { draupadi: 4 }, flags: { bond_draupadi_oath: true } },
      { text: 'Bow in fellowship to her vow', preview: 'Draupadi +1 bond', reward: {}, affinity: { draupadi: 1 }, flags: { bond_draupadi_oath: true } }
    ]
  },
  bond_hanuman_recruit: {
    id: 'bond_hanuman_recruit', heroId: 'hanuman', arc: 'recruit', tierReq: null, bondEvent: true,
    name: 'Hanuman Joins the Cause', icon: '🐒',
    prompt: 'Hanuman lands with a thunderclap laugh, mountain-dust on his shoulders. "Where the righteous march, this vanara follows. Name the peak, and I shall move it."',
    choices: [
      { text: 'Welcome his devotion to the march', preview: 'Hanuman +2 bond', reward: {}, affinity: { hanuman: 2 }, flags: { bond_hanuman_recruit: true } },
      { text: 'Ask him to scout the high passes', preview: 'Hanuman +1 bond', reward: {}, affinity: { hanuman: 1 }, flags: { bond_hanuman_recruit: true } }
    ]
  },
  bond_hanuman_crisis: {
    id: 'bond_hanuman_crisis', heroId: 'hanuman', arc: 'crisis', tierReq: 'Trusted', bondEvent: true,
    name: 'Devotion Tested', icon: '🐒',
    prompt: 'Hanuman, who once leapt an ocean for another\u2019s cause, grows quiet. "Devotion is simple when the master is near. Teach me to serve this company with the same whole heart when the road is long."',
    choices: [
      { text: 'Entrust him with the company\u2019s banner', preview: 'Hanuman +4 bond', reward: {}, affinity: { hanuman: 4 }, flags: { bond_hanuman_crisis: true } },
      { text: 'Chant with him at dawn', preview: 'Hanuman +2 bond', reward: {}, affinity: { hanuman: 2 }, flags: { bond_hanuman_crisis: true } }
    ]
  },
  bond_hanuman_oath: {
    id: 'bond_hanuman_oath', heroId: 'hanuman', arc: 'oath', tierReq: 'Sworn', bondEvent: true,
    name: 'Oath of Devotion', icon: '🐒',
    prompt: 'Hanuman beats his chest once, gently, and smiles. "Strength, speed, and life itself — all are lent to me. I lend them in turn to this company, as comrade and guardian, now and always."',
    choices: [
      { text: 'Swear the oath of comradeship', preview: 'Hanuman +4 bond', reward: {}, affinity: { hanuman: 4 }, flags: { bond_hanuman_oath: true } },
      { text: 'Embrace him as a brother-in-arms', preview: 'Hanuman +1 bond', reward: {}, affinity: { hanuman: 1 }, flags: { bond_hanuman_oath: true } }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BOND_EVENTS: BOND_EVENTS };
}
