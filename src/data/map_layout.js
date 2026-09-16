const ZONE_STATE = Object.freeze({
  LOCKED:     'locked',     // reqZone not completed or reqLevel not met
  AVAILABLE:  'available',  // accessible, not yet started or in progress
  ACTIVE:     'active',     // currently being explored (zoneProgress > 0 and < 100)
  COMPLETED:  'completed'   // zoneProgress >= 100
});

const MapLayout = {
  ZONE_STATE: ZONE_STATE,

  ENTRIES: [
    {
      zoneId: 'aryavarta',
      name: 'Aryavarta Grasslands',
      realm: 'manushya',
      x: 0.15,
      y: 0.08,
      w: 0.70,
      h: 0.11,
      color: '#c8a84e',
      textColor: '#f5f0e8',
      connections: ['dandaka'],
      landmarkId: null
    },
    {
      zoneId: 'dandaka',
      name: 'Dandaka Forest',
      realm: 'sadhaka',
      x: 0.20,
      y: 0.23,
      w: 0.70,
      h: 0.11,
      color: '#3a7d44',
      textColor: '#f5f0e8',
      connections: ['meru'],
      landmarkId: null
    },
    {
      zoneId: 'meru',
      name: 'Mount Meru',
      realm: 'yogi',
      x: 0.15,
      y: 0.38,
      w: 0.70,
      h: 0.11,
      color: '#4a6fa5',
      textColor: '#f5f0e8',
      connections: ['patala'],
      landmarkId: null
    },
    {
      zoneId: 'patala',
      name: 'Patala (Underworld)',
      realm: 'siddha',
      x: 0.20,
      y: 0.53,
      w: 0.70,
      h: 0.11,
      color: '#8b446a',
      textColor: '#f5f0e8',
      connections: ['svarga'],
      landmarkId: null
    },
    {
      zoneId: 'svarga',
      name: 'Svarga (Celestial)',
      realm: 'mukta',
      x: 0.15,
      y: 0.68,
      w: 0.70,
      h: 0.11,
      color: '#c471ed',
      textColor: '#f5f0e8',
      connections: ['tapobhumi'],
      landmarkId: null
    },
    {
      zoneId: 'tapobhumi',
      name: 'Tapobhumi (Austerity)',
      realm: 'mukta',
      x: 0.20,
      y: 0.83,
      w: 0.70,
      h: 0.11,
      color: '#f368e0',
      textColor: '#f5f0e8',
      connections: [],
      landmarkId: null
    }
  ],

  getEntry(zoneId) {
    if (!zoneId) return undefined;
    return this.ENTRIES.find(entry => entry.zoneId === zoneId);
  },

  getEntries() {
    return this.ENTRIES;
  }
};

if (typeof window !== 'undefined') {
  window.MapLayout = MapLayout;
  window.ZONE_STATE = ZONE_STATE;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MapLayout, ZONE_STATE };
}
