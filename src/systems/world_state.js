const WorldState = {};

WorldState._unsafeKeys = {
  '__proto__': true,
  constructor: true,
  prototype: true
};

// Regional influence is bounded to [-100, 100]. Control is intentionally a
// small closed domain so later map presentation never needs to interpret
// arbitrary persisted labels.
WorldState._controlValues = {
  neutral: true,
  player: true,
  enemy: true,
  contested: true
};

WorldState._plainObject = function(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

WorldState._safeKey = function(key) {
  return typeof key === 'string' && key.length > 0 && !this._unsafeKeys[key];
};

WorldState._newObject = function() {
  return Object.create(null);
};

WorldState._cloneData = function(value, depth) {
  if (depth == null) depth = 0;
  if (depth > 20) return undefined;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (Array.isArray(value)) {
    const result = [];
    for (const entry of value) {
      const cloned = this._cloneData(entry, depth + 1);
      if (cloned !== undefined) result.push(cloned);
    }
    return result;
  }
  if (!this._plainObject(value)) return undefined;

  const result = this._newObject();
  for (const key of Object.keys(value)) {
    if (!this._safeKey(key)) continue;
    const cloned = this._cloneData(value[key], depth + 1);
    if (cloned !== undefined) result[key] = cloned;
  }
  return result;
};

WorldState._normalizeRecordMap = function(candidate) {
  const result = this._newObject();
  if (!this._plainObject(candidate)) return result;

  for (const key of Object.keys(candidate)) {
    if (!this._safeKey(key) || !this._plainObject(candidate[key])) continue;
    const cloned = this._cloneData(candidate[key]);
    if (cloned !== undefined) result[key] = cloned;
  }
  return result;
};

WorldState._normalizeValueMap = function(candidate) {
  const result = this._newObject();
  if (!this._plainObject(candidate)) return result;

  for (const key of Object.keys(candidate)) {
    if (!this._safeKey(key)) continue;
    const cloned = this._cloneData(candidate[key]);
    if (cloned !== undefined) result[key] = cloned;
  }
  return result;
};

WorldState._normalizeInfluence = function(candidate) {
  const result = this._newObject();
  if (!this._plainObject(candidate)) return result;

  for (const key of Object.keys(candidate)) {
    if (!this._safeKey(key) || !this._plainObject(candidate[key])) continue;
    const rawValue = candidate[key].value;
    const value = typeof rawValue === 'number' && Number.isFinite(rawValue)
      ? Math.max(-100, Math.min(100, rawValue))
      : 0;
    const rawControl = candidate[key].control;
    result[key] = {
      value: value,
      control: this._controlValues[rawControl] ? rawControl : 'neutral'
    };
  }
  return result;
};

WorldState.createDefault = function() {
  const world = this._newObject();
  const landmarks = this._newObject();
  const events = this._newObject();

  landmarks.discovered = this._newObject();
  landmarks.notified = this._newObject();
  events.active = this._newObject();
  events.resolved = this._newObject();
  world.regions = this._newObject();
  world.landmarks = landmarks;
  world.influence = this._newObject();
  world.narrativeEchoes = this._newObject();
  world.events = events;
  world.transitions = this._newObject();
  return world;
};

WorldState.normalize = function(candidate) {
  const source = this._plainObject(candidate) ? candidate : {};
  const landmarks = this._plainObject(source.landmarks) ? source.landmarks : {};
  const events = this._plainObject(source.events) ? source.events : {};
  const result = this.createDefault();

  result.regions = this._normalizeRecordMap(source.regions);
  result.landmarks.discovered = this._normalizeRecordMap(landmarks.discovered);
  result.landmarks.notified = this._normalizeRecordMap(landmarks.notified);
  result.influence = this._normalizeInfluence(source.influence);
  result.narrativeEchoes = this._normalizeValueMap(source.narrativeEchoes);
  result.events.active = this._normalizeRecordMap(events.active);
  result.events.resolved = this._normalizeRecordMap(events.resolved);
  result.transitions = this._normalizeRecordMap(source.transitions);
  return result;
};

WorldState._ensureWorld = function() {
  G.state.world = this.normalize(G.state.world);
  return G.state.world;
};

WorldState._metadata = function(metadata) {
  if (metadata === undefined) return this._newObject();
  if (!this._plainObject(metadata)) return null;
  return this._cloneData(metadata);
};

WorldState.getRegion = function(zoneId) {
  const world = G.state.world;
  if (!this._safeKey(zoneId) || !this._plainObject(world) || !this._plainObject(world.regions)) return null;
  return Object.prototype.hasOwnProperty.call(world.regions, zoneId) ? world.regions[zoneId] : null;
};

WorldState.recordLandmarkDiscovery = function(landmarkId, metadata) {
  if (!this._safeKey(landmarkId)) return false;
  const record = this._metadata(metadata);
  if (record === null) return false;
  const world = this._ensureWorld();
  if (Object.prototype.hasOwnProperty.call(world.landmarks.discovered, landmarkId)) return false;
  world.landmarks.discovered[landmarkId] = record;
  return true;
};

WorldState.markLandmarkNotified = function(landmarkId) {
  if (!this._safeKey(landmarkId)) return false;
  const world = this._ensureWorld();
  if (Object.prototype.hasOwnProperty.call(world.landmarks.notified, landmarkId)) return false;
  world.landmarks.notified[landmarkId] = this._newObject();
  return true;
};

WorldState.setInfluence = function(zoneId, value, control) {
  if (!this._safeKey(zoneId)) return false;
  const world = this._ensureWorld();
  const finiteValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  world.influence[zoneId] = {
    value: Math.max(-100, Math.min(100, finiteValue)),
    control: this._controlValues[control] ? control : 'neutral'
  };
  return true;
};

WorldState.setNarrativeEcho = function(echoId, value) {
  if (!this._safeKey(echoId)) return false;
  const cloned = this._cloneData(value);
  if (cloned === undefined) return false;
  this._ensureWorld().narrativeEchoes[echoId] = cloned;
  return true;
};

WorldState.setEventActive = function(eventId, record) {
  if (!this._safeKey(eventId)) return false;
  const cloned = this._metadata(record);
  if (cloned === null) return false;
  const world = this._ensureWorld();
  if (Object.prototype.hasOwnProperty.call(world.events.resolved, eventId)) return false;
  world.events.active[eventId] = cloned;
  return true;
};

WorldState.resolveEvent = function(eventId, outcome) {
  if (!this._safeKey(eventId)) return false;
  const cloned = this._metadata(outcome);
  if (cloned === null) return false;
  const world = this._ensureWorld();
  if (Object.prototype.hasOwnProperty.call(world.events.resolved, eventId)) return false;
  world.events.resolved[eventId] = cloned;
  delete world.events.active[eventId];
  return true;
};

WorldState.hasTransition = function(transitionId) {
  const world = G.state.world;
  return this._safeKey(transitionId) && this._plainObject(world) &&
    this._plainObject(world.transitions) &&
    Object.prototype.hasOwnProperty.call(world.transitions, transitionId);
};

WorldState.recordTransition = function(transitionId, metadata) {
  if (!this._safeKey(transitionId)) return false;
  const record = this._metadata(metadata);
  if (record === null) return false;
  const world = this._ensureWorld();
  if (Object.prototype.hasOwnProperty.call(world.transitions, transitionId)) return false;
  world.transitions[transitionId] = record;
  return true;
};
