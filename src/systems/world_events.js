// WorldEvents — periodic time-bound events that appear across eligible zones.
// Delegates persistence to WorldState; applies rewards through Economy.

const WorldEvents = (function() {
  'use strict';

  var MAX_ACTIVE = 3;
  var MAX_HISTORY = 20;
  var GENERATION_CADENCE = 60;
  var cadenceElapsed = 0;

  /* ---- Internal helpers ---- */

  function _getWorld() {
    if (typeof WorldState === 'undefined' || !WorldState.getWorld) return null;
    return WorldState.getWorld();
  }

  function _getTemplate(templateId) {
    if (typeof WORLD_EVENTS === 'undefined' || !Array.isArray(WORLD_EVENTS)) return null;
    for (var i = 0; i < WORLD_EVENTS.length; i++) {
      if (WORLD_EVENTS[i].id === templateId) return WORLD_EVENTS[i];
    }
    return null;
  }

  function _zoneEligible(zoneId) {
    if (typeof ZoneAccess === 'undefined' || !ZoneAccess.status) return true;
    var status = ZoneAccess.status(zoneId);
    return status && status.allowed;
  }

  function _hasActiveTemplate(active, templateId) {
    var keys = Object.keys(active);
    for (var i = 0; i < keys.length; i++) {
      var rec = active[keys[i]];
      if (rec && rec.templateId === templateId) return true;
    }
    return false;
  }

  function _isOnCooldown(template, resolved, now) {
    var keys = Object.keys(resolved);
    for (var i = 0; i < keys.length; i++) {
      var rec = resolved[keys[i]];
      if (!rec || typeof rec !== 'object') continue;
      if (rec.templateId !== template.id) continue;
      var ended = rec.resolvedAt || rec.expiredAt || 0;
      if (now - ended < (template.cooldown || 0) * 1000) return true;
    }
    return false;
  }

  /* ---- Public API ---- */

  /**
   * Pick an eligible template and activate a new event.
   * Returns the event id on success, null when no template is eligible or limit reached.
   * @param {number} [elapsed] — reserved; accepted for forward-compat, currently ignored.
   * @returns {string|null}
   */
  function generate(/* elapsed */) {
    var world = _getWorld();
    if (!world) return null;
    var active = world.events.active || {};
    var resolved = world.events.resolved || {};
    if (Object.keys(active).length >= MAX_ACTIVE) return null;

    var now = Date.now();
    if (typeof WORLD_EVENTS === 'undefined' || !Array.isArray(WORLD_EVENTS)) return null;

    var eligible = [];
    for (var i = 0; i < WORLD_EVENTS.length; i++) {
      var tpl = WORLD_EVENTS[i];
      if (_hasActiveTemplate(active, tpl.id)) continue;
      if (!_zoneEligible(tpl.zoneId)) continue;
      if (_isOnCooldown(tpl, resolved, now)) continue;
      eligible.push(tpl);
    }
    if (eligible.length === 0) return null;

    var pick = eligible[Math.floor(Math.random() * eligible.length)];
    var eventId = pick.id + '_' + now;
    var record = {
      templateId: pick.id,
      zoneId: pick.zoneId,
      startedAt: now,
      duration: pick.duration,
      status: 'active'
    };

    if (typeof WorldState === 'undefined' || !WorldState.setEventActive) return null;
    if (!WorldState.setEventActive(eventId, record)) return null;
    return eventId;
  }

  /**
   * Advance event timers. Events whose remaining time ≤ 0 (or ≤ elapsed) expire.
   * @param {number} elapsed — seconds since last tick (offline time)
   */
  function tick(elapsed) {
    var world = _getWorld();
    if (!world) return false;
    var active = world.events.active || {};
    var now = Date.now();
    var e = typeof elapsed === 'number' && isFinite(elapsed) ? Math.max(0, elapsed) : 0;
    var changed = false;

    var keys = Object.keys(active);
    for (var i = 0; i < keys.length; i++) {
      var eventId = keys[i];
      var rec = active[eventId];
      if (!rec || typeof rec !== 'object') continue;

      var start = Number(rec.startedAt);
      var dur = Number(rec.duration);
      if (!isFinite(start) || !isFinite(dur) || dur <= 0) continue;

      var remaining = start + dur * 1000 - now;
      if (remaining <= 0 || e * 1000 >= remaining) {
        if (typeof WorldState === 'undefined' || !WorldState.resolveEvent) continue;
        var expired = WorldState.resolveEvent(eventId, {
          templateId: rec.templateId,
          zoneId: rec.zoneId,
          startedAt: rec.startedAt,
          duration: rec.duration,
          result: 'expired',
          expiredAt: now
        });
        if (expired === true) changed = true;
      }
    }

    // Generation is deliberately cadence-bound so frame ticks cannot fill all
    // slots at once. Offline elapsed time uses the same path and may earn one
    // bounded attempt per cadence interval, while generate() retains all
    // eligibility, cooldown, and active-cap guards.
    cadenceElapsed += e;
    if (cadenceElapsed >= GENERATION_CADENCE) {
      cadenceElapsed -= GENERATION_CADENCE;
      if (generate(e) !== null) changed = true;
    }
    return changed;
  }

  /**
   * Resolve an active event — apply rewards, record outcome.
   * Returns true on success; false if the event is not active or already resolved.
   * @param {string} eventId
   * @returns {boolean}
   */
  function resolve(eventId) {
    if (typeof eventId !== 'string' || !eventId) return false;
    var world = _getWorld();
    if (!world) return false;
    var active = world.events.active || {};
    if (!Object.prototype.hasOwnProperty.call(active, eventId)) return false;

    var rec = active[eventId];
    if (!rec || typeof rec !== 'object') return false;

    // Guard against double-resolve: if already in resolved map, skip.
    var resolved = world.events.resolved || {};
    if (Object.prototype.hasOwnProperty.call(resolved, eventId)) return false;

    var template = _getTemplate(rec.templateId);
    var now = Date.now();

    // Apply rewards before recording the outcome.
    if (template && template.resolveReward) {
      var reward = template.resolveReward;
      if (typeof Economy !== 'undefined' && Economy.addGold && reward.gold) {
        Economy.addGold(reward.gold);
      }
      if (typeof Economy !== 'undefined' && Economy.addKarma && reward.karma) {
        Economy.addKarma(reward.karma);
      }
      if (typeof Economy !== 'undefined' && Economy.addDivineFragments && reward.divineFragments) {
        Economy.addDivineFragments(reward.divineFragments);
      }
    }

    var outcome = {
      templateId: rec.templateId,
      zoneId: rec.zoneId,
      startedAt: rec.startedAt,
      duration: rec.duration,
      result: 'resolved',
      resolvedAt: now,
      rewards: template ? (template.resolveReward || {}) : {}
    };

    if (typeof WorldState === 'undefined' || !WorldState.resolveEvent) return false;
    return WorldState.resolveEvent(eventId, outcome) === true;
  }

  /**
   * Return active events for a specific zone with computed remaining time.
   * @param {string} zoneId
   * @returns {Array}
   */
  function getForZone(zoneId) {
    if (typeof zoneId !== 'string' || !zoneId) return [];
    return getActive().filter(function(e) { return e.zoneId === zoneId; });
  }

  /**
   * Return all active events across every zone with remaining time and label data.
   * @returns {Array}
   */
  function getActive() {
    var world = _getWorld();
    if (!world) return [];
    var active = world.events.active || {};
    var now = Date.now();
    var result = [];
    var keys = Object.keys(active);

    for (var i = 0; i < keys.length; i++) {
      var eventId = keys[i];
      var rec = active[eventId];
      if (!rec || typeof rec !== 'object') continue;
      var start = Number(rec.startedAt);
      var dur = Number(rec.duration);
      if (!isFinite(start) || !isFinite(dur)) continue;

      var template = _getTemplate(rec.templateId);
      var entry = {
        id: eventId,
        templateId: rec.templateId,
        zoneId: rec.zoneId,
        startedAt: start,
        duration: dur,
        remainingTime: Math.max(0, start + dur * 1000 - now),
        status: rec.status || 'active'
      };
      if (template) {
        entry.label = template.label;
        entry.desc = template.desc;
        entry.icon = template.icon;
        entry.markerColor = template.markerColor;
        entry.expiryLabel = template.expiryLabel;
        entry.resolveLabel = template.resolveLabel;
        entry.resolveReward = template.resolveReward;
      }
      result.push(entry);
    }
    return result;
  }

  /**
   * Trim resolved history to at most MAX_HISTORY entries, keeping the most recent.
   * @returns {number} entries removed
   */
  function pruneHistory() {
    var world = _getWorld();
    if (!world) return 0;
    var resolved = world.events.resolved || {};
    var keys = Object.keys(resolved);
    if (keys.length <= MAX_HISTORY) return 0;

    var entries = [];
    for (var i = 0; i < keys.length; i++) {
      var rec = resolved[keys[i]];
      var sortKey = (rec && typeof rec === 'object')
        ? (rec.resolvedAt || rec.expiredAt || 0)
        : 0;
      entries.push({ eventId: keys[i], sortKey: sortKey });
    }

    entries.sort(function(a, b) { return b.sortKey - a.sortKey; });

    var removed = 0;
    for (var j = MAX_HISTORY; j < entries.length; j++) {
      delete resolved[entries[j].eventId];
      removed++;
    }
    return removed;
  }

  return {
    generate: generate,
    tick: tick,
    resolve: resolve,
    getForZone: getForZone,
    getActive: getActive,
    pruneHistory: pruneHistory,
    MAX_ACTIVE: MAX_ACTIVE,
    MAX_HISTORY: MAX_HISTORY
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WorldEvents };
}
