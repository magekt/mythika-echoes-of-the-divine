// Canonical discoverable landmarks for the six travel zones.
const LANDMARKS = {
  naradaStone: {
    id: 'naradaStone',
    name: "Narada's Whispering Stone",
    icon: '\uD83E\uDEA8',
    zoneId: 'aryavarta',
    description: 'A moss-covered stone hums with a verse once carried between mortal fields and celestial courts.',
    relevance: 'The stone marks the border where Narada taught travelers to hear creation as sacred song.',
    discovery: { type: 'zonePercentage', params: { pct: 25 } },
    action: null
  },
  forestSpirit: {
    id: 'forestSpirit',
    name: 'Yaksha of the Sacred Grove',
    icon: '\uD83C\uDF3F',
    zoneId: 'aryavarta',
    description: 'An ancient yaksha watches over a grove whose leaves remain green through drought and war.',
    relevance: 'Its patient vigil recalls the guardianship owed to every living boundary between settlement and wilderness.',
    discovery: { type: 'zoneComplete', params: {} },
    action: null
  },
  nagaFord: {
    id: 'nagaFord',
    name: "The Naga's Crossroads",
    icon: '\uD83D\uDC0D',
    zoneId: 'dandaka',
    description: 'Silver scales glimmer beneath the ford where a sovereign naga tests the intent of each traveler.',
    relevance: 'The crossing remembers whether passage was won through generosity or force.',
    discovery: { type: 'flag', params: { key: 'enc_nagaBargain' } },
    action: null
  },
  shadowAltar: {
    id: 'shadowAltar',
    name: 'Altar of Whispering Shadows',
    icon: '\uD83D\uDD25',
    zoneId: 'dandaka',
    description: 'A low altar burns without fuel while the forest shadows repeat half-finished vows.',
    relevance: 'Those who cross Dandaka learn that devotion can illuminate a path or deepen its darkness.',
    discovery: { type: 'zonePercentage', params: { pct: 50 } },
    action: null
  },
  elementalConfluence: {
    id: 'elementalConfluence',
    name: 'Confluence of Elements',
    icon: '\u26A1',
    zoneId: 'meru',
    description: 'Wind, flame, stone, and snow turn around one another without consuming the mountain path.',
    relevance: 'The confluence reflects Mount Meru as the still axis around which the worlds find balance.',
    discovery: { type: 'zonePercentage', params: { pct: 75 } },
    action: null
  },
  agniForge: {
    id: 'agniForge',
    name: "Agni's Hidden Forge",
    icon: '\uD83C\uDF0B',
    zoneId: 'meru',
    description: 'A sealed cavern radiates the warmth of a forge where no mortal hammer now falls.',
    relevance: 'Its enduring heat honors Agni as witness, messenger, and purifier of offerings.',
    discovery: { type: 'zoneComplete', params: {} },
    action: { type: 'info', label: 'The forge hums with residual heat' }
  },
  kaliyaPool: {
    id: 'kaliyaPool',
    name: "Kaliya's Deep Pool",
    icon: '\uD83D\uDC09',
    zoneId: 'patala',
    description: 'Dark waters spiral into an unseen depth, disturbed by the memory of immense coils.',
    relevance: 'The pool warns that poison mastered through courage can become a lesson rather than an ending.',
    discovery: { type: 'zonePercentage', params: { pct: 50 } },
    action: null
  },
  soulCrossing: {
    id: 'soulCrossing',
    name: 'Bridge of Forgotten Souls',
    icon: '\uD83D\uDC80',
    zoneId: 'patala',
    description: 'A narrow bridge spans a silent gulf where names rise like mist and vanish before dawn.',
    relevance: 'The crossing teaches that remembrance is an act of dharma owed even to the departed.',
    discovery: { type: 'zoneComplete', params: {} },
    action: null
  },
  indraThrone: {
    id: 'indraThrone',
    name: "Indra's Empty Throne",
    icon: '\uD83D\uDC51',
    zoneId: 'svarga',
    description: 'Cloud-white steps ascend to a radiant throne left empty beneath the rolling thunder.',
    relevance: 'The vacant seat reminds visitors that celestial authority is service, never possession alone.',
    discovery: { type: 'zonePercentage', params: { pct: 50 } },
    action: null
  },
  devaGate: {
    id: 'devaGate',
    name: 'Celestial Gate of the Deva',
    icon: '\uD83D\uDD49\uFE0F',
    zoneId: 'svarga',
    description: 'A gate of living light opens onto horizons that remain just beyond mortal sight.',
    relevance: 'Its threshold marks the difference between reaching heaven and becoming ready to understand it.',
    discovery: { type: 'zonePercentage', params: { pct: 75 } },
    action: { type: 'info', label: 'The gate shimmers but does not open' }
  },
  pralayaEmber: {
    id: 'pralayaEmber',
    name: 'Ember of the Dissolver',
    icon: '\uD83D\uDD25',
    zoneId: 'tapobhumi',
    description: 'A solitary ember consumes no wood, glowing with the promise that every form must change.',
    relevance: 'The ember frames dissolution not as ruin, but as the clearing from which another cycle begins.',
    discovery: { type: 'zonePercentage', params: { pct: 75 } },
    action: null
  },
  brahmaSight: {
    id: 'brahmaSight',
    name: "Brahma's Third Eye",
    icon: '\uD83D\uDC41\uFE0F',
    zoneId: 'tapobhumi',
    description: 'A natural opening in the peak reveals stars at noon and dawn within the same unblinking view.',
    relevance: 'The vantage honors disciplined insight: creation is perceived whole only after the self grows still.',
    discovery: { type: 'zoneComplete', params: {} },
    action: null
  }
};

const ZONE_LANDMARKS = {};
Object.keys(LANDMARKS).forEach(function(landmarkId) {
  var landmark = LANDMARKS[landmarkId];
  if (!ZONE_LANDMARKS[landmark.zoneId]) ZONE_LANDMARKS[landmark.zoneId] = [];
  ZONE_LANDMARKS[landmark.zoneId].push(landmarkId);
});

const LandmarkDefs = {
  getByZone: function(zoneId) {
    var landmarkIds = ZONE_LANDMARKS[zoneId] || [];
    return landmarkIds.map(function(landmarkId) {
      return LANDMARKS[landmarkId];
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LANDMARKS, ZONE_LANDMARKS, LandmarkDefs };
}
