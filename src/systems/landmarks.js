// Landmark discovery checks live game state and delegates persistence to WorldState.
const Landmarks = {};

Landmarks._getLandmark = function(landmarkId) {
  if (typeof landmarkId !== 'string' || !LANDMARKS[landmarkId]) return null;
  return LANDMARKS[landmarkId];
};

Landmarks._checkCondition = function(landmark) {
  if (!landmark || !landmark.discovery) return false;

  var condition = landmark.discovery;
  var params = condition.params || {};
  var progress = G.state.zoneProgress;
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) progress = {};

  switch (condition.type) {
    case 'zonePercentage':
      return (Number(progress[landmark.zoneId]) || 0) >= (Number(params.pct) || 0);
    case 'zoneComplete':
      return (Number(progress[landmark.zoneId]) || 0) >= 100;
    case 'flag':
      return !!(G.state.flags && params.key && G.state.flags[params.key]);
    default:
      return false;
  }
};

Landmarks.isDiscovered = function(landmarkId) {
  if (!this._getLandmark(landmarkId)) return false;
  var world = WorldState.getWorld();
  return Object.prototype.hasOwnProperty.call(world.landmarks.discovered, landmarkId);
};

Landmarks.tryDiscover = function(landmarkId) {
  var landmark = this._getLandmark(landmarkId);
  if (!landmark || this.isDiscovered(landmarkId)) return false;
  if (!this._checkCondition(landmark)) return false;

  return WorldState.recordLandmarkDiscovery(landmarkId, {
    id: landmarkId,
    zoneId: landmark.zoneId,
    discoveredAt: Date.now()
  });
};

Landmarks.checkZone = function(zoneId) {
  var landmarkIds = ZONE_LANDMARKS[zoneId] || [];
  var discovered = [];

  for (var i = 0; i < landmarkIds.length; i++) {
    if (this.tryDiscover(landmarkIds[i])) discovered.push(landmarkIds[i]);
  }

  return discovered;
};

Landmarks.getDiscovered = function(zoneId) {
  var world = WorldState.getWorld();
  var records = world.landmarks.discovered;
  var result = [];
  var landmarkIds = ZONE_LANDMARKS[zoneId] || [];

  for (var i = 0; i < landmarkIds.length; i++) {
    if (Object.prototype.hasOwnProperty.call(records, landmarkIds[i])) {
      result.push(landmarkIds[i]);
    }
  }

  return result;
};

Landmarks.getAll = function(zoneId) {
  var definitions = LandmarkDefs.getByZone(zoneId);
  var result = [];

  for (var i = 0; i < definitions.length; i++) {
    var landmark = definitions[i];
    // Living Zones (Phase 28, ZON-02): read-time oath-companion note.
    // Derived only — no persistence shape change; null when unbonded/absent.
    var bondNote = null;
    try {
      if (typeof LivingZones !== 'undefined' && LivingZones && typeof LivingZones.landmarkBondNote === 'function') {
        bondNote = LivingZones.landmarkBondNote(zoneId);
      } else if (typeof globalThis !== 'undefined' && globalThis.LivingZones && typeof globalThis.LivingZones.landmarkBondNote === 'function') {
        bondNote = globalThis.LivingZones.landmarkBondNote(zoneId);
      }
      if (typeof bondNote !== 'string') bondNote = null;
    } catch (e) {
      bondNote = null;
    }
    result.push({
      id: landmark.id,
      name: landmark.name,
      icon: landmark.icon,
      zoneId: landmark.zoneId,
      description: landmark.description,
      relevance: landmark.relevance,
      action: landmark.action,
      bondNote: bondNote,
      discovered: this.isDiscovered(landmark.id)
    });
  }

  return result;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Landmarks };
}
