const Influence = {};

Influence._defaultState = function() {
  return { value: 0, control: 'neutral' };
};

Influence._copyState = function(state) {
  return {
    value: typeof state.value === 'number' && Number.isFinite(state.value) ? state.value : 0,
    control: typeof state.control === 'string' ? state.control : 'neutral'
  };
};

Influence._transitionId = function(actionType, actionId, zoneId) {
  return actionType + ':' + actionId + (zoneId ? ':' + zoneId : '');
};

Influence._controlFor = function(value, thresholds) {
  const entries = Object.keys(thresholds || {}).map(function(threshold) {
    return { value: Number(threshold), control: thresholds[threshold] };
  }).filter(function(entry) {
    return Number.isFinite(entry.value);
  }).sort(function(a, b) {
    return a.value - b.value;
  });

  if (!entries.length) return 'neutral';
  const magnitude = Math.abs(value);
  if (value < 0 && magnitude >= entries[0].value) return 'enemy';
  if (value < 0) return 'neutral';

  let control = 'neutral';
  for (const entry of entries) {
    if (value >= entry.value) control = entry.control;
  }
  return control;
};

Influence._zoneName = function(zoneId) {
  if (typeof ZONES !== 'undefined' && ZONES[zoneId] && ZONES[zoneId].name) {
    return ZONES[zoneId].name;
  }
  return zoneId;
};

Influence._actionName = function(actionType, actionId) {
  const labels = {
    zone_complete: 'zone complete',
    boss_defeat: 'boss defeat',
    encounter_choice: 'encounter choice',
    journey_complete: 'journey complete'
  };
  return (labels[actionType] || actionType) + ' (' + actionId + ')';
};

Influence._notify = function(actionType, actionId, zoneId, delta, fromControl, toControl) {
  if (typeof Notify === 'undefined' || !Notify || typeof Notify.show !== 'function') return;
  const sign = delta >= 0 ? '+' : '';
  let message = this._zoneName(zoneId) + ' influence ' + sign + delta;
  if (fromControl !== toControl) {
    message += ' — shifted to ' + toControl.charAt(0).toUpperCase() + toControl.slice(1);
  }
  message += ' from ' + this._actionName(actionType, actionId);
  Notify.show(message, 3);
};

Influence.applyAction = function(actionType, actionId, zoneId) {
  if (typeof WorldState === 'undefined' || typeof INFLUENCE_RULES === 'undefined') {
    return { changed: false };
  }

  const transitionId = this._transitionId(actionType, actionId, zoneId);
  if (WorldState.hasTransition(transitionId)) return { changed: false };

  const rule = INFLUENCE_RULES.getRule(actionType, actionId);
  if (!rule || (zoneId && zoneId !== rule.zoneId)) return { changed: false };

  const from = this.getInfluence(rule.zoneId);
  const value = Math.max(-100, Math.min(100, from.value + rule.delta));
  const control = this._controlFor(value, rule.thresholds);
  const to = { value: value, control: control };

  if (!WorldState.setInfluence(rule.zoneId, to.value, to.control)) return { changed: false };

  const metadata = {
    actionType: actionType,
    actionId: actionId,
    zoneId: rule.zoneId,
    delta: rule.delta,
    from: from,
    to: to
  };
  if (!WorldState.recordTransition(transitionId, metadata)) {
    WorldState.setInfluence(rule.zoneId, from.value, from.control);
    return { changed: false };
  }

  this._notify(actionType, actionId, rule.zoneId, rule.delta, from.control, to.control);
  return {
    changed: true,
    zoneId: rule.zoneId,
    from: from,
    to: to,
    delta: rule.delta
  };
};

Influence.getInfluence = function(zoneId) {
  if (typeof WorldState === 'undefined' || !WorldState || typeof WorldState.getWorld !== 'function') {
    return this._defaultState();
  }
  const world = WorldState.getWorld();
  if (!world.influence || !Object.prototype.hasOwnProperty.call(world.influence, zoneId)) {
    return this._defaultState();
  }
  return this._copyState(world.influence[zoneId]);
};

Influence.getControl = function(zoneId) {
  return this.getInfluence(zoneId).control;
};

Influence.getHistory = function(zoneId) {
  if (typeof WorldState === 'undefined' || !WorldState || typeof WorldState.getWorld !== 'function') return [];
  const transitions = WorldState.getWorld().transitions || {};
  const history = [];

  for (const transitionId of Object.keys(transitions)) {
    const metadata = transitions[transitionId];
    if (!metadata || metadata.zoneId !== zoneId) continue;
    history.push(Object.assign({ transitionId: transitionId }, metadata));
  }
  return history;
};

if (typeof window !== 'undefined') {
  window.Influence = Influence;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Influence };
}
